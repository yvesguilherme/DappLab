import aesJS from 'aes-js';
import { getRandomValues } from 'crypto';

class Crypto {
  static #key = null;

  static initializeKey() {
    if (!this.#key) {
      const aesKeyEnv = process.env.AES_KEY; // advanced encryption standard key - simple cipher
      
      if (!aesKeyEnv) {
        throw new Error('AES_KEY environment variable is not set.');
      }

      const keyBytes = aesJS.utils.hex.toBytes(aesKeyEnv);

      if (keyBytes.length !== 32) {
        throw new Error('Invalid AES key. Key must be 256-bit (32 bytes).');
      }

      this.#key = keyBytes;
    }
  }

  static encrypt = (text) => {
    this.initializeKey();

    const iv = getRandomValues(new Uint8Array(16));

    const bytesInfo = aesJS.utils.utf8.toBytes(text);
    const aesCTR = new aesJS.ModeOfOperation.ctr(this.#key, iv);
    const ecryptedBytes = aesCTR.encrypt(bytesInfo);

    const encryptedHex = aesJS.utils.hex.fromBytes(new Uint8Array([...iv, ...ecryptedBytes]));

    return encryptedHex;
  }

  static decrypt = (encryptedHex) => {
    this.initializeKey();

    const encryptedBytes = aesJS.utils.hex.toBytes(encryptedHex);

    const iv = encryptedBytes.slice(0, 16);
    const ciphertext = encryptedBytes.slice(16);

    const aesCTR = new aesJS.ModeOfOperation.ctr(this.#key, iv);
    const decryptedBytes = aesCTR.decrypt(ciphertext);
    const decryptedText = aesJS.utils.utf8.fromBytes(decryptedBytes);

    return decryptedText;
  }
}

export default Crypto;