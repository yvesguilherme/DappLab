import TransactionType from "../model/transaction.model";
import TransactionInput from "../transaction-input";
import Validation from '../validation';

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
    this.hash = tx?.hash ?? 'abc';
    this.to = tx?.to ?? 'wallet1';
    this.txInput = tx?.txInput ? new TransactionInput(tx.txInput) : new TransactionInput();
    this.hash = tx?.hash?.length ? tx.hash : this.getHash();
  }

  getHash(): string {
    return 'abc';
  }

  isValid(): Validation {
    if (!this.txInput) return Validation.failure('Invalid mock transaction.');

    if (this.txInput) {
      const inputValidation = this.txInput.isValid();

      if (!inputValidation.success) {
        return Validation.failure(`Invalid transaction input: ${inputValidation.message}`);
      }
    }

    return Validation.success();
  }
}

export default Transaction;