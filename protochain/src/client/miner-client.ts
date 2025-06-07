import axios from 'axios';

import log from '../util/log.ts';
import BlockInfo from '../lib/model/block-info.model.ts';
import Block from '../lib/model/block.model.ts';
import configEnv from '../config/config-env.ts';

const BLOCKCHAIN_API_URL = configEnv.BLOCKCHAIN_SERVER ?? 'http://localhost:3000/api';
const minerWallet = {
  privatekey: 'yvesPK',
  publickey: configEnv.MINER_WALLET ?? 'yvesPB',
};
let totalMinedBlocks = 0;

async function mineBlock() {
  log.info('Getting next block info...');

  const { data } = await axios.get(`${BLOCKCHAIN_API_URL}/block/next`);
  const blockInfo = data as BlockInfo;

  const newBlock = Block.fromBlockInfoToBlock(blockInfo);

  //TODO: adicionar tx de recompensa

  log.info(`Mining block #${blockInfo.index}...`);

  newBlock.mine(blockInfo.difficulty, minerWallet.publickey);

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