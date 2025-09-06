import { CustomJwtPayload } from './auth/types/payload';

declare module 'express' {
  interface Request {
    payload?: CustomJwtPayload;
  }
}
export {};
