import { createHash } from 'crypto';

import TransactionType from "./model/transaction.model.ts";
import Validation from './validation.ts';
import TransactionInput from './transaction-input.ts';
import TransactionOutput from './transaction-output.ts';
import Blockchain from './blockchain.ts';

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

  getFee(): bigint { 
    let inputSum = 0n, outputSum = 0n;

    if (this.txInputs?.length) {
      inputSum = this.txInputs.reduce((sum, txi) => sum + txi.amount, 0n);

      if (this.txOutputs.length) {
        outputSum = this.txOutputs.reduce((sum, txo) => sum + txo.amount, 0n);
      }

      return inputSum - outputSum;
    }

    return 0n;
  }

  isValid(difficulty: number, totalFees: number): Validation {
    let validation = this.validateHash();
    if (!validation.success) {
      return validation;
    }

    validation = this.validateTxOutputs();
    if (!validation.success) {
      return validation;
    }

    validation = this.validateInputs(difficulty, totalFees);
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
  private validateInputs(difficulty: number, totalFees: number): Validation {
    if (this.type === TransactionType.FEE) {
      const txo = this.txOutputs[0];

      if (txo.amount > Blockchain.getRewardAmount(difficulty) + BigInt(totalFees)) {
        return Validation.failure(`Invalid tx reward`);
      }

      return Validation.success();
    }

    if (!this.txInputs?.length) {
      return Validation.failure('NO TXI.');
    }

    const invalids = this.txInputs!.map(txi => txi.isValid()).filter(v => !v.success);

    if (invalids.length) {
      const messages = invalids.map(v => v.message).join(' ');
      return Validation.failure(`Invalid tx: ${messages}`);
    }
    const inputSum = this.txInputs.map(txi => txi.amount).reduce((a, b) => a + b, 0n);
    const outputSum = this.txOutputs.map(txo => txo.amount).reduce((a, b) => a + b, 0n);

    if (inputSum < outputSum) {
      return Validation.failure('Invalid tx: input amounts must be equal or greater than output amounts.');
    }

    return Validation.success();
  }

  static fromReward(txo: TransactionOutput): Transaction {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [txo]
    } as Transaction);

    tx.hash = tx.getHash();
    tx.txOutputs[0].tx = tx.hash;

    return tx;
  }
}

export default Transaction;