import readline from 'readline';

import axios from 'axios';

import configEnv from "../config/config-env.ts";
import Wallet from "../lib/wallet.ts";
import Transaction from '../lib/transaction.ts';
import TransactionInput from '../lib/transaction-input.ts';
import TransactionOutput from '../lib/transaction-output.ts';

const BLOCKCHAIN_SERVER = configEnv.BLOCKCHAIN_SERVER;
let myWalletPub = '';
let myWalletPriv = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  setTimeout(() => {
    console.clear();

    console.log('Welcome to the Blockchain Wallet Client!');

    if (myWalletPub) {
      console.log(`You're logged as ${myWalletPub}`);
    } else {
      console.log('You are not logged in.');
    }

    console.log('1 - Create a new wallet');
    console.log('2 - Recover wallet');
    console.log('3 - Balance');
    console.log('4 - Send tx');
    console.log('5 - Search tx');
    console.log('6 - Exit');

    rl.question('Choose your option: ', (answer) => {
      switch (answer) {
        case '1':
          createWallet();
          break;
        case '2':
          recoverWallet();
          break;
        case '3':
          getBalance();
          break;
        case '4':
          sendTransaction();
          break;
        case '5':
          searchTransaction();
          break;
        case '6':
          exitProgram();
          break;
        default:
          console.log('Invalid option, please try again.');
          menu();
      }
    });
  }, 1000);
}

function preMenu() {
  rl.question('Press any key to continue...', () => menu());
}

function createWallet() {
  console.clear();

  const wallet = new Wallet();

  console.log('Creating a new wallet...');
  console.log(`Your new wallet:`, wallet);

  myWalletPub = wallet.publicKey;
  myWalletPriv = wallet.privateKey;

  preMenu();
}

function recoverWallet() {
  console.clear();

  rl.question(`What's your private key or WIF? `, (privateKeyOrWif) => {
    const wallet = new Wallet(privateKeyOrWif);

    console.log('Recovering your wallet...');
    console.log(`Your recovered wallet:`, wallet);

    myWalletPub = wallet.publicKey;
    myWalletPriv = wallet.privateKey;
    preMenu();
  });
}

function getBalance() {
  console.clear();

  if (!myWalletPub) {
    console.log(`You need to create or recover a wallet first.`);
    return preMenu();
  }

  // TODO: Get balance from the blockchain server
  preMenu();
}

function sendTransaction() {
  console.clear();

  if (!myWalletPub) {
    console.log(`You need to create or recover a wallet first.`);
    return preMenu();
  }

  console.log(`Your wallet is: ${myWalletPub}`);

  rl.question('Enter the recipient address: ', (recipient) => {
    if (recipient.length < 64) {
      console.log('Invalid recipient address. It should be a 64-character hex string.');
      return preMenu();
    }

    rl.question('Enter the amount to send: ', async (amount) => {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        console.log('Invalid amount. Please enter a positive number.');
        return preMenu();
      }

      const walletResponse = await axios.get(`${BLOCKCHAIN_SERVER}/wallet/${myWalletPub}`);

      const balance = walletResponse.data.balance as number;
      const fee = walletResponse.data.fee as number;
      const utxo = walletResponse.data.utxo as TransactionOutput[];

      if (balance < amountNum + fee) {
        console.log(`Insufficient balance. Your balance is ${balance}, but you need at least ${amountNum + fee}.`);
        return preMenu();
      }

      const tx = new Transaction();
      tx.txOutputs = [new TransactionOutput({
        toAddress: recipient,
        amount: amountNum
      } as TransactionOutput)];
      tx.txInputs = [new TransactionInput({
        amount: amountNum,
        fromAddress: myWalletPub,
        previousTx: utxo[0].tx
      } as TransactionInput)];

      tx.txInputs[0].sign(myWalletPriv);
      tx.hash = tx.getHash();
      tx.txOutputs[0].tx = tx.hash;

      try {
        const txResponse = await axios.post(`${BLOCKCHAIN_SERVER}/transactions`, tx);

        console.log('Transaction sent successfully. Waiting the miners!');
        console.log(txResponse.data.hash);
      } catch (error: any) {
        console.error(error.response ? error.response.data : error.message);
      }

      return preMenu();
    });
  });
  preMenu();
}

function searchTransaction() {
  console.clear();
  rl.question('Enter the transaction hash to search: ', async (txHash) => { 
    const response = await axios.get(`${BLOCKCHAIN_SERVER}/transactions/${txHash}`);

    console.log('Transaction details:');
    console.log(response.data);

    return preMenu();
  });
}

function exitProgram() {
  console.clear();
  console.log('Exiting the wallet client. Goodbye!');
  rl.close();
  process.exit(0);
}

menu();