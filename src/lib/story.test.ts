import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Manifest } from './frames.ts';
import {
  bannerFrames,
  finding,
  markFrame,
  seconds,
  session,
  type Result,
  type Story,
} from './story.ts';

// Seven frames. The banner is in the third to the fifth.
const manifest: Manifest = {
  id: '20261123-202425-a615',
  width: 1280,
  height: 800,
  duration_ms: 5654,
  frames: [0, 1892, 2550, 2564, 2839, 3035, 3483].map((t_ms, i) => ({
    index: i + 1,
    t_ms,
    file: `frames/00000${i + 1}.png`,
  })),
  clicks: [{ t_ms: 1823, x: 964, y: 435, button: 'left' }],
  marks: [{ t_ms: 1867, label: 'clicked Buy' }],
};

const story: Story = {
  title: 'Checkout · keyboards.example',
  tab_id: 'DED10564DCB334E21CCAB6973589CA5C',
  banner_first: '000003',
  banner_shown: '000004',
  banner_after: '000006',
};

const result: Result = {
  frames_stored: 7,
  duration_ms: 5654,
  keyframes: [{}, {}, {}, {}],
};

test('bannerFrames turns the three labels into frame indices', () => {
  assert.deepEqual(bannerFrames(manifest, story), {
    first: 2,
    shown: 3,
    after: 5,
  });
});

test('bannerFrames throws on a label the manifest does not have', () => {
  assert.throws(
    () => bannerFrames(manifest, { ...story, banner_shown: '000099' }),
    /000099/,
  );
});

test('bannerFrames throws when the frames are out of order', () => {
  assert.throws(() =>
    bannerFrames(manifest, { ...story, banner_after: '000004' }),
  );
  assert.throws(() =>
    bannerFrames(manifest, { ...story, banner_first: '000005' }),
  );
});

test('markFrame is the first frame at or after the mark', () => {
  assert.equal(markFrame(manifest, manifest.marks[0]!), 1);
});

test('markFrame reads frames in file order when their times are not', () => {
  const frames = manifest.frames.map((frame) => ({ ...frame }));
  frames[1]!.t_ms = 2600;
  frames[2]!.t_ms = 1900;
  assert.equal(markFrame({ ...manifest, frames }, manifest.marks[0]!), 1);
});

test('markFrame is the last frame when the mark is later than all of them', () => {
  assert.equal(markFrame(manifest, { t_ms: 9000 }), 6);
});

test('seconds rounds to the nearest tenth', () => {
  assert.equal(seconds(0), '0.0s');
  assert.equal(seconds(2149), '2.1s');
  assert.equal(seconds(2150), '2.2s');
  assert.equal(seconds(3035), '3.0s');
});

test('finding names when the banner shows and when it is gone', () => {
  assert.equal(
    finding(manifest, story),
    'A "Payment failed" banner shows at 2.6s and is gone by 3.0s. The page ends on "Order confirmed".',
  );
});

test('session lists the tool calls an agent makes, with the recording’s values', () => {
  assert.deepEqual(session(manifest, story, result), [
    {
      kind: 'tool',
      name: 'list_tabs',
      args: 'cdp: "9222"',
      result: '"Checkout · keyboards.example", id DED105…',
    },
    {
      kind: 'tool',
      name: 'start_recording',
      args: 'cdp: "9222", tab_id: "DED105…"',
      result: 'id: "20261123-202425-a615"',
    },
    { kind: 'action', text: 'The agent clicks Buy.' },
    { kind: 'tool', name: 'mark', args: 'label: "clicked Buy"', result: '' },
    {
      kind: 'tool',
      name: 'stop_recording',
      args: 'id: "20261123-202425-a615"',
      result: '7 frames, 4 keyframes, 5.7s',
    },
    {
      kind: 'finding',
      text: 'A "Payment failed" banner shows at 2.6s and is gone by 3.0s. The page ends on "Order confirmed".',
    },
  ]);
});

test('session throws when the recording has no mark', () => {
  assert.throws(
    () => session({ ...manifest, marks: [] }, story, result),
    /the recording has no mark/,
  );
});
