import Validation from '../validation';
import Transaction from './transaction';

/**
 * Mock Block class for testing purposes
 */
class Block {
  index: number;
  timestamp: number;
  previousHash: string;
  transactions: Transaction[];
  hash: string;
  nonce: number;
  miner: string;
  
  /**
   * Create a new mock Block
   * @param index the index of the block
   * @param previousHash the hash of the previous block
   * @param data the data to be stored in the block
   * @param timestamp the timestamp of the block
   */
  constructor(block: Partial<Block>) {
    this.index = block?.index ?? 0;
    this.timestamp = block?.timestamp ?? Date.now();
    this.previousHash = block?.previousHash ?? '';
    this.transactions = block?.transactions ?? [] as Transaction[];
    this.nonce = block?.nonce ?? 0;
    this.miner = block?.miner ?? 'abc';
    this.hash = block?.hash ?? this.getHash();
  }

  getHash(): string {
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

  mine(difficulty: number, miner: string): void {
    this.miner = miner;
    const prefix = this.createPrefix(difficulty);

    this.nonce = 0;
    this.hash = prefix + "abcdef1234567890".slice(prefix.length);
  }

  private createPrefix(difficulty: number): string {
    return '0'.repeat(difficulty + 1);
  }
}

export default Block;