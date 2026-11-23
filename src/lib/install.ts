export type InstallId = 'curl' | 'powershell' | 'brew' | 'cargo';

export type InstallCommand = { id: InstallId; label: string; text: string };

// The same four commands as the Install section of the recdr README.
export const installCommands: InstallCommand[] = [
  {
    id: 'curl',
    label: 'curl',
    text: 'curl -fsSL https://recdr.dev/install.sh | sh',
  },
  {
    id: 'powershell',
    label: 'PowerShell',
    text: 'irm https://recdr.dev/install.ps1 | iex',
  },
  { id: 'brew', label: 'brew', text: 'brew install dzikrisyairozi/tap/recdr' },
  { id: 'cargo', label: 'cargo', text: 'cargo install recdr' },
];

/** The tab to open first, from `navigator.platform`. */
export function tabForPlatform(platform: string): InstallId {
  return /win/i.test(platform) ? 'powershell' : 'curl';
}
