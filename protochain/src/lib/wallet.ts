import * as ecc from 'tiny-secp256k1';
import ECPairFactory, { ECPairInterface } from 'ecpair';

const ECPair = ECPairFactory(ecc);

/**
 * Wallet class for managing cryptocurrency wallets.
 */
class Wallet {
  privateKey: string; // To sign
  publicKey: string;  // To verify

  constructor(wifOrPrivateKey?: string) {
    let keys;

    if (wifOrPrivateKey) {
      try {
        if (wifOrPrivateKey.length === 64) {
          // If a private key is provided
          keys = ECPair.fromPrivateKey(Buffer.from(wifOrPrivateKey, 'hex'));
        } else {
          // If a WIF (Wallet Import Format) is provided
          keys = ECPair.fromWIF(wifOrPrivateKey);
        }
      } catch (error) {
        const message = (error instanceof Error) ? error.message : error;
        throw new Error(`Invalid WIF or private key: ${message}`);
      }
    } else {
      keys = ECPair.makeRandom();
    }

    this.privateKey = keys.privateKey ? Buffer.from(keys.privateKey).toString('hex') : '';
    this.publicKey = Buffer.from(keys.publicKey).toString('hex');
  }
}

export default Wallet;