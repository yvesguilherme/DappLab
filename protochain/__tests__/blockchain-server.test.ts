import request from 'supertest';
import { jest, describe, expect, test } from '@jest/globals';

import { app } from '../src/server/blockchain-server.ts';
import Transaction from '../src/lib/transaction.ts';
import TransactionInput from '../src/lib/transaction-input.ts';
import TransactionOutput from '../src/lib/transaction-output.ts';

jest.mock('../src/lib/block');
jest.mock('../src/lib/blockchain');
jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transaction-input');
jest.mock('../src/lib/transaction-output');

describe('blochain-server tests', () => {
  test('GET /api/status - should return status', async () => {
    const response = await request(app)
      .get('/api/status')
      .set('Accept', 'application/json');

    const expectedStatus = {
      isValid: true,
      mempool: 1,
      blocks: 1,
      lastBlock: {
        hash: '00cdef1234567890',
        index: 0,
        previousHash: '',
        miner: expect.any(String),
        nonce: 0,
        timestamp: expect.any(Number),
        transactions: expect.any(Array),
      },
    };

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedStatus);
  });

  test('GET /api/block/:index - should return genesis', async () => {
    const response = await request(app)
      .get('/api/block/0')
      .set('Accept', 'application/json');

    const expectedBlock = {
      hash: 'abcdef1234567890',
      index: 0,
      previousHash: 'abc',
      miner: '',
      nonce: 0,
      timestamp: expect.any(Number),
      transactions: expect.any(Array),
    };

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedBlock);
  });

  test('GET /api/block/next - should get next block info', async () => {
    const response = await request(app)
      .get('/api/block/next')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.index).toEqual(1);
  });

  test('GET /api/block/:hash - should return genesis', async () => {
    const response = await request(app)
      .get('/api/block/abcdef1234567890')
      .set('Accept', 'application/json');

    const expectedBlock = {
      hash: 'abcdef1234567890',
      index: 0,
      previousHash: 'abc',
      miner: '',
      nonce: 0,
      timestamp: expect.any(Number),
      transactions: expect.any(Array),
    };

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedBlock);
  });

  test('GET /api/block/:indexOrHash - should return "Block not found" when the block doesnt exist', async () => {
    const response = await request(app)
      .get('/api/block/-1')
      .set('Accept', 'application/json');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Block not found' });
  });

  test('POST /api/block - should return 201 when the block is added', async () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()] } as Transaction);
    tx.hash = tx.getHash();

    const newBlock = {
      index: 1,
      previousHash: 'abcdef1234567890',
      transactions: [tx]
    };

    const response = await request(app)
      .post('/api/block')
      .send(newBlock);

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({
      ...newBlock,
      hash: expect.any(String),
      nonce: expect.any(Number),
      miner: '',
      timestamp: expect.any(Number),
    });
  });

  test('POST /api/block - should return 422 when previousHash is invalid', async () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()] } as Transaction);
    tx.hash = tx.getHash();

    const newBlock = {
      index: 1,
      previousHash: '',
      transactions: [tx],
    };

    const response = await request(app)
      .post('/api/block')
      .send(newBlock);

    expect(response.status).toEqual(422);
    expect(response.body).toEqual({ error: 'Unprocessable Content' });
  });

  test('POST /api/block - should return 422 when object is empty', async () => {
    const response = await request(app)
      .post('/api/block')
      .send({});

    expect(response.status).toEqual(422);
    expect(response.body).toEqual({ error: 'Unprocessable Content' });
  });

  test('POST /api/block - should return 422 when index is invalid', async () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()] } as Transaction);
    tx.hash = tx.getHash();

    const newBlock = {
      previousHash: 'abcdef1234567890',
      transactions: [tx],
    };

    const response = await request(app)
      .post('/api/block')
      .send(newBlock);

    expect(response.status).toEqual(422);
    expect(response.body).toEqual({ error: 'Unprocessable Content' });
  });

  test('POST /api/block - should return 500 when the block is invalid', async () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()] } as Transaction);
    tx.hash = tx.getHash();

    const newBlock = {
      index: -1,
      previousHash: 'abcdef1234567890',
      transactions: [tx],
    };

    const response = await request(app)
      .post('/api/block')
      .send(newBlock);

    expect(response.status).toEqual(500);
    expect(response.body).toEqual({ success: false, message: 'Invalid mock block.' });
  });

  test('should enable logging middleware when --run is passed', async () => {
    process.argv.push('--run');

    // Clear modules from cache
    jest.resetModules();

    // Create a mock for the middleware
    const mockLogRequest = jest.fn((req, res, next: any) => next());

    jest.mock('../src/util/http-log.ts', () => ({
      __esModule: true, // Important to simulate default export
      default: {
        logRequest: mockLogRequest
      }
    }));

    const { app } = await import('../src/server/blockchain-server.ts');

    await request(app).get('/api/status');

    expect(mockLogRequest).toHaveBeenCalled();

    // Clear the argument to avoid affecting other tests
    process.argv = process.argv.filter(arg => arg !== '--run');
  });

  test('should enable logging middleware when --r is passed', async () => {
    process.argv.push('--run');

    // Clear modules from cache
    jest.resetModules();

    // Create a mock for the middleware
    const mockLogRequest = jest.fn((req, res, next: any) => next());

    jest.mock('../src/util/http-log.ts', () => ({
      __esModule: true, // Important to simulate default export
      default: {
        logRequest: mockLogRequest
      }
    }));

    const { app } = await import('../src/server/blockchain-server.ts');

    await request(app).get('/api/status');

    expect(mockLogRequest).toHaveBeenCalled();

    // Clear the argument to avoid affecting other tests
    process.argv = process.argv.filter(arg => arg !== '--r');
  });

  test('GET /api/transactions/:hash - should return transaction by hash', async () => {
    const response = await request(app)
      .get('/api/transactions/abc')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.mempoolIndex).toEqual(0);
  });

  test('GET /api/transactions - should return transactions', async () => {
    const response = await request(app)
      .get('/api/transactions/')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ next: [], total: 0 });
  });

  test('POST /api/transactions - should add transaction', async () => {
    const tx = new Transaction({ txInputs: [new TransactionInput()], txOutputs: [new TransactionOutput()] } as Transaction);

    const response = await request(app)
      .post('/api/transactions')
      .send(tx);

    expect(response.status).toEqual(201);
  });

  test('POST /api/transactions - should return unprocessable entity', async () => {
    const tx = {};

    const response = await request(app)
      .post('/api/transactions')
      .send(tx);

    expect(response.status).toEqual(422);
    expect(response.body).toEqual({ error: 'Unprocessable Entity' });
  });

  test('POST /api/transactions - should return http 400', async () => {
    const txInputs = [new TransactionInput()];
    txInputs[0].amount = -1;

    const tx = new Transaction({ txInputs, txOutputs: [new TransactionOutput()] } as Transaction);

    const response = await request(app)
      .post('/api/transactions')
      .send(tx);

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({ message: 'Invalid transaction input: Amount must be greater than zero.', success: false });
  });
});