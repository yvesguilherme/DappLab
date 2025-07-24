import { createHash } from 'crypto';

import Validation from "./validation.ts";

/**
 * Represents an output in a blockchain transaction.
 */
class TransactionOutput {
  toAddress: string;
  amount: bigint;
  tx?: string;

  constructor(txOutput?: TransactionOutput) {
    this.toAddress = txOutput?.toAddress ?? '';
    this.amount = BigInt(txOutput?.amount ?? 0);
    this.tx = txOutput?.tx ?? '';
  }

  isValid(): Validation {
    if (this.amount < 1n) return Validation.failure('Negative amount.');

    return Validation.success();
  }

  getHash(): string {
    return createHash('sha256')
      .update(`${this.toAddress}${this.amount}`)
      .digest('hex');
  }
}

export default TransactionOutput;