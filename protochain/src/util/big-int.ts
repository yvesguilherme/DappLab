export function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export function parseBigInt(value: unknown): bigint {
  try {
    if (typeof value === 'bigint') {
      return value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return BigInt(Math.floor(value));
    }

    if (typeof value === 'string') {
      const cleaned = value.trim();
      if (/^\d+$/.test(cleaned)) {
        return BigInt(cleaned);
      }
    }
  } catch { }

  return 0n;
}

export function convertBigIntFields(obj: unknown): any {
  if (typeof obj === 'string' && /^\d+$/.test(obj)) {
    return BigInt(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntFields);
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertBigIntFields(v)])
    );
  }

  return obj;
}