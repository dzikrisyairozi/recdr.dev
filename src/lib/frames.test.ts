import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildFrames,
  clickPoint,
  formatChanged,
  percent,
  type Diff,
  type Manifest,
} from './frames.ts';

// A real two-frame recdr recording, 320 by 240.
const manifest: Manifest = {
  width: 320,
  height: 240,
  frames: [
    { index: 1, t_ms: 0, file: 'frames/000001.png' },
    { index: 2, t_ms: 66, file: 'frames/000002.png' },
  ],
  clicks: [],
};

const diff: Diff = {
  frames: [
    { t_ms: 0, changed_fraction: 0, keyframe: true },
    {
      t_ms: 66,
      changed_fraction: 0.016666668,
      bbox: { x: 0, y: 100, width: 56, height: 40 },
      keyframe: false,
    },
  ],
};

test('percent rounds to one decimal', () => {
  assert.equal(percent(100, 240), 41.7);
  assert.equal(percent(56, 320), 17.5);
});

test('formatChanged writes a fraction as a percentage', () => {
  assert.equal(formatChanged(0), '0%');
  assert.equal(formatChanged(0.016666668), '1.7%');
  assert.equal(formatChanged(1), '100%');
});

test('buildFrames joins the manifest and the change log by position', () => {
  const [first, second] = buildFrames(manifest, diff);

  assert.deepEqual(first, {
    index: 1,
    file: 'frames/000001.png',
    label: '000001',
    timecode: '00:00.0',
    changed: '0%',
    keyframe: true,
    box: null,
  });
  assert.deepEqual(second, {
    index: 2,
    file: 'frames/000002.png',
    label: '000002',
    timecode: '00:00.0',
    changed: '1.7%',
    keyframe: false,
    box: { x: 0, y: 41.7, width: 17.5, height: 16.7 },
  });
});

test('buildFrames throws when the two files disagree on the frame count', () => {
  assert.throws(() => buildFrames(manifest, { frames: diff.frames.slice(1) }));
});

test('clickPoint gives the first click in percent of the frame', () => {
  assert.equal(clickPoint(manifest), null);
  assert.deepEqual(
    clickPoint({
      ...manifest,
      clicks: [{ t_ms: 10, x: 160, y: 60, button: 'left' }],
    }),
    { x: 50, y: 25 },
  );
});
