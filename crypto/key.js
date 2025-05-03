import { randomBytes } from 'crypto';

class Key {
  static createKey = (length) => {
    if (typeof length !== 'number' || length <= 0) {
      throw new Error('Length must be a positive number');
    }

    const key = randomBytes(length);

    return key.toString('hex');
  }
}

export default Key;