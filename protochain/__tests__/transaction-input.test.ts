import { describe, it, expect, beforeAll } from '@jest/globals';

import TransactionInput from '../src/lib/transaction-input';
import Wallet from '../src/lib/wallet';

describe('Transaction Input tests', () => {
  let alice: Wallet;

  beforeAll(() => {
    alice = new Wallet();
  });

  it('should be valid', () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: 'abc'
    } as TransactionInput);

    txInput.sign(alice.privateKey);

    expect(txInput.isValid().success).toBe(true);
  });

  it('should be valid with default values', () => {
    const txInput = new TransactionInput();

    expect(txInput.fromAddress).toBe('');
    expect(txInput.amount).toBe('0');
    expect(txInput.signature).toBe('');
  });

  it('should be invalid without signature', () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    expect(txInput.isValid().success).toBe(false);
    expect(txInput.isValid().message).toBe('Signature and previous tx are required.');
  });

  it('should be invalid with zero amount', () => {
    const txInput = new TransactionInput({
      amount: 0,
      fromAddress: alice.publicKey,
      previousTx: 'xyz'
    } as TransactionInput);

    txInput.sign(alice.privateKey);

    expect(txInput.isValid().success).toBe(false);
    expect(txInput.isValid().message).toBe('Amount must be greater than zero.');
  });

  it('should be invalid with negative amount', () => {
    const txInput = new TransactionInput({
      amount: -10,
      fromAddress: alice.publicKey,
      previousTx: 'xyz'
    } as TransactionInput);

    txInput.sign(alice.privateKey);

    expect(txInput.isValid().success).toBe(false);
    expect(txInput.isValid().message).toBe('Amount must be greater than zero.');
  });

  it('should be invalid if signature does not match public key', () => {
    const bob = new Wallet();
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: bob.publicKey,
      previousTx: 'xyz'
    } as TransactionInput);

    txInput.sign(alice.privateKey);

    expect(txInput.isValid().success).toBe(false);
    expect(txInput.isValid().message).toBe('Invalid tx input signature.');
  });

  it('should be invalid if the amount is changed after signing', () => {
    const txInput3 = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: 'xyz'
    } as TransactionInput);

    txInput3.sign(alice.privateKey);

    txInput3.amount = 20;

    expect(txInput3.isValid().success).toBe(false);
    expect(txInput3.isValid().message).toBe('Invalid tx input signature.');
  });

  it('should return invalid when the signature is incorrect', () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: 'xyz'
    } as TransactionInput);

    txInput.sign(alice.privateKey);

    // Tamper the signature (flip a byte)
    const tamperedSignature = txInput.signature
      .split('')
      .map((c, i) => (i === 0 ? (c === '0' ? '1' : '0') : c))
      .join('');

    txInput.signature = tamperedSignature;

    expect(txInput.isValid().success).toBe(false);
    expect(txInput.isValid().message).toBe('Invalid tx input signature.');
  });

  it('should not be valid (invalid previous tx)', () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    txInput.sign(alice.privateKey);

    expect(txInput.isValid().success).toBe(false);
    expect(txInput.isValid().message).toBe('Signature and previous tx are required.');
  });
});