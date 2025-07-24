import Validation from "../validation";

/**
 * Mocked TransactionOutput class for testing
 */
class TransactionOutput {
  toAddress: string;
  amount: bigint;
  tx?: string;

  constructor(txOutput?: TransactionOutput) {
    this.toAddress = txOutput?.toAddress ?? 'abc';
    this.amount = txOutput?.amount ?? 10n;
    this.tx = txOutput?.tx ?? 'xyz';
  }

  isValid(): Validation {
    if (BigInt(this.amount) < 1n) return Validation.failure('Negative amount.');

    return Validation.success();
  }

  getHash(): string {
    return 'abc';
  }
}

export default TransactionOutput;