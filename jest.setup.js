import '@testing-library/jest-dom';

// Fix for environment variables in tests
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3001';
process.env.NEXT_PUBLIC_API_MOCKING = 'enabled';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'en',
}));

// Zustand stores will be mocked in individual tests as needed

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Add missing globals for MSW
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Add Response global for MSW
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new Map(Object.entries(init.headers || {}));
  }
  
  json() {
    return Promise.resolve(this.body);
  }
  
  text() {
    return Promise.resolve(JSON.stringify(this.body));
  }
};

// Add BroadcastChannel global for MSW
global.BroadcastChannel = class BroadcastChannel {
  constructor(name) {
    this.name = name;
  }
  
  postMessage() {}
  close() {}
}; 