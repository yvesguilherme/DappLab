import Block from './block.ts';
import Validation from './validation.ts';
import IBlockInfo from './model/block-info.model.ts';
import Transaction from './transaction.ts';
import TransactionType from './model/transaction.model.ts';
import TransactionSearch from './model/transaction-search.model.ts';
import TransactionOutput from './transaction-output.ts';
import TransactionInput from './transaction-input.ts';

class Blockchain {
  static readonly DIFFCULTY_FACTOR = 2;
  static readonly MAX_DIFFICULTY = 62;
  static readonly TX_PER_BLOCK = 2;
  chain: Block[];
  #nextIndex = 0;
  mempool: Transaction[];

  constructor(miner: string) {
    this.chain = [];
    this.mempool = [];

    const genesis = this.createGenesisBlock(miner);
    this.chain.push(genesis);
    this.#nextIndex++;
  }

  createGenesisBlock(miner: string): Block {
    const amount = Blockchain.getRewardAmount(this.getDifficulty());

    const txo = new TransactionOutput({
      toAddress: miner,
      amount,
    } as TransactionOutput);
    const tx = Transaction.fromReward(txo);

    tx.hash = tx.getHash();
    tx.txOutputs[0].tx = tx.hash;

    const block = new Block();
    block.transactions = [tx];
    block.mine(this.getDifficulty(), miner);

    return block;
  }

  getChain(): Block[] {
    return this.chain;
  }

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  getBlock(hashOrIndex: number | string): Block | null {
    if (typeof hashOrIndex === 'number') {
      return this.chain[hashOrIndex] || null;
    }

    return this.chain.find((b) => b.hash === hashOrIndex) || null;
  }

  getDifficulty(): number {
    return Math.ceil(this.chain.length / Blockchain.DIFFCULTY_FACTOR) + 1;
  }

  addTransaction(transaction: Transaction): Validation {
    if (transaction.txInputs?.length) {
      const fromAddress = transaction.txInputs[0].fromAddress;

      const pendingTx = this.mempool.some(tx =>
        tx.txInputs?.some(txi => txi.fromAddress === fromAddress)
      );

      if (pendingTx) {
        return new Validation(false, `This wallet has a pending transaction.`);
      }

      const utxo = this.getUTXO(fromAddress);

      for (let i = 0; i < transaction.txInputs.length; i++) {
        const txi = transaction.txInputs[i];
        const utxoIndex = utxo.findIndex(txo => txo.tx === txi.previousTx && txo.amount >= txi.amount);

        if (utxoIndex === -1) {
          return Validation.failure(`Invalid transaction: the TXO is already spent or unexistent.`);
        }

        // if (txi.fromAddress !== fromAddress) {
        //   return new Validation(false, `Input ${i} does not match the wallet address.`);
        // }
      }
    }

    const validation = transaction.isValid(this.getDifficulty(), this.getFeePerTx());

    if (!validation.success) {
      return new Validation(false, `Invalid tx: ${validation.message}`);
    }

    if (this.chain.some(b => b.transactions.some(tx => tx.hash === transaction.hash))) {
      return new Validation(false, 'Duplicated tx in blockchain.');
    }

    if (this.mempool.some(tx => tx.hash === transaction.hash)) {
      return new Validation(false, 'Duplicated tx in mempool.');
    }

    this.mempool.push(transaction);

    return new Validation(true, transaction.hash);
  }

  addBlock(block: Block): Validation {
    const nextBlock = this.getNextBlock();

    if (!nextBlock) {
      return Validation.failure('There is no next block info.');
    }

    const blockValidation: Validation = block.isValid(nextBlock.index - 1, nextBlock.previousHash, nextBlock.difficulty, nextBlock.feePerTx);

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
      this.chain.push(block);
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

    const blockIndex = this.chain.findIndex(block => block.transactions.some(tx => tx.hash === hash));

    if (blockIndex !== -1) {
      return {
        blockIndex,
        transaction: this.chain[blockIndex].transactions.find(tx => tx.hash === hash) as Transaction,
      } as TransactionSearch;
    }

    return { blockIndex: -1, mempoolIndex: -1 } as TransactionSearch;
  }

  isValid(): boolean {
    for (let i = this.chain.length - 1; i > 0; i--) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      const isValid = currentBlock.isValid(previousBlock.index, previousBlock.hash, this.getDifficulty(), this.getFeePerTx());

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
    const index = this.chain.length;
    const feePerTx = this.getFeePerTx();
    const maxDifficulty = Blockchain.MAX_DIFFICULTY;

    return { transactions, index, previousHash, difficulty, maxDifficulty, feePerTx } as IBlockInfo;
  }

  getTxInputs(wallet: string): (TransactionInput | undefined)[] {
    return this.chain
      .flatMap(block => block.transactions)
      .flatMap(tx => tx.txInputs ?? [])
      .filter(txi => txi?.fromAddress === wallet);
  }

  getTxOutputs(wallet: string): TransactionOutput[] {
    return this.chain
      .flatMap(block => block.transactions)
      .flatMap(tx => tx.txOutputs ?? [])
      .filter(txo => txo.toAddress === wallet);
  }

  getUTXO(wallet: string): TransactionOutput[] {
    const txIns = this.getTxInputs(wallet);
    const txOuts = this.getTxOutputs(wallet);

    if (!txIns.length) {
      return txOuts;
    }

    txIns.forEach(txi => {
      const txOutIndex = txOuts.findIndex(txo => txo.amount === txi?.amount);
      if (txOutIndex !== -1) {
        txOuts.splice(txOutIndex, 1);
      }
    });

    return txOuts;
  }

  getBalance(wallet: string): string { 
    const utxo = this.getUTXO(wallet);

    if(!utxo || !utxo.length) {
      return '0';
    }

    return utxo.
      reduce((acc, txo) => acc + txo?.amount, 0n)
      .toString();
  }

  static getRewardAmount(difficulty: number): bigint {
    return BigInt((64 - difficulty) * 10);
  }
  
}

export default Blockchain;