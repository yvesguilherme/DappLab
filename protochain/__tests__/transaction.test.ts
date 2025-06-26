import { describe, test, expect } from '@jest/globals';

import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/model/transaction.model';

describe('Transaction Tests', () => {

  test('should be valid (REGULAR default)', () => {
    const tx = new Transaction({ data: 'tx' } as Transaction);
    tx.hash = tx.getHash();

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test('should not be valid (invalid hash)', () => {
    const tx = new Transaction({
      data: 'tx',
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: 'abcd1234'
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test('should be valid (FEE)', () => {
    const tx = new Transaction({ data: 'tx', type: TransactionType.FEE } as Transaction);
    tx.hash = tx.getHash();

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test('should not be valid (invalid data)', () => {
    const tx = new Transaction({ data: '', type: TransactionType.REGULAR } as Transaction);
    tx.hash = tx.getHash();

    const validation = tx.isValid();

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('Invalid data.');
  });

  test('should set data to hash if data is not provided', () => {
    const tx = new Transaction();

    expect(typeof tx.data).toBe('string');
    expect(tx.data).toMatch(/^[a-f0-9]{64}$/);
  });
});