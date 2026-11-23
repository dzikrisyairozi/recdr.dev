# Contributing

This repository is the site at recdr.dev. For recdr itself, open issues and
pull requests at
[dzikrisyairozi/recdr](https://github.com/dzikrisyairozi/recdr).

## Setup

You need Node 24.16 or later and pnpm 9.

```bash
git clone https://github.com/dzikrisyairozi/recdr.dev
cd recdr.dev
pnpm install
pnpm exec playwright install chromium webkit
pnpm dev
```

## Making a change

1. Branch from `main`.
2. Make the change. Add or update a test when you change behavior: a unit test
   in `src/lib/` next to the module, or a Playwright test in `e2e/`.
3. Run the checks:

   ```bash
   pnpm check-all
   pnpm test:e2e
   ```

4. Commit with a [Conventional Commits](https://www.conventionalcommits.org/)
   message, for example `fix(landing): keep the scrubber strip inside the viewport`.
   Husky runs Prettier on staged files and commitlint on the message.
5. Open a pull request. CI runs the same checks plus Lighthouse, and
   Cloudflare Pages adds a preview URL.

## Rules for content

- Every claim about recdr must match the
  [recdr README](https://github.com/dzikrisyairozi/recdr#readme). If the
  README does not say it, the site does not say it.
- An image shown as recdr output comes from the recording in
  `src/assets/demo/`. It may be resized or re-encoded, not retouched.
  `demo/RECORDING.md` says how to make the recording again.
- The site is in English and has one dark theme.
- Every animation needs a reduced-motion state, and every page has to read
  without JavaScript.
