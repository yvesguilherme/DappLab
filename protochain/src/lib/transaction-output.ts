import { createHash } from 'crypto';
import { BigNumberish } from 'ethers';

import Validation from "./validation";

/**
 * Represents an output in a blockchain transaction.
 */
class TransactionOutput {
  toAddress: string;
  amount: BigNumberish;
  tx?: string;

  constructor(txOutput?: TransactionOutput) {
    this.toAddress = txOutput?.toAddress ?? '';
    this.amount = txOutput?.amount ?? '0';
    this.tx = txOutput?.tx ?? '';
  }

  isValid(): Validation {
    if (BigInt(this.amount) < 1n) return Validation.failure('Negative amount.');

    return Validation.success();
  }

  getHash(): string {
    return createHash('sha256')
      .update(`${this.toAddress}${this.amount}${this.tx}`)
      .digest('hex');
  }
}

export default TransactionOutput;