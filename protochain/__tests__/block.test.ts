import { describe, it, expect, beforeEach, jest, afterAll } from '@jest/globals';

import Block from '../src/lib/block';
import BlockInfo from '../src/lib/model/block-info.model';
import Validation from '../src/lib/validation';

describe('Block tests', () => {
  let genesisBlock: Block;
  let block: Block;
  const difficulty = 0;

  beforeEach(() => {
    genesisBlock = new Block({
      index: 0,
      previousHash: '',
      data: 'Genesis Block',
      nonce: 1,
      miner: 'miner'
    } as Block);
    jest.clearAllMocks();
  });

  it('should be valid for the genesis block (index === 0)', () => {
    genesisBlock.mine(0, 'miner');
    expect(genesisBlock).toBeDefined();
    expect(genesisBlock.isValid(-1, '', difficulty)).toEqual(Validation.success());
    expect(genesisBlock.previousHash.length).toEqual(0);
    expect(genesisBlock.data.length).toBeGreaterThan(0);
  });

  it('should be valid', () => {
    block = new Block({
      index: 1,
      previousHash: genesisBlock.hash,
      data: 'block 2'
    } as Block);
    block.mine(0, 'miner');
    expect(block).toBeDefined();
    expect(block.isValid(genesisBlock.index, genesisBlock.hash, difficulty)).toEqual(Validation.success());
  });

  it('should be invalid genesis block (previous hash)', () => {
    block = new Block({
      index: 0,
      previousHash: 'invalid',
      data: 'Genesis Block'
    } as Block);
    expect(block.isValid(-1, '', difficulty)).toEqual(Validation.failure('Invalid previous hash.'));
  });

  it('should be invalid genesis block (data)', () => {
    block = new Block({
      index: 0,
      previousHash: '',
      data: ''
    } as Block);
    expect(block.isValid(-1, '', difficulty)).toEqual(Validation.failure('Invalid data.'));
  });

  it('should be invalid (timestamp)', () => {
    block = new Block({
      index: 1,
      previousHash: genesisBlock.hash,
      data: 'block 2',
      timestamp: - 1
    } as Block);
    expect(block.isValid(genesisBlock.index, genesisBlock.hash, difficulty)).toEqual(Validation.failure('Invalid timestamp.'));
  });

  it('should be invalid (index)', () => {
    block = new Block({
      index: -1,
      previousHash: genesisBlock.hash,
      data: 'block 2'
    } as Block);
    expect(block.isValid(genesisBlock.index, genesisBlock.hash, difficulty)).toEqual(Validation.failure('Invalid previous index.'));
  });

  it('should be invalid (data)', () => {
    block = new Block({
      index: 1,
      previousHash: genesisBlock.hash,
      data: ''
    } as Block);
    expect(block.isValid(genesisBlock.index, genesisBlock.hash, difficulty)).toEqual(Validation.failure('Invalid data.'));
  });

  it('should be invalid (previous index)', () => {
    block = new Block({
      index: -1,
      previousHash: genesisBlock.hash,
      data: 'block 2'
    } as Block);
    expect(block.isValid(genesisBlock.index, genesisBlock.hash, difficulty)).toEqual(Validation.failure('Invalid previous index.'));
  });

  it('should fail validation if the previous hash is invalid', () => {
    const previousBlock = new Block({
      index: 0,
      previousHash: '',
      data: 'Genesis Block'
    } as Block);

    const block = new Block({
      index: 1,
      previousHash: 'invalidPreviousHash',
      data: 'blockData'
    } as Block);

    const validation = block.isValid(previousBlock.index, previousBlock.hash, difficulty);
    expect(validation.message).toBe('Invalid previous hash.');
  });

  it('should return "no mined" if nonce or miner is invalid', () => {
    const previousBlock = new Block({
      index: 0,
      previousHash: '',
      data: 'Genesis Block'
    } as Block);

    const block = new Block({
      index: 1,
      previousHash: previousBlock.hash,
      data: 'blockData',
      nonce: 0,
      miner: ''
    } as Block);

    const validation = block.isValid(previousBlock.index, previousBlock.hash, difficulty);
    expect(validation.message).toBe('No mined.');
  });

  it('should return Invalid hash if the hash is invalid', () => {
    const previousBlock = new Block({
      index: 0,
      previousHash: '',
      data: 'Genesis Block'
    } as Block);

    const block = new Block({
      index: 1,
      previousHash: previousBlock.hash,
      data: 'blockData',
      nonce: 1,
      miner: 'miner'
    } as Block);

    block.hash = 'invalidHash';

    const validation = block.isValid(previousBlock.index, previousBlock.hash, difficulty);
    expect(validation.message).toBe('Invalid hash.');
  });

  it('should create a valid block when the index, previousHash or data is not provided in the constructor', () => {
    const block1 = new Block({
      previousHash: genesisBlock.hash,
      data: 'blockData'
    } as Block);

    const block2 = new Block({
      index: 1,
      data: 'blockData'
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
      data: 'block 2',
      difficulty: 0,
      feePerTx: 1,
      maxDifficulty: 62
    } as BlockInfo);

    block.mine(difficulty, 'miner');

    const valid = block.isValid(genesisBlock.index, genesisBlock.hash, difficulty);
    expect(valid).toEqual(Validation.success());
    expect(valid.success).toBeTruthy();
    expect(block.index).toEqual(1);
    expect(block.previousHash).toEqual(genesisBlock.hash);
    expect(block.data).toEqual('block 2');
  });
});