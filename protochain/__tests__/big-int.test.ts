import { describe, it, expect } from '@jest/globals';

import { serializeBigInt, parseBigInt, convertBigIntFields } from '../src/util/big-int';

describe('serializeBigInt', () => {
  it('serializes bigint fields to string', () => {
    const obj = { a: 1n, b: 'test', c: { d: 2n } };
    const result = serializeBigInt(obj);
    expect(result).toEqual({ a: '1', b: 'test', c: { d: '2' } });
  });

  it('handles arrays with bigints', () => {
    const arr = [1n, 2n, 3];
    const result = serializeBigInt(arr);
    expect(result).toEqual(['1', '2', 3]);
  });

  it('returns primitives unchanged', () => {
    expect(serializeBigInt(5n)).toBe('5');
    expect(serializeBigInt('foo')).toBe('foo');
  });
});

describe('parseBigInt', () => {
  it('returns bigint if input is bigint', () => {
    expect(parseBigInt(10n)).toBe(10n);
  });

  it('parses finite numbers to bigint', () => {
    expect(parseBigInt(42)).toBe(42n);
    expect(parseBigInt(42.9)).toBe(42n);
  });

  it('parses string numbers to bigint', () => {
    expect(parseBigInt('123')).toBe(123n);
    expect(parseBigInt('  456  ')).toBe(456n);
  });

  it('returns 0n for invalid input', () => {
    expect(parseBigInt('abc')).toBe(0n);
    expect(parseBigInt({})).toBe(0n);
    expect(parseBigInt(undefined)).toBe(0n);
    expect(parseBigInt(null)).toBe(0n);
    expect(parseBigInt(NaN)).toBe(0n);
    expect(parseBigInt(Infinity)).toBe(0n);
  });
});

describe('convertBigIntFields', () => {
  it('converts string numbers to bigint', () => {
    expect(convertBigIntFields('123')).toBe(123n);
    expect(convertBigIntFields('abc')).toBe('abc');
  });

  it('recursively converts fields in objects', () => {
    const obj = { a: '1', b: { c: '2', d: 'not a number' } };
    expect(convertBigIntFields(obj)).toEqual({ a: 1n, b: { c: 2n, d: 'not a number' } });
  });

  it('recursively converts fields in arrays', () => {
    const arr = ['1', '2', 'foo', { a: '3' }];
    expect(convertBigIntFields(arr)).toEqual([1n, 2n, 'foo', { a: 3n }]);
  });

  it('returns non-string, non-object values unchanged', () => {
    expect(convertBigIntFields(5)).toBe(5);
    expect(convertBigIntFields(true)).toBe(true);
    expect(convertBigIntFields(null)).toBe(null);
  });
});