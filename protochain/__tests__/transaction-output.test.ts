import { describe, it, expect, beforeAll } from '@jest/globals';

import TransactionOutput from '../src/lib/transaction-output';
import Wallet from '../src/lib/wallet';

describe('Transaction Output tests', () => {
  let alice: Wallet;

  beforeAll(() => {
    alice = new Wallet();
  });

  it('should be valid', () => {
    const txOutput = new TransactionOutput({
      amount: 10n,
      toAddress: alice.publicKey,
      tx: 'xyz',
    } as TransactionOutput);

    expect(txOutput.isValid().success).toBe(true);
  });

  it('should not be valid', () => {
    const txOutput = new TransactionOutput({
      amount: -10n,
      toAddress: alice.publicKey,
      tx: 'xyz',
    } as TransactionOutput);

    expect(txOutput.isValid().success).toBe(false);
  });

  it('should return a valid hash', () => {
    const txOutput = new TransactionOutput({
      amount: 10n,
      toAddress: alice.publicKey,
      tx: 'xyz',
    } as TransactionOutput);

    const hash = txOutput.getHash();
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64);
  });

  it('should be valid with a valid amount', () => {
    const txOutput = new TransactionOutput({
      amount: '15' as unknown as bigint,
      toAddress: alice.publicKey,
      tx: 'xyz',
    } as TransactionOutput);

    expect(txOutput.isValid().success).toBe(true);
    expect(txOutput.amount).toBe(15n);
  });

  it('should not be valid (default values)', () => { 
    const txOutput = new TransactionOutput();

    expect(txOutput.isValid().success).toBe(false);
    expect(txOutput.toAddress).toBe('');
    expect(txOutput.amount).toBe(0n);
    expect(txOutput.tx).toBe('');
    expect(txOutput.isValid().message).toBe('Negative amount.');
  });

});