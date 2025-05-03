import Key from '../key.js';

describe('createKey', () => {
  it('should generate a key of the specified length in bytes', () => {
    const length = 16; // 16 bytes
    const key = Key.createKey(length);

    expect(typeof key).toBe('string');

    // Check if the key has the correct length in hexadecimal (2 characters per byte)
    expect(key.length).toBe(length * 2);
  });

  it('should generate different keys for different calls', () => {
    const length = 16;
    const key1 = Key.createKey(length);
    const key2 = Key.createKey(length);

    expect(key1).not.toBe(key2);
  });

  it('should throw an error if length is not provided', () => {
    expect(() => Key.createKey()).toThrow();
  });

  it('should throw an error if length is not a number', () => {
    expect(() => Key.createKey('invalid')).toThrow();
  });

  it('should throw an error if length is less than or equal to 0', () => {
    expect(() => Key.createKey(0)).toThrow();
    expect(() => Key.createKey(-1)).toThrow();
  });
});