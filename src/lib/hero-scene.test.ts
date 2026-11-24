import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  LEAD_MS,
  TAIL_MS,
  endScene,
  loopMs,
  sceneAt,
  type Timing,
} from './hero-scene.ts';

// Six frames. Two share a time, and the fifth is stamped earlier than the fourth.
const timing: Timing = {
  frames: [0, 1900, 2550, 2550, 2540, 3500],
  clickMs: 1800,
  markMs: 1870,
  durationMs: 5000,
  bannerFrame: 3,
  stepCount: 6,
};

const rec = (ms: number) => sceneAt(LEAD_MS + ms, timing);
const after = (ms: number) => sceneAt(LEAD_MS + timing.durationMs + ms, timing);

test('before the recording the two first tool calls come in, one by one', () => {
  const idle = {
    frame: 0,
    tiles: 0,
    recording: false,
    clockMs: 0,
    ring: false,
  };
  assert.deepEqual(sceneAt(0, timing), { ...idle, lines: 0 });
  assert.deepEqual(sceneAt(299, timing), { ...idle, lines: 0 });
  assert.deepEqual(sceneAt(300, timing), { ...idle, lines: 1 });
  assert.deepEqual(sceneAt(1200, timing), { ...idle, lines: 2 });
  assert.deepEqual(sceneAt(LEAD_MS - 1, timing), { ...idle, lines: 2 });
});

test('while recording the clock runs and the tiles follow the frames', () => {
  assert.deepEqual(rec(0), {
    lines: 2,
    frame: 0,
    tiles: 1,
    recording: true,
    clockMs: 0,
    ring: false,
  });
  assert.deepEqual(rec(1000), {
    lines: 2,
    frame: 0,
    tiles: 1,
    recording: true,
    clockMs: 1000,
    ring: false,
  });
  assert.equal(rec(1900).frame, 1);
  assert.equal(rec(1900).tiles, 2);
  assert.equal(rec(4999).frame, 5);
  assert.equal(rec(4999).recording, true);
});

test('the click and the mark each add a line', () => {
  assert.equal(rec(1799).lines, 2);
  assert.equal(rec(1800).lines, 3);
  assert.equal(rec(1869).lines, 3);
  assert.equal(rec(1870).lines, 4);
});

test('the ring shows for 400 ms from the click', () => {
  assert.equal(rec(1799).ring, false);
  assert.equal(rec(1800).ring, true);
  assert.equal(rec(2199).ring, true);
  assert.equal(rec(2200).ring, false);
});

test('of two frames with one time the later one shows', () => {
  const frames = [0, 1900, 2550, 2550, 3000, 3500];
  assert.equal(sceneAt(LEAD_MS + 2550, { ...timing, frames }).frame, 3);
});

test('a frame stamped earlier than the one before it still comes after it', () => {
  // At 2545 ms the fifth frame's time has passed, the third's has not.
  assert.equal(rec(2545).frame, 4);
  assert.equal(rec(2560).frame, 4);
});

test('after the stop the last two lines come in and the banner frame shows', () => {
  const stopped = {
    frame: 5,
    tiles: 6,
    recording: false,
    clockMs: 5000,
    ring: false,
  };
  assert.deepEqual(after(0), { ...stopped, lines: 4 });
  assert.deepEqual(after(300), { ...stopped, lines: 5 });
  assert.deepEqual(after(1499), { ...stopped, lines: 5 });
  assert.deepEqual(after(1500), endScene(timing));
});

test('the loop is the lead, the recording and the tail', () => {
  assert.equal(loopMs(timing), LEAD_MS + 5000 + TAIL_MS);
});

test('the last moment of the loop is the end scene', () => {
  assert.deepEqual(sceneAt(loopMs(timing) - 1, timing), endScene(timing));
});

test('endScene rests on the banner frame, or on the frame it is given', () => {
  assert.deepEqual(endScene(timing), {
    lines: 6,
    frame: 3,
    tiles: 6,
    recording: false,
    clockMs: null,
    ring: false,
  });
  assert.equal(endScene(timing, 1).frame, 1);
  assert.equal(endScene({ ...timing, stepCount: 7 }).lines, 7);
});
