import { createHash } from 'crypto';

import TransactionType from "./model/transaction.model.ts";
import Validation from './validation.ts';
import TransactionInput from './transaction-input.ts';
import TransactionOutput from './transaction-output.ts';

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
    this.txInputs = tx?.txInputs ? tx.txInputs.map(txi => new TransactionInput(txi)) : undefined;
    this.txOutputs = tx?.txOutputs ? tx.txOutputs.map(txo => new TransactionOutput(txo)) : [];
    this.hash = tx?.hash?.length ? tx.hash : this.getHash();
    this.txOutputs.forEach((txo, index, arr) => arr[index].tx = this.hash);
  }

  getHash(): string {
    const from = this.txInputs?.length ? this.txInputs?.map(txi => txi.signature).join(',') : '';
    const to = this.txOutputs?.length ? this.txOutputs?.map(txo => txo.getHash()).join(',') : '';

    return createHash('sha256')
      .update(`${this.type}${from}${to}${this.timestamp}`)
      .digest('hex');
  }

  isValid(): Validation {
    let validation = this.validateHash();
    if (!validation.success) {
      return validation;
    }

    validation = this.validateTxOutputs();
    if (!validation.success) {
      return validation;
    }

    validation = this.validateInputs();
    if (!validation.success) {
      return validation;
    }

    return Validation.success();
  }

  /**
   * Validates that the transaction's hash matches the computed hash.
   * @returns {Validation} Validation result indicating if the hash is valid.
   */
  private validateHash(): Validation {
    return this.hash === this.getHash()
      ? Validation.success()
      : Validation.failure('Invalid hash.');
  }

  /**
   * Validates the transaction's outputs.
   * @returns {Validation} Validation result indicating if the outputs are valid.
   */
  private validateTxOutputs(): Validation {
    if (!this.txOutputs.length) {
      return Validation.failure('No TXO.');
    }

    const invalidOutputs = this.txOutputs.filter(txo => !txo.isValid().success);

    if (invalidOutputs.length) {
      return Validation.failure('Invalid TXO.');
    }

    const invalidReferenceHash = this.txOutputs.some(txo => txo.tx !== this.hash);

    if (invalidReferenceHash) {
      return Validation.failure(`Invalid TXO reference hash.`);
    }

    // TODO: validate fees and rewards when tx.type === FEE

    return Validation.success();
  }

  /**
   * Validates the transaction's inputs.
   * @returns {Validation} Validation result indicating if the inputs are valid.
   */
  private validateInputs(): Validation {
    if (!this.txInputs?.length) {
      return Validation.failure('NO TXI.');
    }

    const invalids = this.txInputs.map(txi => txi.isValid()).filter(v => !v.success);

    if (invalids.length) {
      const messages = invalids.map(v => v.message).join(' ');
      return Validation.failure(`Invalid tx: ${messages}`);
    }
    const inputSum = this.txInputs.map(txi => BigInt(txi.amount)).reduce((a, b) => a + b, BigInt(0));
    const outputSum = this.txOutputs.map(txo => BigInt(txo.amount)).reduce((a, b) => a + b, BigInt(0));

    if (inputSum < outputSum) {
      return Validation.failure('Invalid tx: input amounts must be equal or greater than output amounts.');
    }

    return Validation.success();
  }
}

export default Transaction;