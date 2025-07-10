import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle BigInt serialization in JSON responses.
 * It converts BigInt values to strings to ensure compatibility with JSON.
 * This is necessary because JSON does not support BigInt natively.
 */
export function jsonBigIntMiddleware(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json;

  res.json = function (data: any): Response {
    const sanitizedData = JSON.parse(
      JSON.stringify(data, (_, value) => typeof value === 'bigint' ? value.toString() : value)
    );

    return originalJson.call(this, sanitizedData);
  };

  next();

}