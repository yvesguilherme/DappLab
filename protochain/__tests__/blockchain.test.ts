import { beforeEach, describe, it, expect, jest } from '@jest/globals';

import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import Validation from '../src/lib/validation';
import Transaction from '../src/lib/transaction';

let blockchain: Blockchain;
let lastHashBlock: string;

jest.mock('../src/lib/block');
jest.mock('../src/lib/transaction');

beforeEach(() => {
  blockchain = new Blockchain();
  lastHashBlock = blockchain.getLastBlock().hash;
  jest.clearAllMocks();
});

describe('Blockchain tests', () => {
  it('should create a new blockchain with genesis block', () => {
    expect(blockchain).toBeDefined();
    expect(blockchain.getChain()).toHaveLength(1);
    expect(blockchain.getBlock(0)).toBeDefined();
    expect(blockchain.getBlock(0)).toEqual(blockchain.getLastBlock());
  });

  it('should be valid', () => {
    const block1 = new Block({ index: 1, previousHash: lastHashBlock, transactions: [new Transaction({ data: 'Tx' } as Transaction)] } as Block);
    blockchain.addBlock(block1);
    expect(blockchain.isValid()).toEqual(true);
  });

  it('should add a new valid block to the blockchain', () => {
    const tx = new Transaction({ data: 'tx1' } as Transaction);

    blockchain.mempool.push(tx);

    const block = new Block({ index: 1, previousHash: lastHashBlock, transactions: [tx] } as Block);

    expect(blockchain.addBlock(block)).toEqual({ success: true, message: '' });
    expect(blockchain.getChain()).toHaveLength(2);
    expect(blockchain.getBlock(1)).toEqual(block);
  });

  it('should not add an invalid block to the blockchain', () => {
    const block = new Block({ index: 1, previousHash: lastHashBlock, transactions: [{}] } as Block);
    jest.spyOn(block, 'isValid').mockReturnValue(Validation.failure('Invalid mock block.'));

    expect(blockchain.addBlock(block)).toEqual({ success: false, message: 'Invalid mock block.' });
    expect(blockchain.getChain()).toHaveLength(1);
  });

  it('should return null for a non-existent block', () => {
    expect(blockchain.getBlock(1)).toBeNull();
    expect(blockchain.getBlock('abc')).toBeNull();
  });

  it('should return the correct block for a valid index', () => {
    const tx = new Transaction({ data: 'tx1' } as Transaction);

    blockchain.mempool.push(tx);

    const block = new Block({ index: 1, previousHash: lastHashBlock, transactions: [tx] } as Block);
    blockchain.addBlock(block);

    expect(blockchain.getBlock(1)).toEqual(block);
  });

  it('should return the correct block for a valid hash', () => {
    expect(blockchain.getBlock('abcdef1234567890')).toEqual(blockchain.getChain()[0]);
  });

  it('should ensure blocks have increasing timestamps', async () => {
    const block1 = new Block({ index: 1, previousHash: lastHashBlock, transactions: [new Transaction({ data: 'Tx' } as Transaction)] } as Block);
    blockchain.addBlock(block1);

    await new Promise((resolve) => setTimeout(resolve, 5));

    const block2 = new Block({ index: 2, previousHash: block1.hash, transactions: [new Transaction({ data: 'Tx' } as Transaction)] } as Block);
    blockchain.addBlock(block2);

    expect(block2.timestamp).toBeGreaterThan(block1.timestamp);
  });

  it('should return false if a block is invalid', () => {
    const block1 = new Block({ index: 1, previousHash: lastHashBlock, transactions: [new Transaction({ data: 'Tx' } as Transaction)] } as Block);
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
    blockchain.mempool.push(new Transaction({ data: 'Tx' } as Transaction));
    const info = blockchain.getNextBlock();
    expect(info ? info.index : 0).toEqual(1);
  });

  it('should not get next block info', () => {
    blockchain.addTransaction(new Transaction({ data: 'Tx' } as Transaction));
    const info = blockchain.getNextBlock();
    expect(info).toBeNull();
  });

  it('should add transaction', () => {
    const tx = new Transaction({ data: 'tx1', hash: 'xyz' } as Transaction);
    const validation = blockchain.addTransaction(tx);    

    expect(validation.success).toBe(true);
  });

  it('should not add transaction (invalid tx)', () => {
    const tx = new Transaction({ data: '', hash: 'xyz' } as Transaction);
    const validation = blockchain.addTransaction(tx);

    expect(validation.success).toBe(false);
  });

  it('should not add transaction (duplicated in blockchain)', () => {
    const tx = new Transaction({ data: '123', hash: 'xyz' } as Transaction);

    blockchain.getChain().push(new Block({ transactions: [tx] } as Block));

    const validation = blockchain.addTransaction(tx);

    expect(validation.success).toBe(false);
  });

  it('should not add transaction (duplicated in mempool)', () => {
    const tx = new Transaction({ data: '123', hash: 'xyz' } as Transaction);

    blockchain.mempool.push(tx);

    const validation = blockchain.addTransaction(tx);

    expect(validation.success).toBe(false);
  });

  it('should get transaction (mempool)', () => {
    const tx = new Transaction({ data: 'tx1', hash: 'abc' } as Transaction);
    blockchain.mempool.push(tx);

    const result = blockchain.getTransaction('abc');
    expect(result.mempoolIndex).toEqual(0);
  });

  it('should get transaction (blockchain)', () => {
    const tx = new Transaction({ data: 'tx1', hash: 'XYZ' } as Transaction);

    blockchain.getChain().push(new Block({transactions: [tx]} as Block));

    const result = blockchain.getTransaction('XYZ');
    expect(result.blockIndex).toEqual(1);
  });

  it('should not get transaction (not found)', () => {
    const result = blockchain.getTransaction('notfound');
    expect(result).toEqual({ mempoolIndex: -1, blockIndex: -1 });
  });
});