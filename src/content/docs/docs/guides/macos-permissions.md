---
title: 'macOS permissions'
description: 'macOS asks for two permissions, and gives them to the program that started recdr: your terminal or your editor, not recdr itself.'
sidebar:
  order: 5
---

macOS asks for two permissions, and gives them to the program that started recdr: your terminal (Terminal, iTerm2) or your editor, not recdr itself. A recording started with `start`, and one started by the MCP server, counts as that same program.

- **Screen Recording** (System Settings > Privacy & Security > Screen & System Audio Recording), for `windows`, `monitors` and every desktop target. Without it recdr asks macOS to show its dialog and fails with `permission_denied`. Switch the program on and restart it.
- **Input Monitoring** (System Settings > Privacy & Security > Input Monitoring), for click rings. Without it a recording still runs, without clicks, and prints `clicks are not recorded: ...` on stderr (for `start`, in `recorder.log`). `--no-click-highlight` asks for nothing.

While a recording runs, macOS shows its screen-recording indicator in the menu bar. On macOS 15 and later the system may also show a periodic alert that the program is reading the screen without the system's window picker.

On macOS, `minimized` in `recdr windows` is true for any window that is not on screen: minimized, hidden with its application, or on another Space. Such a window is refused with `target_minimized`. Positions are in pixels: each monitor's `bounds` origin is its position in points times the largest scale factor, so a Retina laptop with a 1x display has gaps between the monitors' `bounds`, and a position read off a frame plus the `bounds` origin is still a valid `--region` position.
