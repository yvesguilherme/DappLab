import Validation from '../../validation.ts';

/**
 * Mock Block class for testing purposes
 */
class Block {
  readonly index: number;
  readonly timestamp: number;
  readonly hash: string;
  readonly previousHash: string;
  readonly data: string;
  
  /**
   * Create a new mock Block
   * @param index the index of the block
   * @param previousHash the hash of the previous block
   * @param data the data to be stored in the block
   * @param timestamp the timestamp of the block
   */
  constructor(index: number, previousHash: string, data: string, timestamp = Date.now()) {
    this.index = index;
    this.timestamp = timestamp;
    this.previousHash = previousHash ?? '';
    this.data = data ?? '';
    this.hash = this.#getHash();

    Object.freeze(this);
  }

  #getHash(): string {
    return "abcdef1234567890";
  }

  /**
   * Validate the mock Block
   * @param previousIndex the index of the previous block
   * @param previousHash the hash of the previous block
   * @returns Validation object indicating success or failure
   */
  isValid(previousIndex: number, previousHash: string): Validation {
    if (previousIndex < 0 || this.index < 0 || !previousHash) {
      return Validation.failure('Invalid mock block.');
    }

    return Validation.success();
  }
}

export default Block;