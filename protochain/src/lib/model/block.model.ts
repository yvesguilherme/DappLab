import { createHash } from 'crypto';

class Block {
  readonly index: number;
  readonly timestamp: number;
  readonly hash: string;
  readonly previousHash: string;
  readonly data: string;

  /**
   * 
   * @param index The index of the block in the chain
   * @param hash The hash of the block
   * @param previousHash The hash of the previous block
   * @param data The data stored in the block
   * @param timestamp The timestamp of the block creation
   */
  constructor(index: number, previousHash: string, data: string) {
    this.index = index;
    this.timestamp = Date.now();
    this.previousHash = previousHash;
    this.data = data;
    this.hash = this.#getHash();

    Object.freeze(this);
  }

  /**
   * Check if the block is valid
   * @returns true if the block is valid, false otherwise
   */
  isValid(previousIndex: number, previousHash: string): boolean {
    if (this.index === 0) {
      return this.previousHash === '' && this.data.length > 0;
    }
    
    const validHash = this.hash === this.#getHash();
    const hasValidIndex = this.index === previousIndex + 1;
    const hasValidPreviousHash = this.previousHash === previousHash && this.previousHash.length > 0;
    const hasValidTimestamp = this.timestamp > 0;
    const hasValidData = this.data.length > 0;

    return (
      hasValidIndex &&
      hasValidPreviousHash &&
      hasValidTimestamp &&
      hasValidData &&
      validHash
    );
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
}

export default Block;