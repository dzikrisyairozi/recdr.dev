---
title: 'MCP'
description: 'Register the server with Claude Code.'
sidebar:
  order: 4
---

Register the server with Claude Code:

```
claude mcp add recdr -- /path/to/recdr mcp
```

Tools: `list_windows`, `list_monitors`, `list_tabs`, `start_recording`, `stop_recording`, `record`, `mark`, `get_status`, `get_frames` and `export`. Each returns the same JSON the CLI prints. `stop_recording` and `record` also return the contact sheet as an image, and `get_frames` returns up to 8 frames as images.
