import Block from './model/block.model.ts';

class Blockchain {
  readonly #chain: Block[];
  #nextIndex = 0;

  constructor() {
    this.#chain = [new Block(this.#nextIndex, '', 'Genesis Block')];
    this.#nextIndex++;
  }

  getChain(): Block[] {
    return this.#chain;
  }

  getLastBlock(): Block {
    return this.#chain[this.#chain.length - 1];
  }

  getBlock(index: number): Block | null {
    return this.#chain[index] || null;
  }

  addBlock(block: Block): boolean {
    const lastBlock = this.getLastBlock();

    if (!block.isValid(lastBlock.index, lastBlock.hash)) {
      return false;
    }

    this.#chain.push(block);
    this.#nextIndex++;

    return true;
  }

  isValid(): boolean {
    for (let i = this.#chain.length - 1; i > 0; i--) {
      const currentBlock = this.#chain[i];
      const previousBlock = this.#chain[i - 1];

      const isValid = currentBlock.isValid(previousBlock.index, previousBlock.hash);

      if (!isValid) {
        return false;
      }
    }

    return true;
  }
}

export default Blockchain;