---
title: 'Quick start'
description: 'Register the MCP server with Claude Code, then ask the agent to record something.'
sidebar:
  order: 3
---

Register the MCP server with Claude Code:

```
claude mcp add recdr -- recdr mcp
```

Then ask the agent to record something, for example: "record the Chrome tab with the checkout page while you click Buy, then show me the contact sheet". The same recording from the command line, for 10 seconds:

```
recdr record --cdp chrome --tab checkout --duration 10s
```

`--cdp chrome` needs remote debugging switched on at `chrome://inspect/#remote-debugging`; see [Record a browser tab](/docs/guides/browser-tabs/).
