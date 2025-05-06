// import { Request, Response, NextFunction } from 'express';
// import { UnauthorizedError } from '../common/errors/http.error';
// import { JwtService } from '../services/jwt.service';
// import { User } from '../entities/user';
// import { AppDataSource } from '../config/data_source';

// export const authMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       throw new UnauthorizedError('Authentication required');
//     }

//     const token = authHeader.split(' ')[1];
//     const jwtService = new JwtService();
//     const decoded = jwtService.verifyToken(token);

//     const userRepository = AppDataSource.getRepository(User);
//     const user = await userRepository.findOne({where:{id: decoded.id}});

//     if (!user) {
//       throw new UnauthorizedError('User not found');
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data_source";
import { User } from "../entities/user";
import { APIError, HttpStatusCode } from "../common/errors/api.error";
import { ErrorMessages } from "../common/errors/ErrorMessages";


interface AuthenticatedRequest extends Request {
  currentUser?: User;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المصادقة", "unauthorized", lang)));
    }

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المصادقة", "unauthorized", lang)));
    }

    jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string,
      async (err, decoded: any) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            const refreshToken = req.cookies?.jwt;
            if (!refreshToken) {
              return next(new APIError(HttpStatusCode.FORBIDDEN, ErrorMessages.generateErrorMessage("المصادقة", "forbidden", lang)));
            }

            try {
              const refreshDecoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET as string
              ) as { userId: number };

              const newAccessToken = jwt.sign(
                { userId: refreshDecoded.userId },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: "1h" }
              );

              res.setHeader("Authorization", `Bearer ${newAccessToken}`);
              req.headers.authorization = `Bearer ${newAccessToken}`;
              decoded = { userId: refreshDecoded.userId };
            } catch {
              return next(new APIError(HttpStatusCode.FORBIDDEN, ErrorMessages.generateErrorMessage("المصادقة", "forbidden", lang)));
            }
          } else {
            return next(new APIError(HttpStatusCode.FORBIDDEN, ErrorMessages.generateErrorMessage("المصادقة", "forbidden", lang)));
          }
        }

        const userId = decoded?.id;
        console.log(userId)
        if (!userId) {
          return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المصادقة", "unauthorized", lang)));
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
          return next(new APIError(HttpStatusCode.NOT_FOUND, ErrorMessages.generateErrorMessage("المستخدم", "not found", lang)));
        }

        req.user = user;
        return next();
      }
    );
  } catch (error) {
    next(error);
  }
};
