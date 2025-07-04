import { createHash } from 'crypto';

import TransactionType from "./model/transaction.model.ts";
import Validation from './validation.ts';
import TransactionInput from './transaction-input.ts';

/**
 * Transaction class represents a transaction in the blockchain.
 */
class Transaction {
  type: TransactionType;
  timestamp: number;
  hash: string;
  txInput: TransactionInput;
  to: string;

  constructor(tx?: Transaction) {
    this.type = tx?.type ?? TransactionType.REGULAR;
    this.timestamp = tx?.timestamp ?? Date.now();
    this.to = tx?.to ?? '';
    this.txInput = tx?.txInput ? new TransactionInput(tx.txInput) : new TransactionInput();
    this.hash = tx?.hash?.length ? tx.hash : this.getHash();
  }

  getHash(): string {
    return createHash('sha256')
      .update(`${this.type}${this.txInput.getHash()}${this.to}${this.timestamp}`)
      .digest('hex');
  }

  isValid(): Validation {
    if (this.hash !== this.getHash()) return Validation.failure('Invalid hash.');

    if (!this.to) return Validation.failure('Invalid to.');
    
    return Validation.success();
  }
}

export default Transaction;