import Crypto from "./crypto.js";
// import Key from './key.js';

// Key.createKey(32);

const text = 'Yves, I\'m here to help you with your code!';
console.log('Original:', text);

const encryptedText = Crypto.encrypt(text);
console.log('Encrypted:', encryptedText);

const decryptedText = Crypto.decrypt(encryptedText);
console.log('Decrypted:', decryptedText);