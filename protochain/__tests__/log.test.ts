import { describe, it, expect } from '@jest/globals';

import log from '../src/util/log.ts';

describe('Logger Configuration', () => {
  it('should create a logger instance', () => {
    expect(log).toBeDefined();
    expect(typeof log.info).toBe('function');
    expect(typeof log.error).toBe('function');
  });

  it('should log messages without throwing errors', () => {
    expect(() => log.info('Test info message')).not.toThrow();
    expect(() => log.error('Test error message')).not.toThrow();
  });
});