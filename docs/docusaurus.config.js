const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Validlyjs Documentation',
  tagline: 'Comprehensive documentation for your package',
  favicon: 'images/validlyjs_icon.ico',

  // Set the production url of your site here
  url: 'https://tobyemmanuel.github.io', // Replace with your actual GitHub username
  baseUrl: '/validlyjs/',
  organizationName: 'Oluwatobi Adelabu',
  projectName: 'validlyjs',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/tobyemmanuel/validlyjs/tree/master/docs/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/tobyemmanuel/validlyjs/tree/master/docs/',
        },
        theme: {
          customCss: require.resolve('./static/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Validlyjs',
        logo: {
          alt: 'Validlyjs Logo',
          src: 'images/validlyjs.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/tobyemmanuel/validlyjs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Validlyjs Documentation. Built with Docusaurus.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }),
};

module.exports = config;
