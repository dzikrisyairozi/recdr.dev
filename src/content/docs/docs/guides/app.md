---
title: 'The app'
description: 'recdr gui opens a frame and a toolbar on top of other windows, on Windows and macOS.'
sidebar:
  order: 3
---

`recdr gui` opens a frame and a toolbar on top of other windows, on Windows and macOS. Move the frame by dragging the toolbar, resize it by its edges and corners, or pick a window in the target menu to put the frame around it. Record and Stop record what is inside the frame; the frame turns red while it records. Stop opens an editor that plays the recording, trims it with the two handles on the timeline, crops it with a rectangle dragged on the picture, and saves a GIF or MP4 through `recdr export`. "New recording" goes back to the frame.

The app writes recordings with `--format none` into the output root, `./.recdr` by default, so a shortcut to it should pass `--out`. Every recording it makes is an ordinary recording: `recdr status`, `frames` and `export` work on it, and `recdr stop <id>` from a terminal ends it and opens the editor.
