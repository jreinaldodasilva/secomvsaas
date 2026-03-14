import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    pagination?: {
      page: number;
      limit: number;
      skip: number;
    };
    requestId?: string;
  }
}
