// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    'migration',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/basic-usage',
      ],
    },
    {
      type: 'category',
      label: 'Validation Formats',
      items: [
        'validation-formats/fluent-api',
        'validation-formats/string-format',
        'validation-formats/array-format',
      ],
    },
    {
      type: 'category',
      label: 'Data Types',
      items: [
        'data-types/string-validation',
        'data-types/number-validation',
        'data-types/date-validation',
        'data-types/file-validation',
        'data-types/array-object-validation',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Features',
      items: [
        'advanced/async-validation',
        'advanced/union-rules',
        'advanced/conditional-validation',
        'advanced/custom-rules',
      ],
    },
    {
      type: 'category',
      label: 'Framework Integration',
      items: [
        'framework-integration/react',
        'framework-integration/vue',
        'framework-integration/nodejs',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/configuration',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
      ],
    },
    'changelog'
  ],
};

module.exports = sidebars;
