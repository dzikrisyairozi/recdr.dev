import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stackPlanes } from './hero-stack.ts';

// Eight frames. The banner is in frames 1 to 6 and whole in frame 3.
const planes = stackPlanes(8, { first: 1, shown: 3, after: 7 });

test('the newest frame is in front and the oldest furthest back', () => {
  assert.deepEqual(
    planes.map((plane) => plane.frame),
    [7, 6, 5, 4, 3, 2, 1, 0],
  );
  assert.deepEqual(
    planes.map((plane) => plane.depth),
    [0, 1, 2, 3, 4, 5, 6, 7],
  );
});

test('only the frames with the banner are lifted, the whole banner highest', () => {
  const lift = Object.fromEntries(
    planes.map((plane) => [plane.frame, plane.lift]),
  );
  assert.deepEqual(lift, {
    0: 0,
    1: 0.5,
    2: 0.75,
    3: 1,
    4: 0.75,
    5: 0.5,
    6: 0.25,
    7: 0,
  });
});

test('a banner in one frame lifts that frame all the way', () => {
  const lifted = stackPlanes(4, { first: 1, shown: 1, after: 2 }).filter(
    (plane) => plane.lift > 0,
  );
  assert.deepEqual(lifted, [{ frame: 1, depth: 2, lift: 1 }]);
});
