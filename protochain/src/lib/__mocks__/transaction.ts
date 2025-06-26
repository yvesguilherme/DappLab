import TransactionType from "../model/transaction.model";
import Validation from '../validation';

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
    this.hash = tx?.hash ?? 'abc';
    this.data = tx?.data ?? this.getHash();
  }

  getHash(): string {
    return 'abc';
  }

  isValid(): Validation {
    if (!this.data) return Validation.failure('Invalid mock transaction.');

    return Validation.success();
  }
}

export default Transaction;