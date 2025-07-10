import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';

import { jsonBigIntMiddleware } from '../src/middleware/json-bigint-middleware.ts';

describe('json-bigint-middleware', () => {
  const app = express();

  app.use(jsonBigIntMiddleware);

  app.get('/test', (req, res) => {
    res.json({
      value: BigInt(9007199254740991),
    });
  });

  it('should serialize BigInt as string in JSON response', async () => {
    const response = await request(app).get('/test');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      value: '9007199254740991',
    });
    expect(typeof response.body.value).toBe('string');
  });
});