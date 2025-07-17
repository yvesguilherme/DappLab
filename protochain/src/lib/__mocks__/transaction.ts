import TransactionType from "../model/transaction.model";
import TransactionInput from "../transaction-input";
import Validation from '../validation';
import TransactionOutput from "./transaction-output";

/**
 * Transaction class represents a transaction in the blockchain.
 */
class Transaction {
  type: TransactionType;
  timestamp: number;
  hash: string;
  txInputs: TransactionInput[] | undefined;
  txOutputs: TransactionOutput[];

  constructor(tx?: Transaction) {
    this.type = tx?.type ?? TransactionType.REGULAR;
    this.timestamp = tx?.timestamp ?? Date.now();
    this.hash = tx?.hash ?? 'abc';
    this.txOutputs = tx?.txOutputs ?? [new TransactionOutput()];
    this.txInputs = tx?.txInputs ?? [new TransactionInput()];
    this.hash = tx?.hash?.length ? tx.hash : this.getHash();
  }

  getHash(): string {
    return 'abc';
  }

  isValid(): Validation {
    if (this.timestamp < 1 || !this.hash) return Validation.failure('Invalid mock transaction.');

    return Validation.success();
  }
}

export default Transaction;