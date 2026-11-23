import assert from 'node:assert/strict';
import { test } from 'node:test';
import { installCommands, tabForPlatform } from './install.ts';

test('Windows platforms open on the PowerShell tab', () => {
  assert.equal(tabForPlatform('Win32'), 'powershell');
  assert.equal(tabForPlatform('Windows'), 'powershell');
});

test('every other platform opens on the curl tab', () => {
  for (const platform of [
    'MacIntel',
    'Linux x86_64',
    'iPhone',
    'Linux armv81',
    '',
  ]) {
    assert.equal(tabForPlatform(platform), 'curl');
  }
});

test('the four commands are the ones in the recdr README', () => {
  assert.deepEqual(
    installCommands.map((command) => command.text),
    [
      'curl -fsSL https://recdr.dev/install.sh | sh',
      'irm https://recdr.dev/install.ps1 | iex',
      'brew install dzikrisyairozi/tap/recdr',
      'cargo install recdr',
    ],
  );
});

test('command ids are unique', () => {
  const ids = installCommands.map((command) => command.id);
  assert.equal(new Set(ids).size, ids.length);
});
