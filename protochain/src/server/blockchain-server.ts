import express, { Request, Response } from 'express';

import log from '../util/log.ts';
import Blockchain from '../lib/blockchain.ts';
import HttpLog from '../util/http-log.ts';
import Block from '../lib/model/block.model.ts';
import configEnv from '../config/config-env.ts';

const app = express();
const port = configEnv.BLOCKCHAIN_PORT ?? 3000;

app.use(express.json());

if (process.argv.includes('--run') || process.argv.includes('--r')) {
  app.use(HttpLog.logRequest);
}

const blockchain = new Blockchain();
const apiRouter = express.Router();

apiRouter.get('/status', (req: Request, res: Response) => {
  const status = {
    numberOfBlocks: blockchain.getChain().length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  };

  res.json(status);
});

apiRouter.get('/block/next', (req: Request, res: Response) => {
  res.json(blockchain.getNextBlock());
});

apiRouter.get('/block/:indexOrHash', (req: Request, res: Response): any => {
  const { indexOrHash } = req.params;
  const block: Block | null = /^\d+$/.test(indexOrHash)
    ? blockchain.getBlock(parseInt(indexOrHash, 10))
    : blockchain.getBlock(indexOrHash);

  if (block) {
    return res.json(block);
  }

  return res
    .status(404)
    .json({ error: 'Block not found' });
});

apiRouter.post('/block', (req: Request, res: Response): any => {
  const data = req.body;

  if (!isValidBlockPayload(data)) {
    return res
      .status(422)
      .json({ error: 'Unprocessable Content' });
  }

  const block = new Block({
    index: data.index,
    previousHash: data.previousHash,
    data: data.data,
    timestamp: data.timestamp,
    miner: data.miner,
    nonce: data.nonce,
    hash: data.hash
  } as Block);
  const blockchainIsValid = blockchain.addBlock(block);

  if (!blockchainIsValid.success) {
    return res
      .status(500)
      .json(blockchainIsValid);
  }

  return res.status(201).json(block);
});

function isValidBlockPayload(data: any): boolean {
  return data.previousHash !== undefined &&
    data.index !== undefined &&
    typeof data.index === 'number' &&
    !isNaN(data.index) &&
    data.data !== undefined &&
    typeof data.previousHash === 'string' &&
    data.previousHash.length > 0;
}

app.use('/api', apiRouter);

if (process.argv.includes('--run') || process.argv.includes('--r')) {
  app.listen(port, () => log.info(`Blockchain server is running on http://localhost:${port}`));
}

export { app };