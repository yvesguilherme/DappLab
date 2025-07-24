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

  isValid(difficulty: number, totalFees: number): Validation {
    if (this.timestamp < 1 || !this.hash || !difficulty || !totalFees) return Validation.failure('Invalid mock transaction.');

    return Validation.success();
  }

  static fromReward(txo: TransactionOutput): Transaction {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [txo]
    } as Transaction);

    tx.txInputs = undefined;
    tx.hash = tx.getHash();
    tx.txOutputs[0].tx = tx.hash;

    return tx;
  }
}

export default Transaction;