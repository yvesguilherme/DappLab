import request from 'supertest';
import { jest, describe, expect, test } from '@jest/globals';

import { app } from '../src/server/blockchain-server';

jest.mock('../src/lib/block');
jest.mock('../src/lib/blockchain');

describe('blochain-server tests', () => {
  test('GET /api/status - should return status', async () => {
    const response = await request(app)
      .get('/api/status')
      .set('Accept', 'application/json');

    const expectedStatus = {
      isValid: true,
      numberOfBlocks: 1,
      lastBlock: {
        data: 'Genesis Block',
        hash: 'abcdef1234567890',
        index: 0,
        previousHash: 'abc',
        miner: '',
        nonce: 0,
        timestamp: expect.any(Number),
      },
    };

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedStatus);
  });

  test('GET /api/:index - should return genesis', async () => {
    const response = await request(app)
      .get('/api/block/0')
      .set('Accept', 'application/json');

    const expectedBlock = {
      data: 'Genesis Block',
      hash: 'abcdef1234567890',
      index: 0,
      previousHash: 'abc',
      miner: '',
      nonce: 0,
      timestamp: expect.any(Number)
    };

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedBlock);
  });

  test('GET /api/next - should get next block info', async () => {
    const response = await request(app)
      .get('/api/block/next')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.index).toEqual(1);
  });

  test('GET /api/:hash - should return genesis', async () => {
    const response = await request(app)
      .get('/api/block/abcdef1234567890')
      .set('Accept', 'application/json');

    const expectedBlock = {
      data: 'Genesis Block',
      hash: 'abcdef1234567890',
      index: 0,
      previousHash: 'abc',
      miner: '',
      nonce: 0,
      timestamp: expect.any(Number)
    };

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedBlock);
  });

  test('GET /api/:indexOrHash - should return "Block not found" when the block doesnt exist', async () => {
    const response = await request(app)
      .get('/api/block/-1')
      .set('Accept', 'application/json');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Block not found' });
  });

  test('POST /api/block - should return 201 when the block is added', async () => {
    const newBlock = {
      index: 1,
      previousHash: 'abcdef1234567890',
      data: 'New Block',
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
    const newBlock = {
      index: 1,
      previousHash: '',
      data: 'New Block',
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
    const newBlock = {
      previousHash: 'abcdef1234567890',
      data: 'New Block',
    };

    const response = await request(app)
      .post('/api/block')
      .send(newBlock);

    expect(response.status).toEqual(422);
    expect(response.body).toEqual({ error: 'Unprocessable Content' });
  });

  test('POST /api/block - should return 500 when the block is invalid', async () => {
    const newBlock = {
      index: -1,
      previousHash: 'abcdef1234567890',
      data: 'New Block',
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
});