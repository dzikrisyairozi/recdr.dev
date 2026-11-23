import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatTimecode } from './timecode.ts';

test('zero is 00:00.0', () => {
  assert.equal(formatTimecode(0), '00:00.0');
});

test('tenths are rounded down', () => {
  assert.equal(formatTimecode(4200), '00:04.2');
  assert.equal(formatTimecode(59999), '00:59.9');
});

test('sixty seconds roll over to a minute', () => {
  assert.equal(formatTimecode(60000), '01:00.0');
});

test('minutes grow past 59', () => {
  assert.equal(formatTimecode(3723400), '62:03.4');
});

test('a negative or non-finite input is 00:00.0', () => {
  assert.equal(formatTimecode(-5), '00:00.0');
  assert.equal(formatTimecode(Number.NaN), '00:00.0');
  assert.equal(formatTimecode(Number.POSITIVE_INFINITY), '00:00.0');
});
