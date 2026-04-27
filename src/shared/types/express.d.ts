import type { IUserDocument } from '@modules/user';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export {};