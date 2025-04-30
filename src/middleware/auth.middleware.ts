import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../common/errors/http.error';
import { JwtService } from '../services/jwt.service';
import { User } from '../entities/user';
import { AppDataSource } from '../config/data_source';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const jwtService = new JwtService();
    const decoded = jwtService.verifyToken(token);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne(decoded?.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};