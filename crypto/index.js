import Crypto from "./crypto.js";

const text = 'Yves, I\'m here to help you with your code!';
console.log('Original:', text);

const encryptedText = Crypto.encrypt(text);
console.log('Encrypted:', encryptedText);

const decryptedText = Crypto.decrypt(encryptedText);
console.log('Decrypted:', decryptedText);