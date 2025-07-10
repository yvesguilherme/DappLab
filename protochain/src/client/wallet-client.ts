import readline from 'readline';

import axios from 'axios';

import configEnv from "../config/config-env.ts";
import Wallet from "../lib/wallet.ts";

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
    console.log('5 - Exit');

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
    preMenu();
    return;
  }

  // TODO: Get balance from the blockchain server
  preMenu();
 }

function sendTransaction() { 
  console.clear();

  if (!myWalletPub) {
    console.log(`You need to create or recover a wallet first.`);
    preMenu();
    return;
  }

  // TODO: Send tx from the blockchain server
  preMenu();
}

function exitProgram() {
  console.clear();
  console.log('Exiting the wallet client. Goodbye!');
  rl.close();
  process.exit(0);
}

menu();