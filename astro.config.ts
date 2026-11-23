import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
  site: 'https://recdr.dev',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'recdr',
      // src/pages/404.astro is the 404 page of the whole site.
      disable404Route: true,
      editLink: {
        baseUrl: 'https://github.com/dzikrisyairozi/recdr.dev/edit/main/',
      },
      customCss: [
        '@fontsource-variable/geist',
        '@fontsource-variable/geist-mono',
        './src/styles/tokens.css',
        './src/styles/starlight.css',
      ],
      components: {
        Header: './src/components/starlight/Header.astro',
        Footer: './src/components/starlight/Footer.astro',
        MobileMenuFooter: './src/components/starlight/MobileMenuFooter.astro',
        ThemeProvider: './src/components/starlight/ThemeProvider.astro',
        ThemeSelect: './src/components/starlight/ThemeSelect.astro',
      },
      // Fails the build on a docs link that leads nowhere. Only the docs are
      // Starlight pages, so links out of them are not checked.
      plugins: [
        starlightLinksValidator({
          exclude: ['/', '/changelog{,/**/*}', '/blog{,/**/*}'],
        }),
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            'docs',
            'docs/install',
            'docs/quick-start',
            'docs/build-from-source',
          ],
        },
        {
          label: 'Guides',
          items: [{ autogenerate: { directory: 'docs/guides' } }],
        },
        {
          label: 'Reference',
          items: [{ autogenerate: { directory: 'docs/reference' } }],
        },
      ],
    }),
  ],
});
