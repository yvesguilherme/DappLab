import { createHash } from 'crypto';

import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';

import Validation from './validation.ts';
import TransactionOutput from './transaction-output.ts';
import { parseBigInt } from '../util/big-int.ts';

const ECPair = ECPairFactory(ecc);

/**
 * TransactionInput represents the input for a transaction.
 * It includes the address of the sender, the amount to be transferred,
 * and the signature of the transaction.
 */
class TransactionInput {
  fromAddress: string; // Public key of the sender
  amount: bigint;
  signature: string;
  previousTx: string;

  /**
   * Creates a new TransactionInput instance.
   * @param txInput Optional TransactionInput object to initialize the instance.
   */
  constructor(txInput?: TransactionInput) {
    this.previousTx = txInput?.previousTx ?? '';
    this.fromAddress = txInput?.fromAddress ?? '';
    this.amount = parseBigInt(txInput?.amount);
    this.signature = txInput?.signature ?? '';
  }

  /**
   * Generates and sets the digital signature for this transaction input using the provided private key.
   * The signature proves that the transaction was authorized by the owner of the 'fromAddress'.
   * @param privateKey The private key corresponding to the 'fromAddress' (sender's public key).
   */
  sign(privateKey: string): void {
    const signature = ECPair
      .fromPrivateKey(Buffer.from(privateKey, 'hex'))
      .sign(Buffer.from(this.getHash(), 'hex'));

    this.signature = Buffer.from(signature).toString('hex');
  }

  /**
   * Generates a unique hash for this transaction input.
   * The hash is created using the 'fromAddress', 'amount', and 'previousTx' properties.
   * @returns A SHA-256 hash of the transaction input.
   */
  getHash(): string {
    return createHash('sha256')
      .update(`${this.previousTx}${this.fromAddress}${this.amount}`)
      .digest('hex');
  }

  /**
   * Validates the transaction input.
   * Checks if the signature is present, if the amount is greater than zero,
   * and if the signature is valid for the given fromAddress.
   * Additionally, it checks if the previous transaction is provided.
   * @returns Validation object indicating success or failure.
   */
  isValid(): Validation { 
    if(!this.previousTx || !this.signature) {
      return Validation.failure('Signature and previous tx are required.');
    }

    if (this.amount < 1n) {
      return Validation.failure('Amount must be greater than zero.');
    }

    const hash = Buffer.from(this.getHash(), 'hex');
    const isValidSignature = ECPair
      .fromPublicKey(Buffer.from(this.fromAddress, 'hex'))
      .verify(hash, Buffer.from(this.signature, 'hex'));
    
    return isValidSignature
      ? Validation.success()
      : Validation.failure('Invalid tx input signature.');
  }

  static fromTxo(txo: TransactionOutput): TransactionInput {
    return new TransactionInput({
      amount: txo.amount,
      fromAddress: txo.toAddress,
      previousTx: txo.tx
    } as TransactionInput);
  }
}

export default TransactionInput;