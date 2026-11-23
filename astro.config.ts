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
      sidebar: [{ label: 'Start here', items: ['docs'] }],
    }),
  ],
});
