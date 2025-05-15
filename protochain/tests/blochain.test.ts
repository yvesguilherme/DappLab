import { beforeEach, describe, it, expect, jest } from '@jest/globals';

import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/model/block.model';

let blockchain: Blockchain;
let lastHashBlock: string;

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
    expect(blockchain.getBlock(0)?.index).toBe(0);
    expect(blockchain.getBlock(0)?.data).toBe('Genesis Block');
    expect(blockchain.getBlock(0)?.previousHash).toBe('');
    expect(blockchain.getBlock(0)?.hash).toHaveLength(64);
    expect(blockchain.getBlock(0)?.timestamp).toBeDefined();
  });

  it('should be valid', () => {
    const block1 = new Block(1, lastHashBlock, 'data1');
    blockchain.addBlock(block1);
    expect(blockchain.isValid()).toEqual(true);
  });

  it('should add a new valid block to the blockchain', () => {
    const block = new Block(1, lastHashBlock, 'data1');

    expect(blockchain.addBlock(block)).toEqual(true);
    expect(blockchain.getChain()).toHaveLength(2);
    expect(blockchain.getBlock(1)).toEqual(block);
    expect(blockchain.getBlock(1)?.index).toEqual(1);
    expect(blockchain.getBlock(1)?.data).toEqual('data1');
    expect(blockchain.getBlock(1)?.previousHash).toEqual(lastHashBlock);
    expect(blockchain.getBlock(1)?.hash).toHaveLength(64);
    expect(blockchain.getBlock(1)?.timestamp).toBeDefined();
  });

  it('should not add an invalid block to the blockchain', () => {
    const block = new Block(12, 'invalid', 'data12');

    expect(blockchain.addBlock(block)).toEqual(false);
    expect(blockchain.getChain()).toHaveLength(1);
  });

  it('should return null for a non-existent block', () => {
    expect(blockchain.getBlock(1)).toBeNull();
    expect(blockchain.getBlock('abc')).toBeNull();
  });

  it('should return the correct block for a valid index', () => {
    const block = new Block(1, lastHashBlock, 'data1');
    blockchain.addBlock(block);

    expect(blockchain.getBlock(1)).toEqual(block);
  });

  it('should return the correct block for a valid hash', () => {
    const block = new Block(1, lastHashBlock, 'data1');
    blockchain.addBlock(block);

    expect(blockchain.getBlock(block.hash)).toEqual(block);
  });

  it('should return false if a block has an invalid previous hash', () => {
    const block = new Block(1, lastHashBlock, 'data1');
    blockchain.addBlock(block);

    expect(() => {
      // @ts-ignore
      blockchain.getChain()[1].previousHash = 'invalid';
    })
      .toThrowError("Cannot assign to read only property 'previousHash' of object '#<Block>'");
  });

  it('should return false if a block has an invalid index', () => {
    const block1 = new Block(1, lastHashBlock, 'Block 1 Data');

    blockchain.addBlock(block1);

    expect(() => {
      // @ts-ignore
      blockchain.getChain()[1].index = 3;
    })
      .toThrowError("Cannot assign to read only property 'index' of object '#<Block>'");
  });

  it('should return false if the blockchain is tampered with', () => {
    const block1 = new Block(1, lastHashBlock, 'Block 1 Data');
    blockchain.addBlock(block1);

    expect(() => {
      // @ts-ignore
      blockchain.getChain()[1].hash = 'invalidHash';
    })
      .toThrowError("Cannot assign to read only property 'hash' of object '#<Block>'");
  });
  
  it('should ensure blocks have increasing timestamps', async () => {
    const block1 = new Block(1, lastHashBlock, 'data1');
    blockchain.addBlock(block1);

    await new Promise((resolve) => setTimeout(resolve, 5));

    const block2 = new Block(2, block1.hash, 'data2');
    blockchain.addBlock(block2);

    expect(block2.timestamp).toBeGreaterThan(block1.timestamp);
  });

  it('should return false if a block is invalid', () => {
    const block1 = new Block(1, lastHashBlock, 'data1');
    blockchain.addBlock(block1);

    const mockBlock = {
      ...block1,
      isValid: jest.fn().mockReturnValue(false)
    };

    // @ts-ignore
    blockchain.getChain()[1] = mockBlock;

    expect(blockchain.isValid()).toEqual(false);
  });
});