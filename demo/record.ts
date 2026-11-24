// Records demo/index.html with recdr, copies the recording into
// src/assets/demo/ and writes demo/story.json. Run from the repository
// root: node demo/record.ts
// See demo/RECORDING.md.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, readFile, rm, writeFile } from 'node:fs/promises';
import { userInfo } from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { frameLabel } from '../src/lib/frames.ts';

const root = path.resolve(import.meta.dirname, '..');
// recdr's default output root. Recording there keeps the absolute paths
// inside result.json free of a temp folder under the user's profile.
const outRoot = path.join(root, '.recdr');
const assets = path.join(root, 'src/assets/demo');
const port = '9222';
const kept = [
  'frames',
  'contact_sheet.png',
  'manifest.json',
  'diff.json',
  'result.json',
  'recording.gif',
  'recording.mp4',
];
// The banner of demo/index.html is 72 px high and as wide as the page.
const bannerHeight = 72;

const run = promisify(execFile);

/** Runs one recdr command and returns the JSON object it prints. */
async function recdr(...args: string[]): Promise<Record<string, unknown>> {
  const { stdout } = await run(process.env.RECDR_BIN ?? 'recdr', args, {
    cwd: root,
  });
  return JSON.parse(stdout);
}

/** How many pixels of a frame have the banner's red (#dc2626). */
async function redPixels(file: string): Promise<number> {
  const { data, info } = await sharp(file)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let count = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i]! >= 200 && data[i + 1]! <= 80 && data[i + 2]! <= 80) count++;
  }
  return count;
}

// channel 'chromium' is the full browser in its new headless mode. The
// default headless shell sends screencast frames in bursts, not as they change.
const browser = await chromium.launch({
  channel: 'chromium',
  args: [`--remote-debugging-port=${port}`],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await page.goto(pathToFileURL(path.join(root, 'demo/index.html')).href);
  await rm(outRoot, { recursive: true, force: true });

  // What an agent does: list the tabs, then record one by its id.
  const { tabs } = (await recdr('tabs', '--cdp', port)) as {
    tabs: { id: string; title: string }[];
  };
  const checkout = tabs.filter((tab) => tab.title.includes('Checkout'));
  assert(
    checkout.length === 1,
    `expected one Checkout tab, found ${checkout.length}`,
  );
  const tab = checkout[0]!;

  const started = await recdr(
    'start',
    '--cdp',
    port,
    '--tab-id',
    tab.id,
    '--fps',
    '15',
    '--format',
    'gif,mp4',
  );
  const id = String(started.id);
  let stopped = false;
  try {
    // recdr sets window.__recdrListening once it listens for clicks; a
    // click before that is not in the recording.
    await page.waitForFunction('Boolean(window.__recdrListening)');
    await sleep(1500);
    await page.click('#buy');
    await recdr('mark', id, 'clicked Buy');
    await page.waitForFunction("document.body.dataset.state === 'confirmed'");
    await sleep(2000);
    await recdr('stop', id);
    stopped = true;
  } finally {
    // A recording left running would hold the tab until its five minutes are up.
    if (!stopped) await recdr('stop', id).catch(() => {});
  }

  const recording = path.join(outRoot, id);
  const read = async (name: string) =>
    readFile(path.join(recording, name), 'utf8');

  const result = await read('result.json');
  assert(
    !result.toLowerCase().includes(userInfo().username.toLowerCase()),
    'result.json holds a path with your user name; the landing page shows that file',
  );

  const manifest = JSON.parse(await read('manifest.json')) as {
    width: number;
    duration_ms: number;
    frames: { file: string }[];
    clicks: unknown[];
    marks: unknown[];
  };
  const diff = JSON.parse(await read('diff.json')) as {
    frames: { keyframe: boolean }[];
  };
  const keyframes = diff.frames.filter((frame) => frame.keyframe).length;

  assert(
    manifest.clicks.length === 1,
    `expected one click, found ${manifest.clicks.length}`,
  );
  assert(
    manifest.marks.length === 1,
    `expected one mark, found ${manifest.marks.length}`,
  );
  // The hero downloads every stored frame.
  assert(
    manifest.frames.length <= 60,
    `expected at most 60 stored frames, found ${manifest.frames.length}`,
  );
  // The contact sheet holds 12 keyframes; with more, the banner may be left out.
  assert(keyframes <= 12, `expected at most 12 keyframes, found ${keyframes}`);
  // The hero's loop is this duration plus 7.5 s, and has to stay under 16 s.
  assert(
    manifest.duration_ms >= 4500 && manifest.duration_ms <= 8500,
    `expected a recording of 4.5 to 8.5 s, got ${manifest.duration_ms} ms`,
  );

  // Where the banner is in the recording, read off the frames themselves:
  // recdr's frame times and the page's clock do not line up to the frame.
  const red = await Promise.all(
    manifest.frames.map((frame) => redPixels(path.join(recording, frame.file))),
  );
  // One row of the banner counts as "the banner shows".
  const shows = (count: number) => count >= manifest.width;
  const first = red.findIndex(shows);
  assert(first > 0, 'no stored frame shows the banner');
  const most = Math.max(...red);
  const shown = red.indexOf(most);
  const after = red.findIndex((count, i) => i > shown && !shows(count));
  assert(after > shown, 'the banner is still there in the last frame');
  // The text and the icon are white, so the whole banner is about 90% red.
  assert(
    most >= manifest.width * bannerHeight * 0.8,
    `no stored frame shows the whole banner; the most red pixels in one frame is ${most}`,
  );
  assert(
    diff.frames.slice(first, after).some((frame) => frame.keyframe),
    'no keyframe shows the banner, so the contact sheet does not either',
  );

  const story = {
    title: tab.title,
    tab_id: tab.id,
    banner_first: frameLabel(manifest.frames[first]!.file),
    banner_shown: frameLabel(manifest.frames[shown]!.file),
    banner_after: frameLabel(manifest.frames[after]!.file),
  };

  await rm(assets, { recursive: true, force: true });
  for (const name of kept) {
    await cp(path.join(recording, name), path.join(assets, name), {
      recursive: true,
    });
  }
  await writeFile(
    path.join(root, 'demo/story.json'),
    JSON.stringify(story, null, 2) + '\n',
  );
  await rm(outRoot, { recursive: true, force: true });

  console.log(
    `${manifest.frames.length} frames, ${keyframes} keyframes, ${manifest.duration_ms} ms`,
  );
  console.log(story);
} finally {
  await browser.close();
}
