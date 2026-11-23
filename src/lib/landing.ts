// Text of the landing page that more than one file reads.

/** The page's <h1>, and the title on its social card. */
export const headline = 'Screen recorder your agent can use.';

// The FAQ. Every answer comes from the recdr README; the comment over each
// question names the section. The answers are HTML strings, because Astro
// drops the space where a line of text ends just before an inline element.
export const questions: { question: string; answer: string }[] = [
  {
    // Limits, Commands
    question: 'Does recdr upload my recordings?',
    answer:
      'No. recdr never uploads anything. Recordings stay in the output root, which is <code>./.recdr</code> unless you pass <code>--out</code>.',
  },
  {
    // Limits
    question: 'Does recdr record what I type?',
    answer:
      'No. Keyboard input is never recorded. A recording does hold whatever was on screen, including secrets.',
  },
  {
    // Install
    question: 'Is the recdr binary for Windows signed?',
    answer:
      'No. The Windows binary is not signed, so Defender or SmartScreen may warn about it.',
  },
  {
    // macOS permissions
    question: 'Which macOS permissions does recdr need?',
    answer:
      'Two things, and it gives them to the program that started recdr (your terminal or your editor), not to recdr itself. Screen Recording is needed for windows, monitors and every desktop target. Input Monitoring is needed for click rings; without it a recording still runs, without clicks. <a href="/docs/guides/macos-permissions/">More on macOS permissions</a>.',
  },
  {
    // Build, Limits
    question: 'What does recdr record on Linux?',
    answer:
      'Browser tabs. Windows, screen regions, monitors and the app need Windows or macOS. MP4 output on Linux uses <code>ffmpeg</code> on <code>PATH</code>.',
  },
  {
    // Opening paragraph, MCP
    question: 'Which agents can use recdr?',
    answer:
      'Agents drive recdr through a CLI that prints JSON, or through an MCP server. For Claude Code, register the server with <code>claude mcp add recdr -- /path/to/recdr mcp</code>.',
  },
  {
    // Install
    question: 'How do I update recdr?',
    answer:
      '<code>recdr update</code> installs the newest release over the binary it runs from. A copy installed by Homebrew or cargo is updated with <code>brew upgrade recdr</code> or <code>cargo install recdr</code>.',
  },
  {
    // Install
    question: 'How do I uninstall recdr?',
    answer: String.raw`Delete the binary. On Windows also remove <code>%LOCALAPPDATA%\Programs\recdr</code> from your user <code>Path</code>.`,
  },
];

/** An answer without its tags, for the FAQ's structured data. */
export function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}
