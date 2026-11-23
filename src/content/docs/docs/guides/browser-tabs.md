---
title: 'Record a browser tab'
description: "recdr attaches to a running Chromium-based browser over the Chrome DevTools Protocol and records one tab's page as the browser draws it."
sidebar:
  order: 1
---

recdr attaches to a running Chromium-based browser over the Chrome DevTools Protocol and records one tab's page as the browser draws it, whether or not the tab is selected, covered or in a minimized window. Nothing on screen changes.

List the tabs, then record one:

```
recdr tabs --cdp 9222
recdr record --cdp 9222 --tab-id 6A1B5C... --duration 5s
recdr record --cdp 9222 --tab "checkout" --duration 5s
```

`--cdp` takes four forms:

| Form             | Example                                        | Fits                                                                                                                                                                                                                  |
| ---------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A port           | `9222`                                         | A browser started with `--remote-debugging-port=9222 --user-data-dir=<dir>`, such as one that Playwright MCP attaches to with `--cdp-endpoint`, or a headless Chrome in a script or CI job.                           |
| An `http://` URL | `http://127.0.0.1:9222`                        | The same, on another address. recdr asks `<url>/json/version` for the WebSocket URL.                                                                                                                                  |
| A `ws://` URL    | `ws://127.0.0.1:9222/devtools/browser/4f0c...` | Used as it is. agent-browser prints one with `get cdp-url`.                                                                                                                                                           |
| `chrome`         | `chrome`                                       | Your everyday Chrome 144 or later, after you switch on remote debugging at `chrome://inspect/#remote-debugging`. Chrome asks you to Allow each connection, so `tabs` is one click and `record` or `start` is another. |

`https://` and `wss://` endpoints are refused.

For Chrome Beta, Canary, Edge or a profile in another directory, build the `ws://` URL from the `DevToolsActivePort` file in that browser's user data directory. The browser writes it when remote debugging is switched on at `chrome://inspect/#remote-debugging` or when it was started with `--remote-debugging-port=0` (a headless Chrome given a fixed port did not write it in testing). Its first line is the port and its second a path:

```
$ cat "<user data dir>/DevToolsActivePort"
53122
/devtools/browser/0e2d5f44-...
$ recdr tabs --cdp ws://127.0.0.1:53122/devtools/browser/0e2d5f44-...
```

Since Chrome 136, `--remote-debugging-port` is ignored for the default profile, so a browser started that way needs its own `--user-data-dir`.

Clicks in a tab come from the page: recdr adds a listener for mouse presses to the top-level document, so clicks that an automation tool sends through CDP get rings too. The manifest stores them in frame pixels.

## Limits of tab recording

- While it is recorded, the page sees itself as visible and focused, so a page that pauses when hidden keeps running.
- `window.__recdrClick` and `window.__recdrListening` are added to the page, so a page can tell it is recorded. `--no-click-highlight` adds nothing.
- Clicks inside iframes are not reported. A click made after the viewport changed size may be drawn in the wrong place.
- A press made just before the recording stops, or in the moment between a navigation and the listener being added again, can be missed.
- A frame is stored up to one frame interval (about 67 ms at 15 fps) after the browser sent it.
- If a recorder is killed, its listener stays in the open document; reload the tab.
