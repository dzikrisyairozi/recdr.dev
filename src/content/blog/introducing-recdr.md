---
title: Introducing recdr
description: recdr is a screen recorder that an AI agent starts, stops and reads the result of, through a CLI or an MCP server.
date: 2026-11-23
draft: false
---

recdr records a window, a screen region or a monitor on Windows and macOS, or a browser tab through the Chrome DevTools Protocol on Windows, Linux and macOS. It leaves files an AI agent can read: a GIF or MP4 for people, and for the agent a contact sheet of the moments where the screen changed, a per-frame change log and the stored frames as PNG. Agents drive it through a CLI that prints JSON, or through an MCP server.

## Why it exists

Browser tools give an agent screenshots, not recordings. With recdr an agent can start a recording, run a test or click through a flow, stop, and look at what happened.

## Install

macOS and Linux:

```
curl -fsSL https://recdr.dev/install.sh | sh
```

Windows (PowerShell):

```
irm https://recdr.dev/install.ps1 | iex
```

The script downloads the build for your system from the latest GitHub release, checks its SHA-256, and puts `recdr` in `~/.local/bin`, or `recdr.exe` in `%LOCALAPPDATA%\Programs\recdr` on Windows. Homebrew and cargo work too. The [install page](/docs/install/) has both, and the variables the script reads.

## Quick start

Register the MCP server with Claude Code:

```
claude mcp add recdr -- recdr mcp
```

Then ask the agent to record something, for example: "record the Chrome tab with the checkout page while you click Buy, then show me the contact sheet". The same recording from the command line, for 10 seconds:

```
recdr record --cdp chrome --tab checkout --duration 10s
```

The [quick start](/docs/quick-start/) says what `--cdp chrome` needs.

## What a recording leaves

A recording is a folder with these files:

- `frames/000001.png` and so on: each frame that differs from the one before it.
- `manifest.json`: size, fps, duration, each frame's time, marks, clicks, stop reason, dropped frames.
- `diff.json`: for each frame, the share of pixels that changed, the box around them, and whether it is a keyframe.
- `contact_sheet.png`: up to 12 keyframes in a grid, each labelled with its time and any marks.
- `recording.gif`, `recording.mp4`: the formats asked for, with a ring drawn for 400 ms after each click.
- `result.json`: what `stop` and `record` print.

recdr never uploads anything, and keyboard input is never recorded. A recording does hold whatever was on screen, including secrets.

recdr is open source under the MIT license. The source is on [GitHub](https://github.com/dzikrisyairozi/recdr).
