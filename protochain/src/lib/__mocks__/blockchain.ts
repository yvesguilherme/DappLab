import IBlockInfo from '../model/block-info.model.ts';
import Block from '../block.ts';
import Validation from '../validation.ts';
import Transaction from '../transaction.ts';
import TransactionType from '../model/transaction.model.ts';
import TransactionSearch from '../model/transaction-search.model.ts';
import TransactionInput from '../transaction-input.ts';

/**
 * Mock Blockchain class for testing purposes.
 */
class Blockchain {
  static readonly MAX_DIFFICULTY = 62;
  readonly #chain: Block[];
  #nextIndex = 0;
  mempool: Transaction[];

  /**
   * Creates a new instance of the mock Blockchain class.
   * Initializes the blockchain with a genesis block.
   */
  constructor() {
    this.#chain = [new Block({
      index: this.#nextIndex, 
      previousHash: 'abc', 
      transactions: [new Transaction({ txInput: new TransactionInput(), type: TransactionType.FEE } as Transaction)]
    } as Block)];
    this.mempool = [];
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

  getFeePerTx(): number {
    return 1;
  }
  
  addTransaction(transaction: Transaction): Validation {
    const validation = transaction.isValid();

    if (!validation.success) { 
      return validation;
    }

    this.mempool.push(transaction);

    return Validation.success();
  }

  getTransaction(hash: string): TransactionSearch {
    return {
      mempoolIndex: 0,
      transaction: {
        hash
      }
    } as TransactionSearch;
  }

  getNextBlock(): IBlockInfo {
    const transactions = [new Transaction({ txInput: new TransactionInput() } as Transaction)];
    const difficulty = 1;
    const previousHash = this.getLastBlock().hash;
    const index = 1;
    const feePerTx = this.getFeePerTx();
    const maxDifficulty = Blockchain.MAX_DIFFICULTY;

    return { transactions, index, previousHash, difficulty, maxDifficulty, feePerTx } as IBlockInfo;
  }
}

export default Blockchain;