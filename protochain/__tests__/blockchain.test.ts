import { beforeEach, describe, it, expect, jest, beforeAll } from '@jest/globals';

import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import Validation from '../src/lib/validation';
import Transaction from '../src/lib/transaction';
import TransactionInput from '../src/lib/transaction-input';
import Wallet from '../src/lib/wallet';
import TransactionOutput from '../src/lib/transaction-output';

let blockchain: Blockchain;
let lastHashBlock: string;

jest.mock('../src/lib/block');
jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transaction-input');
jest.mock('../src/lib/transaction-output');

describe('Blockchain tests', () => {
  let alice: Wallet;
  let bob: Wallet;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  beforeEach(() => {
    blockchain = new Blockchain(alice.publicKey);
    lastHashBlock = blockchain.getLastBlock().hash;
    jest.clearAllMocks();
  });

  it('should create a new blockchain with genesis block', () => {
    expect(blockchain).toBeDefined();
    expect(blockchain.getChain()).toHaveLength(1);
    expect(blockchain.getBlock(0)).toBeDefined();
    expect(blockchain.getBlock(0)).toEqual(blockchain.getLastBlock());
  });

  it('should be valid', () => {
    const block1 = new Block(
      {
        index: 1,
        previousHash: lastHashBlock,
        transactions: [new Transaction({ txInputs: [new TransactionInput()] } as Transaction)]
      } as Block);
    blockchain.addBlock(block1);
    expect(blockchain.isValid()).toEqual(true);
  });

  it('should add a new valid block to the blockchain', () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()] } as Transaction);

    blockchain.mempool.push(tx);

    const block = new Block({ index: 1, previousHash: lastHashBlock, transactions: [tx] } as Block);

    expect(blockchain.addBlock(block)).toEqual({ success: true, message: '' });
    expect(blockchain.getChain()).toHaveLength(2);
    expect(blockchain.getBlock(1)).toEqual(block);
  });

  it('should not add an invalid block to the blockchain', () => {
    const block = new Block({ index: 1, previousHash: lastHashBlock, transactions: [] as Transaction[] } as Block);

    expect(blockchain.addBlock(block)).toEqual(new Validation(false, 'There is no next block info.'));
    expect(blockchain.getChain()).toHaveLength(1);
  });

  it('should return null for a non-existent block', () => {
    expect(blockchain.getBlock(1)).toBeNull();
    expect(blockchain.getBlock('abc')).toBeNull();
  });

  it('should return the correct block for a valid index', () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()] } as Transaction);

    blockchain.mempool.push(tx);

    const block = new Block({
      index: 1,
      previousHash: lastHashBlock,
      transactions: [tx]
    } as Block);
    blockchain.addBlock(block);

    expect(blockchain.getBlock(1)?.hash).toEqual('abcdef1234567890');
  });

  it('should return the correct block for a valid hash', () => {
    expect(blockchain.getBlock('00cdef1234567890')).toEqual(blockchain.getChain()[0]);
  });

  it('should ensure blocks have increasing timestamps', async () => {
    const block1 = new Block({ index: 1, previousHash: lastHashBlock, transactions: [new Transaction({ txInputs: [new TransactionInput()] } as Transaction)] } as Block);
    blockchain.addBlock(block1);

    await new Promise((resolve) => setTimeout(resolve, 5));

    const block2 = new Block({ index: 2, previousHash: block1.hash, transactions: [new Transaction({ txInputs: [new TransactionInput()] } as Transaction)] } as Block);
    blockchain.addBlock(block2);

    expect(block2.timestamp).toBeGreaterThan(block1.timestamp);
  });

  it('should return false if a block is invalid', () => {
    const block1 = new Block({ index: 1, previousHash: lastHashBlock, transactions: [new Transaction({ txInputs: [new TransactionInput()] } as Transaction)] } as Block);
    blockchain.addBlock(block1);

    const mockBlock = {
      ...block1,
      isValid: jest.fn().mockReturnValue(false)
    };

    // @ts-ignore
    blockchain.getChain()[1] = mockBlock;

    expect(blockchain.isValid()).toEqual(false);
  });

  it('should get next block info', () => {
    blockchain.mempool.push(new Transaction({ txInputs: [new TransactionInput()] } as Transaction));
    const info = blockchain.getNextBlock();
    expect(info ? info.index : 0).toEqual(1);
  });

  it('should not get next block info', () => {
    blockchain.addTransaction(new Transaction({ txInputs: [new TransactionInput()] } as Transaction));
    const info = blockchain.getNextBlock();
    expect(info).toBeNull();
  });

  it('should add transaction', () => {
    const txo = blockchain.chain[0].transactions[0];
    const tx = new Transaction();
    tx.hash = 'tx';
    tx.txInputs = [new TransactionInput({
      amount: BigInt(10),
      previousTx: txo.hash,
      fromAddress: alice.publicKey,
      signature: 'abc'
    } as TransactionInput)];

    tx.txOutputs = [new TransactionOutput({
      toAddress: 'abc',
      amount: BigInt(10)
    } as TransactionOutput)];

    const validation = blockchain.addTransaction(tx);

    expect(validation.success).toBeTruthy();
  });

  it('should not add transaction (invalid tx)', () => {
    const tx = new Transaction();
    const txo = blockchain.chain[0].transactions[0];

    tx.hash = 'tx';
    tx.timestamp = -1;
    tx.txInputs = [new TransactionInput({
      amount: BigInt(10),
      previousTx: txo.hash,
      fromAddress: alice.publicKey,
      signature: 'abc'
    } as TransactionInput)];
    tx.txOutputs = [new TransactionOutput({
      amount: BigInt(10),
      toAddress: 'abc'
    } as TransactionOutput)];

    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toBeFalsy();
  });

  it('should not add transaction (pending tx)', () => {
    const tx = new Transaction();
    tx.hash = 'tx';
    tx.txInputs = [new TransactionInput({
      amount: BigInt(10),
      previousTx: 'xyz',
      fromAddress: alice.publicKey,
      signature: 'abc'
    } as TransactionInput)];
    tx.txOutputs = [new TransactionOutput({
      amount: BigInt(10),
      toAddress: 'abc'
    } as TransactionOutput)];

    blockchain.mempool.push(tx);
    const validation = blockchain.addTransaction(tx);

    expect(validation.success).toBeFalsy();
    expect(validation.message).toBe('This wallet has a pending transaction.');
  });

  it('should not add transaction (duplicated in blockchain)', () => {
    const tx = blockchain.chain[0].transactions[0];

    const validation = blockchain.addTransaction(tx);

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('Duplicated tx in blockchain.');
  });

  it('should not add transaction (duplicated in mempool)', () => {
    const tx = new Transaction({ hash: 'duplicate-hash' } as Transaction);
    tx.txInputs = undefined;

    blockchain.mempool.push(tx);

    const tx2 = new Transaction({ hash: 'duplicate-hash' } as Transaction);
    tx2.txInputs = undefined;

    const validation = blockchain.addTransaction(tx2);

    expect(validation.success).toBe(false);
    expect(validation.message).toBe('Duplicated tx in mempool.');
  });

  it('should get transaction (mempool)', () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()], hash: 'abc' } as Transaction);
    blockchain.mempool.push(tx);

    const result = blockchain.getTransaction('abc');
    expect(result.mempoolIndex).toEqual(0);
  });

  it('should get transaction (blockchain)', () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()], hash: 'XYZ' } as Transaction);

    blockchain.getChain().push(new Block({ transactions: [tx] } as Block));

    const result = blockchain.getTransaction('XYZ');
    expect(result.blockIndex).toEqual(1);
  });

  it('should not get transaction (not found)', () => {
    const result = blockchain.getTransaction('notfound');
    expect(result).toEqual({ mempoolIndex: -1, blockIndex: -1 });
  });

  it('addBlock() should return Invalid tx in block: mempool does not match', () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()], hash: '123' } as Transaction);
    blockchain.mempool.push(tx);

    const block = new Block({
      index: 1,
      previousHash: lastHashBlock,
      transactions: [new Transaction({ txInputs: [new TransactionInput()], hash: '456' } as Transaction)]
    } as Block);

    expect(blockchain.addBlock(block)).toEqual(new Validation(false, 'Invalid tx in block: mempool does not match'));
  });

  it('should get balance', () => {
    const info = blockchain.getBalance(alice.publicKey);
    expect(Number(info)).toBeGreaterThan(0);
  });

  it('should get zero balance', () => {
    const info = blockchain.getBalance(bob.publicKey);
    expect(Number(info)).toEqual(0);
  });

  it('should get UTXO', () => {
    const txo = blockchain.chain[0].transactions[0];
    const tx = new Transaction();
    tx.hash = 'tx';
    tx.txInputs = [new TransactionInput({
      amount: BigInt(10),
      previousTx: txo.hash,
      fromAddress: alice.publicKey,
      signature: 'abc'
    } as TransactionInput)];

    tx.txOutputs = [
      new TransactionOutput({
        toAddress: 'abc',
        amount: BigInt(5)
      } as TransactionOutput),
      new TransactionOutput({
        toAddress: alice.publicKey,
        amount: BigInt(4)
      } as TransactionOutput)
    ];

    blockchain.chain.push(new Block({
      index: 1,
      transactions: [tx]
    } as Block));

    const utxo = blockchain.getUTXO(alice.publicKey);

    expect(utxo.length).toBeGreaterThan(0);
  });

  it('should remove spent output from UTXO', () => {
    const rewardTx = blockchain.chain[0].transactions[0];
    const rewardOutput = rewardTx.txOutputs[0];

    const spendingTx = new Transaction();
    spendingTx.hash = 'tx-hash-1';
    spendingTx.txInputs = [
      new TransactionInput({
        amount: rewardOutput.amount,
        previousTx: rewardTx.hash,
        fromAddress: alice.publicKey,
        signature: 'sig'
      } as TransactionInput)
    ];
    spendingTx.txOutputs = [
      new TransactionOutput({
        amount: rewardOutput.amount,
        toAddress: bob.publicKey
      } as TransactionOutput)
    ];

    blockchain.chain.push(new Block({
      index: 1,
      transactions: [spendingTx]
    } as Block));

    const utxos = blockchain.getUTXO(alice.publicKey);

    expect(utxos.length).toEqual(0);
  });

  it('should handle undefined txOutputs in getTxOutputs', () => {
    const tx = new Transaction({ hash: 'test-hash' } as Transaction);
    (tx as any).txOutputs = undefined;

    const block = new Block({
      index: 1,
      transactions: [tx],
      previousHash: blockchain.getLastBlock().hash
    } as Block);

    blockchain.getChain().push(block);

    const outputs = blockchain.getTxOutputs('any-address');
    expect(outputs).toEqual([]);
  });
});