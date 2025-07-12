import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';
import alias from '@rollup/plugin-alias';
import path from 'path';
import { fileURLToPath } from 'url';

const isProduction = true;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Base configuration
const baseConfig = {
  external: [
    'react',
    'vue',
    'file-type',
    'fastify-plugin',
    'express',
    'validlyjs',
  ],
  plugins: [
    alias({
      entries: [
        {
          find: 'validlyjs',
          replacement: path.resolve(__dirname, 'src/index.ts'),
        },
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: '@/types', replacement: path.resolve(__dirname, 'src/types') },
        { find: '@/core', replacement: path.resolve(__dirname, 'src/core') },
        {
          find: '@/parsers',
          replacement: path.resolve(__dirname, 'src/parsers'),
        },
        { find: '@/rules', replacement: path.resolve(__dirname, 'src/rules') },
        {
          find: '@/fluent',
          replacement: path.resolve(__dirname, 'src/fluent'),
        },
        {
          find: '@/messages',
          replacement: path.resolve(__dirname, 'src/messages'),
        },
        {
          find: '@/response',
          replacement: path.resolve(__dirname, 'src/response'),
        },
        {
          find: '@/config',
          replacement: path.resolve(__dirname, 'src/config'),
        },
        { find: '@/utils', replacement: path.resolve(__dirname, 'src/utils') },
        {
          find: '@/integrations',
          replacement: path.resolve(__dirname, 'src/integrations'),
        },
      ],
    }),
    resolve({
      browser: false,
      preferBuiltins: true,
      // Only include necessary modules
      modulesOnly: true,
    }),
    commonjs({
      // Reduce bundle size by being more selective
      include: /node_modules/,
      exclude: ['**/*.d.ts'],
    }),
    typescript({
      tsconfig: './tsconfig.build.json',
      sourceMap: false, // Disable source maps in production
      inlineSources: false,
      outDir: undefined,
      declaration: false,
      declarationMap: false,
      // Optimize TypeScript compilation
      compilerOptions: {
        removeComments: true,
        importHelpers: true, // Use tslib helpers to reduce code duplication
      },
    }),
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
    tryCatchDeoptimization: false,
    preset: 'smallest',
    manualPureFunctions: [
      'Object.defineProperty',
      'Object.freeze',
      'Object.seal',
    ],
  },
  // Optimize chunk generation
  output: {
    compact: true,
    minifyInternalExports: true,
  },
};

// Enhanced terser configuration for maximum compression
const terserConfig = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    unsafe_math: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    drop_console: true,
    drop_debugger: true,
    passes: 3, // Increased passes for better compression
    keep_fargs: false,
    hoist_funs: true,
    hoist_vars: true,
    if_return: true,
    join_vars: true,
    collapse_vars: true,
    reduce_vars: true,
    warnings: false,
    ecma: 2020,
    toplevel: true,
  },
  mangle: {
    toplevel: true,
    eval: true,
    properties: {
      regex: /^_/,
    },
  },
  format: {
    comments: false,
    semicolons: false,
  },
  ecma: 2020,
  toplevel: true,
};

// Main package builds
const builds = [
  // ESM build
  {
    ...baseConfig,
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'es',
      sourcemap: false, // Disable source maps to reduce size
      entryFileNames: 'index.js',
      preserveModules: false,
      compact: true,
    },
    plugins: [
      ...baseConfig.plugins,
      isProduction && terser(terserConfig),
    ].filter(Boolean),
  },

  // CommonJS build
  {
    ...baseConfig,
    input: 'src/index.ts',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: false, // Disable source maps
      exports: 'named',
      entryFileNames: 'index.js',
      preserveModules: false,
      compact: true,
    },
    plugins: [
      ...baseConfig.plugins,
      isProduction && terser(terserConfig),
    ].filter(Boolean),
  },

  // Vue integration ESM build
  {
    ...baseConfig,
    input: 'src/integrations/vue/index.ts',
    output: {
      dir: 'dist/esm/integrations/vue',
      format: 'es',
      sourcemap: false,
      entryFileNames: 'index.js',
      preserveModules: false,
      compact: true,
    },
    plugins: [
      ...baseConfig.plugins,
      isProduction && terser(terserConfig),
    ].filter(Boolean),
  },

  // React integration ESM build
  {
    ...baseConfig,
    input: 'src/integrations/react/index.ts',
    output: {
      dir: 'dist/esm/integrations/react',
      format: 'es',
      sourcemap: false,
      entryFileNames: 'index.js',
      preserveModules: false,
      compact: true,
    },
    plugins: [
      ...baseConfig.plugins,
      isProduction && terser(terserConfig),
    ].filter(Boolean),
  },

  // Node.js integration ESM build
  {
    ...baseConfig,
    input: 'src/integrations/node/index.ts',
    output: {
      dir: 'dist/esm/integrations/node',
      format: 'es',
      sourcemap: false,
      entryFileNames: 'index.js',
      preserveModules: false,
      compact: true,
    },
    plugins: [
      ...baseConfig.plugins,
      isProduction && terser(terserConfig),
    ].filter(Boolean),
  },

  // Node.js integration CJS build
  {
    ...baseConfig,
    input: 'src/integrations/node/index.ts',
    output: {
      dir: 'dist/cjs/integrations/node',
      format: 'cjs',
      sourcemap: false,
      exports: 'named',
      entryFileNames: 'index.js',
      preserveModules: false,
      compact: true,
    },
    plugins: [
      ...baseConfig.plugins,
      isProduction && terser(terserConfig),
    ].filter(Boolean),
  },

  // Add bundle analyzer only in development
  ...(isProduction
    ? []
    : [
        {
          ...baseConfig,
          input: 'src/index.ts',
          output: {
            dir: 'dist/analysis',
            format: 'es',
            sourcemap: false,
            entryFileNames: 'index.js',
            preserveModules: false,
          },
          plugins: [
            ...baseConfig.plugins,
            visualizer({
              filename: 'bundle-analysis.html',
              open: true,
              gzipSize: true,
              brotliSize: true,
              template: 'treemap',
            }),
          ],
        },
      ]),
];

// TypeScript declaration files bundling
const dtsConfig = {
  input: 'dist/temp_types/index.d.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'es',
  },
  plugins: [
    dts({
      respectExternal: true,
      compilerOptions: {
        removeComments: true,
      },
    }),
  ],
  external: [/\.css$/],
};

export default isProduction ? [...builds, dtsConfig] : builds;
