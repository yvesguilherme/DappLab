import { describe, it, expect, beforeEach, jest, beforeAll } from '@jest/globals';

import Block from '../src/lib/block';
import BlockInfo from '../src/lib/model/block-info.model';
import Validation from '../src/lib/validation';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/model/transaction.model';
import TransactionInput from '../src/lib/transaction-input';
import TransactionOutput from '../src/lib/transaction-output';
import Wallet from '../src/lib/wallet';

jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transaction-input');
jest.mock('../src/lib/transaction-output');

describe('Block tests', () => {
  let genesisBlock: Block;
  let block: Block;
  let alice: Wallet;
  const difficulty = 1;

  beforeAll(() => { alice = new Wallet(); });

  beforeEach(() => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput()],
      txInputs: [new TransactionInput()]
    } as Transaction);
    tx.hash = tx.getHash();

    genesisBlock = new Block({
      index: 0,
      previousHash: '',
      transactions: [tx],
      nonce: 1,
      miner: alice.publicKey
    } as Block);
    jest.clearAllMocks();
  });

  it('should be invalid genesis block (previous hash)', () => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput()],
      txInputs: [new TransactionInput()]
    } as Transaction);
    tx.hash = tx.getHash();

    block = new Block({
      index: 0,
      miner: alice.publicKey,
      previousHash: 'invalid',
      transactions: [] as Transaction[]
    } as Block);
    expect(block.isValid(-1, '', difficulty)).toEqual(Validation.failure('Invalid previous hash.'));
  });

  it('should be invalid (no fee tx)', () => {
    const tx = new Transaction({
      txOutputs: [new TransactionOutput()],
      txInputs: [new TransactionInput()]
    } as Transaction);
    tx.hash = tx.getHash();

    block = new Block({
      index: 0,
      miner: alice.publicKey,
      previousHash: genesisBlock.hash,
      transactions: [tx]
    } as Block);

    expect(block.isValid(-1, '', difficulty)).toEqual(Validation.failure('No fee tx.'));
  });

  it('should be invalid (different from miner)', () => {
    const tx = new Transaction({
      txOutputs: [new TransactionOutput()],
      type: TransactionType.FEE,
      txInputs: [new TransactionInput()]
    } as Transaction);
    tx.hash = tx.getHash();

    block = new Block({
      index: 0,
      miner: 'differentMiner',
      previousHash: genesisBlock.hash,
      transactions: [tx]
    } as Block);

    expect(block.isValid(-1, '', difficulty)).toEqual(Validation.failure('Invalid fee tx: different from miner.'));
  });

  it('should be invalid (timestamp)', () => {
    block = new Block({
      index: 1,
      miner: alice.publicKey,
      previousHash: genesisBlock.hash,
      transactions: [] as Transaction[],
      timestamp: - 1
    } as Block);
    expect(block.isValid(genesisBlock.index, genesisBlock.hash, difficulty)).toEqual(Validation.failure('Invalid timestamp.'));
  });

  it('should be invalid (index)', () => {
    block = new Block({
      index: -1,
      miner: alice.publicKey,
      previousHash: genesisBlock.hash,
      transactions: [] as Transaction[]
    } as Block);
    expect(block.isValid(genesisBlock.index, genesisBlock.hash, difficulty)).toEqual(Validation.failure('Invalid previous index.'));
  });

  it('should be invalid (previous index)', () => {
    block = new Block({
      index: -1,
      miner: alice.publicKey,
      previousHash: genesisBlock.hash,
      transactions: [] as Transaction[]
    } as Block);
    expect(block.isValid(genesisBlock.index, genesisBlock.hash, difficulty)).toEqual(Validation.failure('Invalid previous index.'));
  });

  it('should fail validation if the previous hash is invalid', () => {
    const previousBlock = new Block({
      index: 0,
      previousHash: '',
      miner: alice.publicKey,
      transactions: [] as Transaction[]
    } as Block);

    const block = new Block({
      index: 1,
      miner: alice.publicKey,
      previousHash: 'invalidPreviousHash',
      transactions: [] as Transaction[]
    } as Block);

    const validation = block.isValid(previousBlock.index, previousBlock.hash, difficulty);
    expect(validation.message).toBe('Invalid previous hash.');
  });

  it('should return "no mined" if nonce or miner is invalid', () => {
    const previousBlock = new Block({
      index: 0,
      previousHash: '',
      miner: alice.publicKey,
      transactions: [] as Transaction[]
    } as Block);

    const block = new Block({
      index: 1,
      previousHash: previousBlock.hash,
      transactions: [] as Transaction[],
      nonce: 0,
      miner: alice.publicKey
    } as Block);

    const validation = block.isValid(previousBlock.index, previousBlock.hash, difficulty);
    expect(validation.message).toBe('No mined.');
  });

  it('should return Invalid hash if the hash is invalid', () => {
    const previousBlock = new Block({
      index: 0,
      previousHash: '',
      miner: alice.publicKey,
      transactions: [] as Transaction[]
    } as Block);

    const block = new Block({
      index: 1,
      previousHash: previousBlock.hash,
      transactions: [] as Transaction[],
      nonce: 1,
      miner: alice.publicKey
    } as Block);

    block.hash = 'invalidHash';

    const validation = block.isValid(previousBlock.index, previousBlock.hash, difficulty);
    expect(validation.message).toBe('Invalid hash.');
  });

  it('should create a valid block when the index, previousHash or data is not provided in the constructor', () => {
    const block1 = new Block({
      previousHash: genesisBlock.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()]
        } as Transaction)
      ]
    } as Block);

    const block2 = new Block({
      index: 1,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()]
        } as Transaction)
      ]
    } as Block);

    const block3 = new Block({
      index: 1,
      previousHash: genesisBlock.hash
    } as Block);

    expect(block1).toBeDefined();
    expect(block2).toBeDefined();
    expect(block3).toBeDefined();
  });

  it('should create from block info', () => {
    const block = Block.fromBlockInfoToBlock({
      index: 1,
      previousHash: genesisBlock.hash,
      transactions: [],
      difficulty: 0,
      feePerTx: 1,
      maxDifficulty: 62
    } as BlockInfo);

    block.transactions.push(new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput({
        toAddress: alice.publicKey,
        amount: 1
      } as TransactionOutput)],
    } as Transaction))

    block.mine(difficulty, alice.publicKey);

    const valid = block.isValid(genesisBlock.index, genesisBlock.hash, difficulty);
    expect(valid).toEqual(Validation.success());
    expect(valid.success).toBeTruthy();
    expect(block.index).toEqual(1);
    expect(block.previousHash).toEqual(genesisBlock.hash);
    expect(block.transactions.length).toBeGreaterThanOrEqual(1);
  });

  it('should fail validation if there are multiple fee transactions in the block', () => {
    const tx1 = new Transaction({ txInputs: [new TransactionInput()], type: TransactionType.FEE } as Transaction);
    tx1.hash = tx1.getHash();
    const tx2 = new Transaction({ txInputs: [new TransactionInput()], type: TransactionType.FEE } as Transaction);
    tx2.hash = tx2.getHash();

    block = new Block({
      index: 1,
      previousHash: genesisBlock.hash,
      transactions: [tx1, tx2],
      nonce: 1,
      miner: alice.publicKey
    } as Block);

    const validation = block.isValid(genesisBlock.index, genesisBlock.hash, difficulty);

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('Too many fee transactions in block.');
  });

  it('should fail validation if there are too many transactions in the block', () => {
    const txInputs = [new TransactionInput()];
    txInputs[0].amount = -1;

    const tx1 = new Transaction({ txOutputs: [new TransactionOutput()], type: TransactionType.FEE, txInputs } as Transaction);
    const tx2 = new Transaction({ txOutputs: [new TransactionOutput()], type: TransactionType.FEE, txInputs } as Transaction);

    block = new Block({
      index: 1,
      previousHash: genesisBlock.hash,
      transactions: [tx1, tx2],
      nonce: 1,
      miner: alice.publicKey
    } as Block);

    const validation = block.isValid(genesisBlock.index, genesisBlock.hash, difficulty);

    expect(validation.success).toBe(false);
    expect(validation.message).toBe(`Too many fee transactions in block.`);
  });

  it('should fail validation if there are invalid transactions in the block', () => {
    const txInputs = [new TransactionInput()];
    txInputs[0].amount = -1;

    const txOutputs = new TransactionOutput({
      toAddress: alice.publicKey,
      amount: 0
    } as TransactionOutput);

    const tx1 = new Transaction({
      txOutputs: [txOutputs],
      type: TransactionType.FEE,
      txInputs,
      timestamp: -1
    } as Transaction);

    const tx2 = new Transaction({
      txOutputs: [txOutputs],
      type: TransactionType.REGULAR,
      txInputs,
      timestamp: -1
    } as Transaction);

    block = new Block({
      index: 1,
      previousHash: genesisBlock.hash,
      transactions: [tx1, tx2],
      nonce: 1,
      miner: alice.publicKey
    } as Block);

    // Set a valid hash for the block to ensure transaction validation is checked
    block.hash = block.getHash();

    const validation = block.isValid(genesisBlock.index, genesisBlock.hash, difficulty);

    expect(validation.success).toBe(false);
    expect(validation.message).toBe(`Invalid block due to invalid tx: Invalid mock transaction., Invalid mock transaction.`);
  });
});