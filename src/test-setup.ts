/**
 * Test setup file for vitest
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/preact';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock
});

// Mock window.confirm
Object.defineProperty(globalThis, 'confirm', {
  value: vi.fn(() => true),
  writable: true
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn()
};
