// Import Vue modules first
import { createApp } from 'vue';

// Ensure all Vue globals are available before importing test utils
(global as any).Vue = require('vue');

// Mock VueServerRenderer if not available
if (typeof (global as any).VueServerRenderer === 'undefined') {
  (global as any).VueServerRenderer = {
    renderToString: () => Promise.resolve(''),
    renderToStream: () => ({
      pipe: () => {},
      on: () => {},
    }),
  };
}

// Add other Vue compiler modules
try {
  (global as any).VueCompilerDOM = require('@vue/compiler-dom');
} catch (e) {
  console.warn('VueCompilerDOM not available');
}

try {
  (global as any).VueCompilerSFC = require('@vue/compiler-sfc');
} catch (e) {
  console.warn('VueCompilerSFC not available');
}

// Import test utils after setting up globals
let config: any;
try {
  const testUtils = require('@vue/test-utils');
  config = testUtils.config;
} catch (e) {
  console.warn('@vue/test-utils not available or config not found');
}

// Configure if available
if (config && config.global) {
  config.global.config = config.global.config || {};
  config.global.config.warnHandler = () => {
    // Suppress Vue warnings during tests
  };
  config.global.plugins = config.global.plugins || [];
}

// Create a global Vue app instance
const app = createApp({});
(global as any).app = app;