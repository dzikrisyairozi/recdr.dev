import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://recdr.dev',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'recdr',
      // src/pages/404.astro is the 404 page of the whole site.
      disable404Route: true,
      customCss: [
        '@fontsource-variable/geist',
        '@fontsource-variable/geist-mono',
        './src/styles/tokens.css',
        './src/styles/starlight.css',
      ],
      components: {
        Header: './src/components/starlight/Header.astro',
        Footer: './src/components/starlight/Footer.astro',
        ThemeProvider: './src/components/starlight/ThemeProvider.astro',
        ThemeSelect: './src/components/starlight/ThemeSelect.astro',
      },
      sidebar: [
        {
          label: 'Start here',
          items: ['docs', 'docs/install', 'docs/quick-start'],
        },
        {
          label: 'Guides',
          items: [{ autogenerate: { directory: 'docs/guides' } }],
        },
      ],
    }),
  ],
});
