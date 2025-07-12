// Jest DOM setup file

// Set up DOM environment
import '@testing-library/jest-dom';

// Set test timeout
jest.setTimeout(10000);

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  document.body.innerHTML = '';
});