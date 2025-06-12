import { beforeEach, describe, it, expect, jest } from '@jest/globals';

import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import Validation from '../src/lib/validation';

let blockchain: Blockchain;
let lastHashBlock: string;

jest.mock('../src/lib/block');

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
    const block1 = new Block({ index: 1, previousHash: lastHashBlock, data: 'data1' } as Block);
    blockchain.addBlock(block1);
    expect(blockchain.isValid()).toEqual(true);
  });

  it('should add a new valid block to the blockchain', () => {
    const block = new Block({ index: 1, previousHash: lastHashBlock, data: 'data1' } as Block);

    expect(blockchain.addBlock(block)).toEqual({ success: true, message: '' });
    expect(blockchain.getChain()).toHaveLength(2);
    expect(blockchain.getBlock(1)).toEqual(block);
  });

  it('should not add an invalid block to the blockchain', () => {
    const block = new Block({ index: 1, previousHash: lastHashBlock, data: '' } as Block);
    jest.spyOn(block, 'isValid').mockReturnValue(Validation.failure('Invalid mock block.'));

    expect(blockchain.addBlock(block)).toEqual({ success: false, message: 'Invalid mock block.' });
    expect(blockchain.getChain()).toHaveLength(1);
  });

  it('should return null for a non-existent block', () => {
    expect(blockchain.getBlock(1)).toBeNull();
    expect(blockchain.getBlock('abc')).toBeNull();
  });

  it('should return the correct block for a valid index', () => {
    const block = new Block({ index: 1, previousHash: lastHashBlock, data: 'data1' } as Block);
    blockchain.addBlock(block);

    expect(blockchain.getBlock(1)).toEqual(block);
  });

  it('should return the correct block for a valid hash', () => {
    expect(blockchain.getBlock('abcdef1234567890')).toEqual(blockchain.getChain()[0]);
  });

  it('should ensure blocks have increasing timestamps', async () => {
    const block1 = new Block({ index: 1, previousHash: lastHashBlock, data: 'data1' } as Block);
    blockchain.addBlock(block1);

    await new Promise((resolve) => setTimeout(resolve, 5));

    const block2 = new Block({ index: 2, previousHash: block1.hash, data: 'data2' } as Block);
    blockchain.addBlock(block2);

    expect(block2.timestamp).toBeGreaterThan(block1.timestamp);
  });

  it('should return false if a block is invalid', () => {
    const block1 = new Block({ index: 1, previousHash: lastHashBlock, data: 'data1' } as Block);
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
    const info = blockchain.getNextBlock();
    expect(info.index).toEqual(1);

  });
});