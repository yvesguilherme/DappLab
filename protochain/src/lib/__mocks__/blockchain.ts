import IBlockInfo from '../model/block-info.model.ts';
import Block from '../block.ts';
import Validation from '../validation.ts';
import Transaction from '../transaction.ts';
import TransactionType from '../model/transaction.model.ts';
import TransactionSearch from '../model/transaction-search.model.ts';
import TransactionOutput from '../transaction-output.ts';

/**
 * Mock Blockchain class for testing purposes.
 */
class Blockchain {
  static readonly MAX_DIFFICULTY = 62;
  chain: Block[];
  #nextIndex = 0;
  mempool: Transaction[];

  /**
   * Creates a new instance of the mock Blockchain class.
   * Initializes the blockchain with a genesis block.
   */
  constructor(miner: string) {
    this.chain = [];
    this.mempool = [new Transaction()];

    const genesis = this.createGenesisBlock(miner);
    this.chain.push(genesis);

    this.#nextIndex++;
  }

  createGenesisBlock(miner: string): Block {
    const amount = BigInt(10);

    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput({
        toAddress: miner,
        amount,
      } as TransactionOutput)],
    } as Transaction);

    tx.hash = tx.getHash();
    tx.txOutputs[0].tx = tx.hash;

    const block = new Block({
      transactions: [tx],
      index: this.#nextIndex,
      previousHash: '',
      hash: 'abc',
      timestamp: Date.now(),
    } as Block);

    block.mine(1, miner);

    return block;
  }

  getChain(): Block[] {
    return this.chain;
  }

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  getBlock(hashOrIndex: number | string): Block | null {
    if (!hashOrIndex === null || hashOrIndex === '-1') {
      return null;
    }

    if (typeof hashOrIndex === 'number') {
      return this.chain[hashOrIndex] || null;
    }

    return this.chain.find((b) => b.hash === hashOrIndex) || null;
  }

  addBlock(block: Block): Validation {
    if (block.index < 0) {
      return Validation.failure('Invalid mock block.');
    }

    this.chain.push(block);
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
    if (hash === '-1') {
      return { mempoolIndex: -1, blockIndex: -1 } as TransactionSearch;
    }

    return {
      mempoolIndex: 0,
      transaction: new Transaction()
    } as TransactionSearch;
  }

  getNextBlock(): IBlockInfo {
    const transactions = this.mempool.slice(0, 2);
    const difficulty = 1;
    const previousHash = this.getLastBlock().hash;
    const index = this.chain.length;
    const feePerTx = this.getFeePerTx();
    const maxDifficulty = Blockchain.MAX_DIFFICULTY;

    return { transactions, index, previousHash, difficulty, maxDifficulty, feePerTx } as IBlockInfo;
  }
}

export default Blockchain;