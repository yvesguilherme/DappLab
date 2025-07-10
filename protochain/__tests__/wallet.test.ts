import { describe, it, expect, beforeAll } from '@jest/globals';

import Wallet from '../src/lib/wallet';

describe('Wallet tests', () => {
  let alice: Wallet;
  const exampleWIF = '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ';

  beforeAll(() => {
    alice = new Wallet();
  });

  it('should generate wallet', () => {
    const wallet = new Wallet();

    expect(wallet.privateKey).toBeDefined();
    expect(wallet.publicKey).toBeDefined();
    expect(wallet.privateKey).toBeTruthy();
    expect(wallet.publicKey).toBeTruthy();
    expect(wallet.privateKey.length).toBe(64);
    expect(wallet.publicKey.length).toBe(66);
  });

  it('should recover wallet (PK)', () => {
    const wallet = new Wallet(alice.privateKey);

    expect(wallet.publicKey).toEqual(alice.publicKey);
  });

  it('should recover wallet (WIF)', () => {
    const wallet = new Wallet(exampleWIF);

    expect(wallet.publicKey).toBeTruthy();
    expect(wallet.privateKey).toBeTruthy();
  });

  it('should throw error on invalid WIF', () => {
    expect(() => new Wallet('invalidWIF'))
      .toThrowError('Invalid WIF or private key');
  });

  it('should throw error on invalid private key', () => {
    expect(() => new Wallet('invalidPrivateKeyinvalidPrivateKeyinvalidPrivateKeyinvalidPrivateKey'))
      .toThrowError('Invalid WIF or private key');
  });
});