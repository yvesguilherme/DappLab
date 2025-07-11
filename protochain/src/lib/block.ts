import { createHash } from 'crypto';

import Validation from './validation.ts';
import BlockInfo from './model/block-info.model.ts';
import Transaction from './transaction.ts';
import TransactionType from './model/transaction.model.ts';

class Block {
  index: number;
  timestamp: number;
  previousHash: string;
  transactions: Transaction[];
  hash: string;
  nonce: number;
  miner: string;

  /**
   * @param index The index of the block in the chain
   * @param hash The hash of the block
   * @param previousHash The hash of the previous block
   * @param data The data stored in the block
   * @param timestamp The timestamp of the block creation
   * @param nonce The nonce used to mine the block
   * @param miner The miner who mined the block
   */
  constructor(block?: Block) {
    this.index = block?.index ?? 0;
    this.timestamp = block?.timestamp ?? Date.now();
    this.previousHash = block?.previousHash ?? '';
    this.transactions = block?.transactions ? block.transactions.map(tx => new Transaction(tx)) : [];
    this.nonce = block?.nonce ?? 0;
    this.miner = block?.miner ?? '';
    this.hash = block?.hash ?? this.getHash();
  }

  /**
   * Get the hash of the block
   * @returns The hash of the block
   */
  getHash(): string {
    const txs = this.transactions.map(tx => tx.hash).join('');

    return createHash('sha256')
      .update(`${this.index}${txs}${this.timestamp}${this.previousHash}${this.nonce}${this.miner}`)
      .digest('hex');
  }

  /**
   * Generates a new valid hash for the block with the given difficulty
   * @param difficulty The difficulty of the block
   * @param miner The miner who mined the block
   */
  mine(difficulty: number, miner: string): void {
    this.miner = miner;
    const prefix = this.createPrefix(difficulty);

    do {
      this.nonce++;
      this.hash = this.getHash();
    } while (!this.hash.startsWith(prefix));
  }

  private createPrefix(difficulty: number): string {
    return '0'.repeat(difficulty);
  }

  /**
   * Check if the block is valid
   * @param previousIndex The index of the previous block
   * @param previousHash The hash of the previous block
   * @param difficulty The difficulty of the block
   * @returns true if the block is valid, false otherwise
   */
  isValid(previousIndex: number, previousHash: string, difficulty: number): Validation {
    if (this.transactions.length) {
      const manyTxFee = this.transactions.filter(tx => tx.type === TransactionType.FEE);
      const validations = this.transactions.map(tx => tx.isValid());
      const errors = validations.filter(validation => !validation.success).map(validation => validation.message);

      if (!manyTxFee.length) return Validation.failure('No fee tx.');

      if (manyTxFee.length > 1) return Validation.failure('Too many fee transactions in block.');

      if (manyTxFee[0].to !== this.miner) return Validation.failure('Invalid fee tx: different from miner.');

      if (errors.length) return Validation.failure('Invalid block due to invalid tx: ' + errors.join(', '));
    }

    if (previousIndex !== this.index - 1) return Validation.failure('Invalid previous index.');
    if (this.timestamp < 1) return Validation.failure('Invalid timestamp.');
    if (previousHash !== this.previousHash) return Validation.failure('Invalid previous hash.');
    if (!this.nonce || !this.miner) return Validation.failure('No mined.');

    const prefix = this.createPrefix(difficulty);

    if (this.hash !== this.getHash() || !this.hash.startsWith(prefix)) return Validation.failure('Invalid hash.');

    return Validation.success();
  }

  static fromBlockInfoToBlock(blockInfo: BlockInfo): Block {
    const block = new Block();
    block.index = blockInfo.index;
    block.previousHash = blockInfo.previousHash;
    block.transactions = blockInfo.transactions.map(tx => new Transaction(tx));
    return block;
  }
}

export default Block;