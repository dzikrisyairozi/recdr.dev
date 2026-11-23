---
title: 'Limits'
description: 'On Windows 10 the system draws a yellow border around the captured window or monitor, and it cannot be turned off there.'
sidebar:
  order: 5
---

- On Windows 10 the system draws a yellow border around the captured window or monitor, and it cannot be turned off there. Windows 11 turns it off.
- Clicks in windows of elevated (administrator) processes are not seen by the mouse hook, so they get no ring. Security software may flag a program that hooks the mouse and captures the screen; `--no-click-highlight` installs no hook.
- Protected video and some full-screen exclusive applications capture as black.
- On macOS a window recorded while it is minimized or on another Space stores no frames for that time; the recording runs on. A resized window is scaled to fit the starting size and padded with black by macOS itself.
- When a recorded window is resized, the first frame at the new size is discarded by the capture library. A window that then never repaints keeps showing its old image in the recording. Frames of another size are scaled to fit the first frame's size, on black.
- A recording holds whatever was on screen, including secrets. recdr never uploads anything; recordings stay in the output root.
- Keyboard input is never recorded.
- The MP4 path on a Windows "N" edition without the Media Feature Pack has not been tried. recdr checks for a working encoder before it records, so the expected result is `encode_failed` before anything is captured.
- The tests check MP4 files by their headers and by decoding frames with ffmpeg. A Windows MP4 plays in Chrome and opens in the Windows media stack; QuickTime Player and Safari have not been checked yet.
- The app needs Windows or macOS; on Linux `recdr gui` fails with `unsupported_platform`. It records a region or a window, not a monitor or a tab. A frame put around a window stays where it was put when the window moves.
- On Windows 11 each of the app's four border windows has a thin gray outline and rounded ends drawn by the system, which egui cannot switch off.
- On macOS, how the frame behaves over a full-screen application (which has its own Space) has not been tried.
