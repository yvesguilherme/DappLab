import express from 'express';

import log from '../util/log.ts';
import Blockchain from '../lib/blockchain.ts';
import HttpLog from '../util/http-log.ts';
import Block from '../lib/model/block.model.ts';

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use(HttpLog.logRequest);

const blockchain = new Blockchain();
const apiRouter = express.Router();

apiRouter.get('/status', (req: express.Request, res: express.Response) => {
  const status = {
    numberOfBlocks: blockchain.getChain().length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  };

  res.json(status);
});

apiRouter.get('/block/:indexOrHash', (req: express.Request, res: express.Response): any => {
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

apiRouter.post('/block', (req: express.Request, res: express.Response): any => {
  const data: Block = req.body;

  if (!data.previousHash) {
    return res
      .status(422)
      .json({ error: 'Unprocessable Content' });
  }

  const block = new Block(data.index, data.previousHash, data.data);
  const blockchainIsValid = blockchain.addBlock(block);

  if (!blockchainIsValid.success) {
    return res
      .status(500)
      .json(blockchainIsValid);
  }

  return res.status(201).json(block);
});

app.use('/api', apiRouter);

app.listen(port, () => log.info(`Blockchain server is running on http://localhost:${port}`));