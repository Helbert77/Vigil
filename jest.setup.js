// Jest setup file
require('@testing-library/jest-dom');

// Mock Date.now for consistent testing
const mockDateNow = jest.fn();
global.Date.now = mockDateNow;

// Setup default mock for Date.now
beforeEach(() => {
  // Default to a fixed timestamp for consistent testing
  mockDateNow.mockReturnValue(new Date('2024-01-15T12:00:00Z').getTime());
});

afterEach(() => {
  mockDateNow.mockClear();
});

// Global test utilities
global.mockDate = (dateString) => {
  mockDateNow.mockReturnValue(new Date(dateString).getTime());
};

global.restoreDate = () => {
  mockDateNow.mockRestore();
};