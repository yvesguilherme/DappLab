import Block from '../model/block.model.ts';
import Validation from '../validation.ts';

/**
 * Mock Blockchain class for testing purposes.
 */
class Blockchain {
  readonly #chain: Block[];
  #nextIndex = 0;

  /**
   * Creates a new instance of the mock Blockchain class.
   * Initializes the blockchain with a genesis block.
   */
  constructor() {
    this.#chain = [new Block({ index: this.#nextIndex, previousHash: 'abc', data: 'Genesis Block' } as Block)];
    this.#nextIndex++;
  }

  getChain(): Block[] {
    return this.#chain;
  }

  getLastBlock(): Block {
    return this.#chain[this.#chain.length - 1];
  }

  getBlock(hashOrIndex: number | string): Block | null {
    if (typeof hashOrIndex === 'number') {
      return this.#chain[hashOrIndex] || null;
    }

    return this.#chain.find((b) => b.hash === hashOrIndex) || null;
  }

  addBlock(block: Block): Validation {
    if (block.index < 0) {
      return Validation.failure('Invalid mock block.');
    }

    this.#chain.push(block);
    this.#nextIndex++;

    return Validation.success();
  }

  isValid(): boolean {
    return true;
  }
}

export default Blockchain;