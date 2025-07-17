import express, { NextFunction, Request, Response } from 'express';

import log from '../util/log.ts';
import Blockchain from '../lib/blockchain.ts';
import HttpLog from '../util/http-log.ts';
import Block from '../lib/block.ts';
import configEnv from '../config/config-env.ts';
import Transaction from '../lib/transaction.ts';
import Wallet from '../lib/wallet.ts';
import TransactionOutput from '../lib/transaction-output.ts';

const app = express();
const port = configEnv.BLOCKCHAIN_PORT ?? 3000;

app.use(express.json());

if (process.argv.includes('--run') || process.argv.includes('--r')) {
  app.use(HttpLog.logRequest);
}

const wallet = new Wallet(configEnv.BLOCKCHAIN_WALLET);
const blockchain = new Blockchain(wallet.publicKey);
const apiRouter = express.Router();

apiRouter.get('/status', (req: Request, res: Response) => {
  const status = {
    mempool: blockchain.mempool.length,
    blocks: blockchain.getChain().length,
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
    transactions: data.transactions,
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

apiRouter.get('/transactions/{*hash}', (req: Request, res: Response) => {
  if (req.params.hash) {
    res.json(blockchain.getTransaction(req.params.hash[0]));
  } else {
    res.json({
      next: blockchain.mempool.slice(0, Blockchain.TX_PER_BLOCK),
      total: blockchain.mempool.length,
    });
  }
});

apiRouter.post('/transactions', (req: Request, res: Response): any => {
  if (req.body.hash === undefined) {
    return res
      .status(422)
      .json({ error: 'Unprocessable Entity' });
  }

  const tx = new Transaction(req.body as Transaction);
  const validation = blockchain.addTransaction(tx);

  if (validation.success) {
    res.status(201).json(tx);
  } else {
    res.status(400).json(validation);
  }
});

apiRouter.get('/wallet/:walletAddres', (req: Request, res: Response): any => {
  const wallet = req.params.walletAddres;

  // TODO: create final version of this endpoint
  return res.json({
    balance: 10,
    fee: blockchain.getFeePerTx(),
    utxo: [new TransactionOutput({
      amount: 10,
      toAddress: wallet,
      tx: 'dummy-tx-hash'
    } as TransactionOutput)]
  })
});

function isValidBlockPayload(data: any): boolean {
  return data.previousHash !== undefined &&
    data.index !== undefined &&
    typeof data.index === 'number' &&
    !isNaN(data.index) &&
    Array.isArray(data.transactions) &&
    typeof data.previousHash === 'string' &&
    data.previousHash.length > 0;
}

app.use('/api', apiRouter);

if (process.argv.includes('--run') || process.argv.includes('--r')) {
  app.listen(port, () => log.info(`Blockchain server is running on http://localhost:${port}! Wallet: ${wallet.publicKey}`));
}

export { app };