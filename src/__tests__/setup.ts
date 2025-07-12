// Jest setup file

// Import Vue setup for Vue component testing
import './setup-vue';

// Add any global test setup here
// For example:

// Set test timeout
jest.setTimeout(10000);

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});