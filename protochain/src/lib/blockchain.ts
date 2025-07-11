import Block from './block.ts';
import Validation from './validation.ts';
import IBlockInfo from './model/block-info.model.ts';
import Transaction from './transaction.ts';
import TransactionType from './model/transaction.model.ts';
import TransactionSearch from './model/transaction-search.model.ts';
import TransactionInput from './transaction-input.ts';

class Blockchain {
  static readonly DIFFCULTY_FACTOR = 2;
  static readonly MAX_DIFFICULTY = 62;
  static readonly TX_PER_BLOCK = 2;
  readonly #chain: Block[];
  #nextIndex = 0;
  mempool: Transaction[];

  constructor() {
    this.#chain = [new Block({
      index: this.#nextIndex,
      previousHash: '',
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          txInput: new TransactionInput(),
        } as Transaction)
      ]
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

  getDifficulty(): number {
    return Math.ceil(this.#chain.length / Blockchain.DIFFCULTY_FACTOR) + 1;
  }

  addTransaction(transaction: Transaction): Validation {
    if (transaction.txInput) {
      const fromAddress = transaction.txInput.fromAddress;
      const pendingTx = this.mempool.find(tx => tx.txInput?.fromAddress === fromAddress);

      if (pendingTx) {
        return new Validation(false, `This wallet has a pending transaction`);
      }

      // TODO: validate the source funds
    }

    const validation = transaction.isValid();

    if (!validation.success) {
      return new Validation(false, `Invalid tx: ${validation.message}`);
    }

    if (this.#chain.some(b => b.transactions.some(tx => tx.hash === transaction.hash))) {
      return new Validation(false, 'Duplicated tx in blockchain.');
    }

    if (this.mempool.some(tx => tx.hash === transaction.hash)) {
      return new Validation(false, 'Duplicated tx in mempool.');
    }

    this.mempool.push(transaction);

    return new Validation(true, transaction.hash);
  }

  addBlock(block: Block): Validation {
    const lastBlock = this.getLastBlock();

    const blockValidation: Validation = block.isValid(lastBlock.index, lastBlock.hash, this.getDifficulty());

    if (blockValidation.success) {
      const txs = block.transactions
        .filter(tx => tx.type !== TransactionType.FEE)
        .map(tx => tx.hash);
      const newMempool = this.mempool.filter(tx => !txs.includes(tx.hash));

      if (newMempool.length + txs.length !== this.mempool.length) {
        return Validation.failure('Invalid tx in block: mempool does not match');
      }

      this.mempool = newMempool;
      // blockValidation.message = block.hash; // TODO: check if this is needed
      this.#chain.push(block);
      this.#nextIndex++;
    }

    return blockValidation;
  }

  getTransaction(hash: string): TransactionSearch {
    const mempoolIndex = this.mempool.findIndex(tx => tx.hash === hash);

    if (mempoolIndex !== -1) {
      return {
        mempoolIndex,
        transaction: this.mempool[mempoolIndex],
      } as TransactionSearch;
    }

    const blockIndex = this.#chain.findIndex(block => block.transactions.some(tx => tx.hash === hash));

    if (blockIndex !== -1) {
      return {
        blockIndex,
        transaction: this.#chain[blockIndex].transactions.find(tx => tx.hash === hash) as Transaction,
      } as TransactionSearch;
    }

    return { blockIndex: -1, mempoolIndex: -1 } as TransactionSearch;
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

  getNextBlock(): IBlockInfo | null {
    if (!this.mempool?.length) {
      return null;
    }

    const transactions = this.mempool.slice(0, Blockchain.TX_PER_BLOCK);

    const difficulty = this.getDifficulty();
    const previousHash = this.getLastBlock().hash;
    const index = this.#chain.length;
    const feePerTx = this.getFeePerTx();
    const maxDifficulty = Blockchain.MAX_DIFFICULTY;

    return { transactions, index, previousHash, difficulty, maxDifficulty, feePerTx } as IBlockInfo;
  }
}

export default Blockchain;