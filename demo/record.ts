// Records demo/index.html with recdr and copies the recording into
// src/assets/demo/. Run from the repository root: node demo/record.ts
// See demo/RECORDING.md.
import { spawn } from 'node:child_process';
import { cp, readdir, readFile, rm } from 'node:fs/promises';
import { userInfo } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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

// channel 'chromium' is the full browser in its new headless mode. The
// default headless shell sends screencast frames in bursts, not as they change.
const browser = await chromium.launch({
  channel: 'chromium',
  args: [`--remote-debugging-port=${port}`],
});

try {
  const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
  await page.goto(pathToFileURL(path.join(root, 'demo/index.html')).href);

  await rm(outRoot, { recursive: true, force: true });
  const recdr = spawn(
    process.env.RECDR_BIN ?? 'recdr',
    [
      'record',
      '--cdp',
      port,
      '--tab',
      'checkout',
      '--duration',
      '6s',
      '--fps',
      '15',
      '--format',
      'gif,mp4',
    ],
    { cwd: root, stdio: 'inherit' },
  );
  const exited = new Promise<number | null>((resolve, reject) => {
    recdr.on('error', reject);
    recdr.on('exit', resolve);
  });

  // recdr needs a second or two to attach. It sets window.__recdrListening
  // once it listens for clicks; a click before that is not in the recording.
  await Promise.race([
    page.waitForFunction('Boolean(window.__recdrListening)'),
    exited.then(() => {
      throw new Error('recdr exited before it attached to the tab');
    }),
  ]);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await page.click('#buy');

  const code = await exited;
  if (code !== 0) throw new Error(`recdr exited with code ${code}`);

  const entries = await readdir(outRoot, { withFileTypes: true });
  const recordings = entries.filter((entry) => entry.isDirectory());
  if (recordings.length !== 1) {
    throw new Error(
      `expected one recording in .recdr, found ${recordings.length}`,
    );
  }
  const recording = path.join(outRoot, recordings[0].name);

  const result = await readFile(path.join(recording, 'result.json'), 'utf8');
  if (result.toLowerCase().includes(userInfo().username.toLowerCase())) {
    throw new Error(
      'result.json holds a path with your user name; the landing page shows that file',
    );
  }
  const manifest = JSON.parse(
    await readFile(path.join(recording, 'manifest.json'), 'utf8'),
  );
  if (manifest.clicks.length !== 1) {
    throw new Error(`expected one click, found ${manifest.clicks.length}`);
  }

  await rm(assets, { recursive: true, force: true });
  for (const name of kept) {
    await cp(path.join(recording, name), path.join(assets, name), {
      recursive: true,
    });
  }
  await rm(outRoot, { recursive: true, force: true });

  console.log(`${manifest.frames.length} frames, click:`, manifest.clicks[0]);
} finally {
  await browser.close();
}
