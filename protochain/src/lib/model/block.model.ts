import { createHash } from 'crypto';

import Validation from '../validation.ts';

class Block {
  readonly index: number;
  readonly timestamp: number;
  readonly hash: string;
  readonly previousHash: string;
  readonly data: string;

  /**
   * @param index The index of the block in the chain
   * @param hash The hash of the block
   * @param previousHash The hash of the previous block
   * @param data The data stored in the block
   * @param timestamp The timestamp of the block creation
   */
  constructor(index: number, previousHash: string, data: string, timestamp = Date.now()) {
    this.index = index;
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.data = data;
    this.hash = this.#getHash();

    Object.freeze(this);
  }

  /**
   * Get the hash of the block
   * @returns The hash of the block
   */
  #getHash(): string {
    return createHash('sha256')
      .update(`${this.index}${this.data}${this.timestamp}${this.previousHash}`)
      .digest('hex');
  }

  /**
   * Check if the block is valid
   * @returns true if the block is valid, false otherwise
   */
  isValid(previousIndex: number, previousHash: string): Validation {
    if (this.index === 0) {
      return this.#validateGenesisBlock();
    }

    return this.#validateBlock(previousIndex, previousHash);
  }

  /**
   * Validate the genesis block
   * @returns true if the genesis block is valid, false otherwise
   */
  #validateGenesisBlock(): Validation {
    if (this.previousHash !== '') {
      return Validation.failure('Genesis block must have an empty previous hash.');
    }

    if (this.data.length === 0) {
      return Validation.failure('Genesis block must contain data.');
    }

    return Validation.success();
  }

  /**
   * Validate the block
   * @param previousIndex The index of the previous block
   * @param previousHash The hash of the previous block
   * @returns true if the block is valid, false otherwise
   */
  #validateBlock(previousIndex: number, previousHash: string): Validation {
    if (this.hash !== this.#getHash()) {
      /* c8 ignore next */
      return Validation.failure('Block hash is invalid.');
    }

    if (this.index !== previousIndex + 1) {
      const message = `Block index is invalid.`;
      return Validation.failure(message);
    }

    if (this.previousHash !== previousHash || this.previousHash.length === 0) {
      return Validation.failure('Previous hash is invalid.');
    }

    if (this.timestamp <= 0) {
      return Validation.failure('Timestamp is invalid.');
    }

    if (this.data.length === 0) {
      return Validation.failure('Block data is invalid.');
    }

    return Validation.success();
  }
}

export default Block;