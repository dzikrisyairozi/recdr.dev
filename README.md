# recdr.dev

The source of [recdr.dev](https://recdr.dev), the site for
[recdr](https://github.com/dzikrisyairozi/recdr). recdr is a screen recorder
that leaves files an AI agent can read. Its code lives in its own repository;
this one holds only the site.

The site is a static Astro 7 build with no server. It serves:

- `/install.sh` and `/install.ps1`, which redirect to the install scripts of
  the latest recdr release, so the install commands in the recdr README work
- the home page
- the docs, the changelog and the blog, which are added one module at a time

## Requirements

- Node 24.16 or later (`.node-version` holds the major version)
- pnpm 9

## Commands

```bash
pnpm install
pnpm dev              # dev server at http://localhost:4321
pnpm build            # static build to dist/
pnpm preview          # serve dist/ at http://localhost:4321
pnpm type-check       # astro check
pnpm lint             # ESLint
pnpm format           # Prettier, write
pnpm format:check     # Prettier, check
pnpm test             # unit tests (Node's test runner)
pnpm test:e2e         # Playwright, in Chromium and WebKit
pnpm lhci             # Lighthouse CI against dist/
pnpm check-all        # type-check, lint, format:check and test
```

`pnpm test:e2e` needs Playwright's browsers once per machine:

```bash
pnpm exec playwright install chromium webkit
```

## Project structure

```
astro.config.ts      site URL and integrations
public/              files served as they are: _redirects, robots.txt, favicon.svg
src/pages/           one file per route
src/layouts/         Site.astro, the document shell
src/components/      Astro components
src/lib/             pure TypeScript, each module with a *.test.ts next to it
src/scripts/         browser code, imported from a component's <script>
src/styles/          tokens.css (design tokens) and global.css
src/content/         Markdown for the docs and the blog
src/assets/demo/     one real recdr recording, shown on the landing page
demo/                the page that was recorded, and the script that records it
e2e/                 Playwright tests
```

## Deployment

Cloudflare Pages builds the `main` branch and gives every pull request from
this repository a preview URL.

| Setting          | Value                                              |
| ---------------- | -------------------------------------------------- |
| Build command    | `pnpm build`                                       |
| Output directory | `dist`                                             |
| `PNPM_VERSION`   | `9.6.0` (the build image's own pnpm is version 10) |
| `GITHUB_TOKEN`   | optional; raises the GitHub API limit at build     |

Node comes from `.node-version`. The redirect rules are in `public/_redirects`.
A build without network access still passes: the changelog then links to the
releases on GitHub.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
