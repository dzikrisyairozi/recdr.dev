---
title: 'Build from source'
description: 'For contributors, or to run recdr from a checkout.'
sidebar:
  order: 4
---

For contributors, or to run recdr from a checkout.

Requires Rust 1.98 or later. Desktop targets (windows, regions, monitors) need Windows 10 1903 or later (Windows 11 recommended) or macOS 14 or later. Building on macOS needs Xcode's command line tools (`xcode-select --install`); full Xcode is not needed. Tab targets run on Windows, Linux and macOS and need a Chromium-based browser with remote debugging switched on.

```
cargo build --release
```

The binary is `target/release/recdr` (`recdr.exe` on Windows).

MP4 output uses the H.264 encoder of the system on Windows (Media Foundation) and macOS (AVFoundation), and `ffmpeg` on `PATH` on Linux. Windows "N" editions have no Media Foundation encoder until the Media Feature Pack is installed. On Windows every MP4 is at least 160 by 120 (smaller recordings get black columns and rows) and carries a silent AAC track, both from the `windows-capture` encoder.

On Linux, `windows`, `monitors` and the desktop targets fail with `unsupported_platform`. A command after `--` runs without a shell there, so write `-- sh -c "npm test && echo done"` when you need one.

## Tests

```
cargo test
cargo test --test desktop -- --ignored --test-threads=1      # Windows and macOS; records the real screen
cargo test --test browser -- --ignored --test-threads=1      # starts headless Chrome
```

The browser tests find Chrome at its default install path; set `RECDR_TEST_CHROME` to use another binary.
