import axios from 'axios';

import log from '../util/log.ts';
import BlockInfo from '../lib/model/block-info.model.ts';
import Block from '../lib/block.ts';
import configEnv from '../config/config-env.ts';
import Wallet from '../lib/wallet.ts';
import Transaction from '../lib/transaction.ts';
import TransactionType from '../lib/model/transaction.model.ts';

const BLOCKCHAIN_API_URL = configEnv.BLOCKCHAIN_SERVER ?? 'http://localhost:3000/api';

const minerWallet = new Wallet(process.env.MINER_WALLET);
log.info(`Logged as: ${minerWallet.publicKey}`);

let totalMinedBlocks = 0;

async function mineBlock() {
  log.info('Getting next block info...');

  const { data } = await axios.get(`${BLOCKCHAIN_API_URL}/block/next`);

  if (!data) {
    log.warn('No tx found. Retrying in 5 seconds...');
    return setTimeout(() => mineBlock(), 5000);
  }

  const blockInfo = data as BlockInfo;

  const newBlock = Block.fromBlockInfoToBlock(blockInfo);

  newBlock.transactions.push(
    new Transaction({
      to: minerWallet.publicKey,
      type: TransactionType.FEE
    } as Transaction)
  );

  newBlock.miner = minerWallet.publicKey;
  newBlock.hash = newBlock.getHash();

  log.info(`Mining block #${blockInfo.index}...`);

  newBlock.mine(blockInfo.difficulty, minerWallet.publicKey);

  log.info(`Block mined! Sending block #${newBlock.index} to the blockchain...`);

  try {
    await axios.post(`${BLOCKCHAIN_API_URL}/block`, { ...newBlock });

    log.info(`Block #${newBlock.index} successfully added to the blockchain!`);

    totalMinedBlocks++;

    log.info(`Total mined blocks: ${totalMinedBlocks}`);
  } catch (error: any) {
    log.error(error?.response ? error.response.data : error.message);
  }

  setTimeout(() => mineBlock(), 1000);

  log.info(data)
}

mineBlock();