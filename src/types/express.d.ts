import { Request } from 'express';
import { User } from '../entities/user';

declare global {
  namespace Express {
    interface Request {
      id?: string;  
      user?: User
    }
  }
}

