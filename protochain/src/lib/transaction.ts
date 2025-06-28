import { createHash } from 'crypto';

import TransactionType from "./model/transaction.model.ts";
import Validation from './validation.ts';

/**
 * Transaction class represents a transaction in the blockchain.
 */
class Transaction {
  type: TransactionType;
  timestamp: number;
  hash: string;
  data: string;

  constructor(tx?: Transaction) {
    this.type = tx?.type ?? TransactionType.REGULAR;
    this.timestamp = tx?.timestamp ?? Date.now();
    this.data = tx?.data ?? '';
    this.hash = tx?.hash?.length ? tx.hash : this.getHash();
  }

  getHash(): string {
    return createHash('sha256')
      .update(`${this.type}${this.data}${this.timestamp}`)
      .digest('hex');
  }

  isValid(): Validation {
    if (this.hash !== this.getHash()) return Validation.failure('Invalid hash.');

    if (!this.data) return Validation.failure('Invalid data.');
    
    return Validation.success();
  }
}

export default Transaction;