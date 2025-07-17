import { BigNumberish } from 'ethers';

import Validation from '../validation';

/**
 * Mock class for TransactionInput.
 */
class TransactionInput {
  fromAddress: string; // Public key of the sender
  amount: BigNumberish;
  signature: string;
  previousTx: string;

  /**
   * Creates a new TransactionInput instance.
   * @param txInput Optional TransactionInput object to initialize the instance.
   */
  constructor(txInput?: TransactionInput) {
    this.previousTx = txInput?.previousTx ?? 'xyz';
    this.fromAddress = txInput?.fromAddress ?? 'wallet1';
    this.amount = txInput?.amount ?? '10';
    this.signature = txInput?.signature ?? 'abc';
  }

  /**
   * Generates and sets the digital signature for this transaction input using the provided private key.
   * The signature proves that the transaction was authorized by the owner of the 'fromAddress'.
   * @param privateKey The private key corresponding to the 'fromAddress' (sender's public key).
   */
  sign(privateKey: string): void {
    this.signature = 'abc';
  }

  /**
   * Generates a unique hash for this transaction input.
   * The hash is created using the 'fromAddress' and 'amount' properties.
   * @returns A SHA-256 hash of the transaction input.
   */
  getHash(): string {
    return 'abc';
  }

  /**
   * Validates the transaction input.
   * Checks if the signature is present, if the amount is greater than zero,
   * and if the signature is valid for the given fromAddress.
   * @returns Validation object indicating success or failure.
   */
  isValid(): Validation { 
    if (!this.previousTx || !this.signature) {
      return Validation.failure('Signature and previous tx are required.');
    }

    if (BigInt(this.amount) < 1n) {
      return Validation.failure('Amount must be greater than zero.');
    }

    return Validation.success();
  }
}

export default TransactionInput;