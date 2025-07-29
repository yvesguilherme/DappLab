import { describe, it, expect, beforeEach, jest, beforeAll } from '@jest/globals';

import Block from '../src/lib/block';
import BlockInfo from '../src/lib/model/block-info.model';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/model/transaction.model';
import TransactionInput from '../src/lib/transaction-input';
import TransactionOutput from '../src/lib/transaction-output';
import Wallet from '../src/lib/wallet';

jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transaction-input');
jest.mock('../src/lib/transaction-output');

describe('Block tests', () => {
  const exampleDifficulty = 1;
  const exampleFee = 1;
  const exampleTx = '032e9ea4b9abb3714a1498790f8880cb29f13542c3670fc639c94e1717a19efcab';
  let genesis: Block;
  let alice: Wallet;
  let bob: Wallet;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  beforeEach(() => {
    genesis = new Block({
      transactions: [new Transaction({
        txInputs: [new TransactionInput()]
      } as Transaction)]
    } as Block);
  });

  function getValidBlock(): Block {
    const txIn = new TransactionInput({
      amount: BigInt(10),
      fromAddress: alice.publicKey,
      previousTx: exampleTx
    } as TransactionInput);
    txIn.sign(alice.privateKey);

    const txOut = new TransactionOutput({
      amount: BigInt(10),
      toAddress: bob.publicKey,
    } as TransactionOutput);

    const tx = new Transaction({
      txInputs: [txIn],
      txOutputs: [txOut]
    } as Transaction);

    const txFee = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput({
        toAddress: alice.publicKey,
        amount: BigInt(1)
      } as TransactionOutput)]
    } as Transaction);

    const block = new Block({
      index: 1,
      miner: alice.publicKey,
      previousHash: genesis.hash,
      transactions: [tx, txFee]
    } as Block);
    block.mine(exampleDifficulty, alice.publicKey);

    return block;
  }

  it('should be valid', () => {
    const block = getValidBlock();
    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeTruthy();
  });

  it('should not be valid (different hash)', () => {
    const block = getValidBlock();
    block.hash = 'invalid_hash';
    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should not be valid (no fee)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [new Transaction({
        txInputs: [new TransactionInput()]
      } as Transaction)]
    } as Block);

    block.mine(exampleDifficulty, alice.publicKey);

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should create from block info', () => {
    const block = Block.fromBlockInfoToBlock({
      transactions: [],
      difficulty: exampleDifficulty,
      feePerTx: 1,
      index: 1,
      maxDifficulty: 62,
      previousHash: genesis.hash
    } as BlockInfo);
    
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput({
        toAddress: alice.publicKey,
        amount: BigInt(1)
      } as TransactionOutput)],
    } as Transaction);
    tx.txInputs = undefined;

    const txRegular = new Transaction({
      type: TransactionType.REGULAR,
      txOutputs: [new TransactionOutput({
        toAddress: alice.publicKey,
        amount: BigInt(1)
      } as TransactionOutput)],
      timestamp: Date.now()
    } as Transaction);

    block.transactions.push(tx);
    block.transactions.push(txRegular);
    block.hash = block.getHash();

    block.mine(exampleDifficulty, alice.publicKey);

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeTruthy();
  });

  it('should not be valid (2 FEE)', () => {
    const block = getValidBlock();
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput()]
    } as Transaction);
    tx.txInputs = undefined;
    block.transactions.push(tx);

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should not be valid (invalid tx)', () => {
    const block = getValidBlock();
    block.transactions[0].timestamp = -1;
    block.hash = block.getHash();
    block.mine(exampleDifficulty, alice.publicKey);

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should not be valid (fallbacks)', () => {
    const block = new Block();

    block.transactions.push(new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput()]
    } as Transaction));

    block.hash = block.getHash();

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should not be valid (invalid previous hash)', () => {
    const block = getValidBlock();
    block.previousHash = 'invalid_hash';

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should not be valid (invalid timestamp)', () => {
    const block = getValidBlock();
    block.timestamp = -1;
    block.mine(exampleDifficulty, alice.publicKey);

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should not be valid (empty hash)', () => {
    const block = getValidBlock();
    block.previousHash = '';

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should not be valid (no mined block)', () => {
    const block = getValidBlock();
    block.nonce = 0;

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should not be valid (invalid index)', () => {
    const block = getValidBlock();
    block.index = -1;

    const valid = block.isValid(genesis.index, genesis.hash, exampleDifficulty, exampleFee);
    expect(valid.success).toBeFalsy();
  });
});