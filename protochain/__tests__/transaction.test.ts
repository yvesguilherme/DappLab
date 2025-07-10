import { describe, test, expect, jest } from '@jest/globals';

import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/model/transaction.model';
import TransactionInput from '../src/lib/transaction-input';

jest.mock('../src/lib/transaction-input');

describe('Transaction Tests', () => {

  test('should be valid (REGULAR default)', () => {
    const tx = new Transaction({ txInput: new TransactionInput(), to: 'wallet' } as Transaction);
    tx.hash = tx.getHash();

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test('should not be valid (invalid hash)', () => {
    const tx = new Transaction({
      txInput: new TransactionInput(),
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: 'abcd1234'
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test('should be valid (FEE)', () => {
    const tx = new Transaction({ txInput: new TransactionInput(), to: 'wallet', type: TransactionType.FEE } as Transaction);
    tx.hash = tx.getHash();

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test('should not be valid (invalid txInput)', () => {
    const txInput = new TransactionInput();
    txInput.amount = -1;
    const tx = new Transaction({ txInput, to: 'wallet', type: TransactionType.REGULAR } as Transaction);
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
    const tx = new Transaction({ txInput: new TransactionInput(), type: TransactionType.REGULAR } as Transaction);
    tx.hash = tx.getHash();

    const validation = tx.isValid();

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('Invalid to.');
  });
});