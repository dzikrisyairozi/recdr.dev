---
title: 'Commands'
description: 'Every recdr command, the targets you can record (a window, a region, a monitor or a browser tab), the options of record and start, and examples.'
sidebar:
  order: 1
---

```
recdr windows                       List visible top-level windows
recdr monitors                      List monitors
recdr tabs --cdp <endpoint>         List the tabs of a browser
recdr record <target> --duration 10s [options]     Record for a fixed time, then return
recdr record <target> [options] -- <command...>    Record while the command runs
recdr start  <target> [options]     Start a background recording, return its id at once
recdr stop   <id>                   Stop it, encode, return the result
recdr mark   <id> "<label>"         Add a labelled marker at the current time
recdr status [<id>]                 State of one recording, or of all in the output root
recdr frames <id> (--at 1200ms,2s | --every 500ms | --keyframes) [--max-width 1024]
recdr export <id> --file <out.gif|out.mp4> [--from 2s] [--until 5s] [--crop x,y,w,h]
recdr gui                           Open the desktop app (Windows and macOS)
recdr mcp                           Run the MCP server on stdio
recdr update [--check]              Install the newest release over this binary
```

Every command prints one JSON object on stdout and exits 0. A failure prints `{"error":{"code":"...","message":"..."}}` on stderr and exits 1, or 2 for a usage error.

`<target>` is exactly one of:

| Flag                                     | Meaning                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `--window-id <id>`                       | The `id` from `recdr windows`. Exact; prefer this.                               |
| `--window "<text>"`                      | The visible window whose title contains the text, ignoring case.                 |
| `--process <name>`                       | The visible window of a process with this executable name, such as `chrome.exe`. |
| `--region x,y,w,h`                       | A rectangle in physical pixels that lies inside one monitor.                     |
| `--monitor <index>`                      | A whole monitor, by the `index` from `recdr monitors`, starting at 0.            |
| `--tab-id <id>` with `--cdp <endpoint>`  | The `id` from `recdr tabs`. Exact; prefer this.                                  |
| `--tab "<text>"` with `--cdp <endpoint>` | The tab whose title or URL contains the text, ignoring case.                     |

A window target is resolved once, when recording starts. A tab is found when the recorder connects to the browser. When `--window`, `--process` or `--tab` matches more than one window or tab, recdr fails with `ambiguous_target` and lists the candidates instead of guessing. To record a window that the wrapped command will open, use `--monitor` or `--region`.

Options for `record` and `start`:

| Option                  | Default | Meaning                                                                                       |
| ----------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `--duration <time>`     | none    | `record` only. Stop after this long.                                                          |
| `--fps <n>`             | 15      | Capture rate limit, 1 to 60.                                                                  |
| `--max-duration <time>` | 5m      | The recording stops itself at this length.                                                    |
| `--max-size <size>`     | 2GB     | The recording stops itself when its directory reaches this size.                              |
| `--format <list>`       | gif     | `gif`, `mp4`, `gif,mp4`, or `none` to keep only the frames and the analysis and export later. |
| `--no-cursor`           | off     | Leave the mouse cursor out of the frames. A tab recording never shows the cursor.             |
| `--no-click-highlight`  | off     | Do not record clicks. No mouse hook is installed and nothing is added to the page.            |

`--out <dir>` (default `./.recdr`) sets the output root for every command that reads or writes recordings. A `<time>` is a whole number with `ms`, `s` or `m`; a `<size>` is a whole number with `MB` or `GB`.

## Examples

Record a window for five seconds:

```
recdr windows
recdr record --window-id 70628 --duration 5s
```

Record a monitor while a test suite runs:

```
recdr record --monitor 0 -- npm test
```

Start in the background, mark a moment, stop:

```
recdr start --window-id 70628
recdr mark 20261118-143502-1a2b "clicked submit"
recdr stop 20261118-143502-1a2b
```
