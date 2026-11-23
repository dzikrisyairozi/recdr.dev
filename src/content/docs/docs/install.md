---
title: 'Install'
description: 'Install recdr with one command on macOS, Linux or Windows, or with Homebrew or cargo. Also covers updating, the install variables and uninstalling.'
sidebar:
  order: 2
---

macOS and Linux:

```
curl -fsSL https://recdr.dev/install.sh | sh
```

Windows (PowerShell):

```
irm https://recdr.dev/install.ps1 | iex
```

The script downloads the build for your system from the latest GitHub release, checks its SHA-256, and puts `recdr` in `~/.local/bin`, or `recdr.exe` in `%LOCALAPPDATA%\Programs\recdr` on Windows, which it adds to your user `Path`. It ends by printing the command that registers the MCP server.

With Homebrew on macOS or Linux, or with cargo:

```
brew install dzikrisyairozi/tap/recdr
cargo install recdr
```

`recdr update` installs the newest release over the binary it runs from, with the same script. `recdr update --check` only reports whether one exists. A copy installed by Homebrew or cargo is refused with `managed_install`; update it with `brew upgrade recdr` or `cargo install recdr`.

Both scripts read three environment variables:

| Variable             | Default                                            | Meaning                                                                               |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `RECDR_VERSION`      | the newest                                         | Install this version, as `0.1.0` or `v0.1.0`.                                         |
| `RECDR_INSTALL_DIR`  | see above                                          | Install into this folder. On Windows a folder set here is not added to `Path`.        |
| `RECDR_RELEASE_BASE` | `https://github.com/dzikrisyairozi/recdr/releases` | Read releases from another address with the same layout. `recdr update` reads it too. |

```
curl -fsSL https://recdr.dev/install.sh | RECDR_VERSION=0.1.0 sh
$env:RECDR_VERSION = '0.1.0'; irm https://recdr.dev/install.ps1 | iex
```

To uninstall, delete the binary. On Windows also remove `%LOCALAPPDATA%\Programs\recdr` from your user `Path`.

The Windows binary is not signed, so Defender or SmartScreen may warn about it. recdr installs a low-level mouse hook while it records, to draw click rings; `--no-click-highlight` installs none.
