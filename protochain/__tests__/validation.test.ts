import { describe, it, expect } from '@jest/globals';

import Validation from '../src/lib/validation';

describe('Validation tests', () => {
  it('should create a successful validation', () => {
    const validation = Validation.success();
    expect(validation.success).toEqual(true);
    expect(validation.message).toEqual('');
  });

  it('should create a failed validation with a message', () => {
    const validation = Validation.failure('Validation failed');
    expect(validation.success).toEqual(false);
    expect(validation.message).toEqual('Validation failed');
  });

  it('should throw an error if failure is called without a message', () => {
    expect(() => Validation.failure(''))
      .toThrowError('Validation failure requires a descriptive message!');
    
    expect(() => Validation.failure(null as any))
      .toThrowError('Validation failure requires a descriptive message!');
  });
});