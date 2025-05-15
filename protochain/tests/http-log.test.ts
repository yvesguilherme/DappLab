import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

import HttpLog from '../src/util/http-log.ts';
import log from '../src/util/log.ts';

jest.mock('../src/util/log.ts', () => ({
  info: jest.fn(),
}));

describe('HttpLog', () => {
  describe('logRequest', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        method: 'GET',
        originalUrl: '/test',
      };

      res = {
        statusCode: 200,
        on: jest.fn((event: string, callback: () => void): Response => {
          if (event === 'finish') {
            callback();
          }
          return res as Response;
        }),
      };

      next = jest.fn();
    });

    it('should log the request details on response finish', () => {
      const startTimeSpy = jest.spyOn(process, 'hrtime').mockImplementationOnce(() => [1, 0]);

      HttpLog.logRequest(req as Request, res as Response, next);

      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
      expect(next).toHaveBeenCalled();

      const diffTimeSpy = jest.spyOn(process, 'hrtime').mockImplementationOnce(() => [2, 500000000]);
      const finishCallback = (res.on as jest.Mock).mock.calls[0][1] as () => void;
      finishCallback();

      expect(log.info).toHaveBeenCalledTimes(2);

      startTimeSpy.mockRestore();
      diffTimeSpy.mockRestore();
    });
  });
});