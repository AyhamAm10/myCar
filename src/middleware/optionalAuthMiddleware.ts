import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data_source";
import { User } from "../entities/user";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];
      if (accessToken) {
        jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET as string,
          async (err, decoded: any) => {
            if (!err && decoded?.id) {
              const userRepository = AppDataSource.getRepository(User);
              const user = await userRepository.findOne({
                where: { id: decoded.id },
              });

              if (user) {
                req.user = user;
              }
            }
            next();
          }
        );
        return;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
