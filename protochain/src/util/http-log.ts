import { Request, Response, NextFunction } from 'express';

import log from './log.ts';

class HttpLog {
  static logRequest(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime();

    res.on('finish', () => {
      const diff = process.hrtime(start);
      const time = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3);

      log.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${time} ms`);
    });

    next();
  }
}

export default HttpLog;