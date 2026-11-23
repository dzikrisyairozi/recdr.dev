import assert from 'node:assert/strict';
import { test } from 'node:test';
import { plainText, questions } from './landing.ts';

test('plainText drops the tags and keeps the words', () => {
  assert.equal(
    plainText(
      'Stay in <code>./.recdr</code>. <a href="/docs/guides/mcp/">More on MCP</a>.',
    ),
    'Stay in ./.recdr. More on MCP.',
  );
});

test('every question names recdr and has an answer', () => {
  assert.ok(questions.length > 0);
  for (const { question, answer } of questions) {
    assert.match(question, /recdr/);
    assert.ok(plainText(answer).length > 0);
  }
});
