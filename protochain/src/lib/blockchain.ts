import Block from './model/block.model.ts';
import Validation from './validation.ts';
import IBlockInfo from './model/block-info.model.ts';

class Blockchain {
  static readonly DIFFCULTY_FACTOR = 2;
  static readonly MAX_DIFFICULTY = 62;
  readonly #chain: Block[];
  #nextIndex = 0;

  constructor() {
    this.#chain = [new Block({ index: this.#nextIndex, previousHash: '', data: 'Genesis Block' } as Block)];
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

  getDifficulty(): number {
    return Math.ceil(this.#chain.length / Blockchain.DIFFCULTY_FACTOR);
  }

  addBlock(block: Block): Validation {
    const lastBlock = this.getLastBlock();

    const blockValidation: Validation = block.isValid(lastBlock.index, lastBlock.hash, this.getDifficulty());

    if (blockValidation.success) {
      this.#chain.push(block);
      this.#nextIndex++;
    }

    return blockValidation;
  }

  isValid(): boolean {
    for (let i = this.#chain.length - 1; i > 0; i--) {
      const currentBlock = this.#chain[i];
      const previousBlock = this.#chain[i - 1];

      const isValid = currentBlock.isValid(previousBlock.index, previousBlock.hash, this.getDifficulty());

      if (!isValid) {
        return false;
      }
    }

    return true;
  }

  getFeePerTx(): number {
    return 1;
  }

  getNextBlock(): IBlockInfo {
    const data = new Date().toISOString();
    const difficulty = this.getDifficulty();
    const previousHash = this.getLastBlock().hash;
    const index = this.#chain.length;
    const feePerTx = this.getFeePerTx();
    const maxDifficulty = Blockchain.MAX_DIFFICULTY;

    return { data, index, previousHash, difficulty, maxDifficulty, feePerTx } as IBlockInfo;
  }
}

export default Blockchain;