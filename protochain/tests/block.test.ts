import { describe, it, expect, beforeEach, jest, afterAll } from '@jest/globals';

import Block from '../src/lib/model/block.model';
import Validation from '../src/lib/validation';

describe('Block tests', () => {
  let genesisBlock: Block;
  let block: Block;

  beforeEach(() => {
    genesisBlock = new Block(0, '', 'Genesis Block');
    jest.clearAllMocks();
  });

  it('should be valid for the genesis block (index === 0)', () => {
    expect(genesisBlock).toBeDefined();
    expect(genesisBlock.isValid(-1, '')).toEqual(Validation.success());
    expect(genesisBlock.previousHash.length).toEqual(0);
    expect(genesisBlock.data.length).toBeGreaterThan(0);
  });

  it('should be valid', () => {
    block = new Block(1, genesisBlock.hash, 'block 2');
    expect(block).toBeDefined();
    expect(block.isValid(genesisBlock.index, genesisBlock.hash)).toEqual(Validation.success());
  });

  it('should be invalid genesis block (previous hash)', () => {
    block = new Block(0, 'invalid', 'Genesis Block');
    expect(block.isValid(-1, '')).toEqual(Validation.failure('Genesis block must have an empty previous hash.'));
  });

  it('should be invalid genesis block (data)', () => {
    block = new Block(0, '', '');
    expect(block.isValid(-1, '')).toEqual(Validation.failure('Genesis block must contain data.'));
  });

  it('should throw an error when trying to modify a frozen property (timestamp)', () => {
    block = new Block(1, genesisBlock.hash, 'block 2');
    expect(() => {
      // @ts-ignore
      block.timestamp = 1234567890;
    })
      .toThrowError("Cannot assign to read only property 'timestamp' of object '#<Block>'");
  });

  it('should be invalid (timestamp)', () => {
    block = new Block(1, genesisBlock.hash, 'block 2', -1);
    expect(block.isValid(genesisBlock.index, genesisBlock.hash)).toEqual(Validation.failure('Timestamp is invalid.'));
  });

  it('should be invalid (index)', () => {
    block = new Block(-1, genesisBlock.hash, 'block 2');
    expect(block.isValid(genesisBlock.index, genesisBlock.hash)).toEqual(Validation.failure('Block index is invalid.'));
  });

  it('should be invalid (data)', () => {
    block = new Block(1, genesisBlock.hash, '');
    expect(block.isValid(genesisBlock.index, genesisBlock.hash)).toEqual(Validation.failure('Block data is invalid.'));
  });

  it('should be invalid (previous index)', () => {
    block = new Block(2, genesisBlock.hash, 'block 2');
    expect(block.isValid(genesisBlock.index, genesisBlock.hash)).toEqual(Validation.failure('Block index is invalid.'));
  });

  it('should fail validation if the previous hash is invalid', () => {
    const previousBlock = new Block(0, '', 'genesisData');
    const block = new Block(1, 'invalidPreviousHash', 'blockData');
    const validation = block.isValid(previousBlock.index, previousBlock.hash);
    expect(validation.message).toBe('Previous hash is invalid.');
  });

  it('should be invalid (hash)', () => {
    block = new Block(1, '', 'block 2');
    expect(() => {
      // @ts-ignore
      block.hash = 'invalid hash';
    })
      .toThrowError("Cannot assign to read only property 'hash' of object '#<Block>'");
  });
});