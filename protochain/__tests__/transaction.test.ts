import { describe, test, expect, jest } from '@jest/globals';

import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/model/transaction.model';
import TransactionInput from '../src/lib/transaction-input';
import TransactionOutput from '../src/lib/transaction-output';

jest.mock('../src/lib/transaction-input');
jest.mock('../src/lib/transaction-output');

describe('Transaction Tests', () => {
  test('should be valid (REGULAR default)', () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()], txOutputs: [new TransactionOutput()] } as Transaction);
    tx.hash = tx.getHash();

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test('should not be valid (invalid hash)', () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: 'abcd1234'
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test('should be valid (FEE)', () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()], txOutputs: [new TransactionOutput()], type: TransactionType.FEE } as Transaction);
    tx.hash = tx.getHash();

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test('should not be valid (invalid txInput)', () => {
    const txInputs = [new TransactionInput()];
    txInputs[0].amount = -1;
    const tx = new Transaction({ txInputs, txOutputs: [new TransactionOutput()], type: TransactionType.REGULAR } as Transaction);
    tx.hash = tx.getHash();

    const validation = tx.isValid();

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('Invalid tx: Amount must be greater than zero.');
  });

  test('should set hash if hash is not provided', () => {
    const tx = new Transaction();

    expect(typeof tx.hash).toBe('string');
    expect(tx.hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should not be valid (invalid to)', () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()], type: TransactionType.REGULAR } as Transaction);
    tx.hash = tx.getHash();

    const validation = tx.isValid();

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('No TXO.');
  });

  test('should not be valid (negative amount)', () => {
    const txOutputs = [new TransactionOutput()];
    txOutputs[0].amount = '-1';
    const tx = new Transaction({ txInputs: [new TransactionInput()], txOutputs, type: TransactionType.REGULAR } as Transaction);
    tx.hash = tx.getHash();

    const validation = tx.isValid();

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('Invalid TXO.');
  });

  test('should not be valid when one txo reference hash does not match', () => {
    const txOutputs = [new TransactionOutput({
      amount: BigInt(10)
    } as TransactionOutput)];

    const txInputs = [new TransactionInput({
      amount: BigInt(9)
    } as TransactionInput)];

    const tx = new Transaction({
      txInputs,
      txOutputs,
      type: TransactionType.REGULAR
    } as Transaction);
    tx.hash = tx.getHash();

    const validation = tx.isValid();

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('Invalid tx: input amounts must be equal or greater than output amounts.');
  });

  test('should be valid when txInputs length is zero', () => {
    const tx = new Transaction({
      txInputs: [] as TransactionInput[],
      txOutputs: [new TransactionOutput()],
      type: TransactionType.REGULAR
    } as Transaction);
    tx.hash = tx.getHash();

    const validation = tx.isValid();

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('NO TXI.');
  });

  test('should not be valid when txOutputs tx reference hash does not match', () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()]
    } as Transaction);

    tx.txOutputs[0].tx = 'invalid_hash';

    const validation = tx.isValid();

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('Invalid TXO reference hash.');
  });
});