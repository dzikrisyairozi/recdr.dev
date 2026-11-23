---
title: 'MCP'
description: 'Register the recdr MCP server with Claude Code, and see the ten tools it offers, from list_windows to export, and what they return.'
sidebar:
  order: 4
---

Register the server with Claude Code:

```
claude mcp add recdr -- /path/to/recdr mcp
```

Tools: `list_windows`, `list_monitors`, `list_tabs`, `start_recording`, `stop_recording`, `record`, `mark`, `get_status`, `get_frames` and `export`. Each returns the same JSON the CLI prints. `stop_recording` and `record` also return the contact sheet as an image, and `get_frames` returns up to 8 frames as images. Every image is at most 2000 px on each edge; `get_frames` scales frames down to `max_width` (default 1024), and further when an edge is still over 2000 px.
