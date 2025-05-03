import { afterEach } from 'node:test';

import Crypto from '../crypto.js';
import Key from '../key.js';

fdescribe('Crypto', () => {
  const sampleText = 'Hello, World!';

  afterEach(() => delete process.env.AES_KEY);

  it('should throw an error if AES_KEY is not set', () => {
    expect(() => Crypto.encrypt(sampleText))
      .toThrow('AES_KEY environment variable is not set.');
  });

  it('should throw an error if AES_KEY is invalid', () => {
    process.env.AES_KEY = 'shortkey';

    expect(() => Crypto.encrypt(sampleText))
      .toThrow('Invalid AES key. Key must be 256-bit (32 bytes).');
  });

  it('should encrypt and decrypt text correctly', () => {
    process.env.AES_KEY = Key.createKey(32);

    const encryptedText = Crypto.encrypt(sampleText);
    expect(typeof encryptedText).toBe('string');
    expect(encryptedText).not.toBe(sampleText);

    const decryptedText = Crypto.decrypt(encryptedText);
    expect(decryptedText).toBe(sampleText);
  });

  it('should produce different encrypted outputs for the same input', () => {
    const encryptedText1 = Crypto.encrypt(sampleText);
    const encryptedText2 = Crypto.encrypt(sampleText);

    expect(encryptedText1).not.toBe(encryptedText2);
  });
});