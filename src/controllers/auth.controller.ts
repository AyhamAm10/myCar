import { Request, Response, NextFunction } from "express";
import { User } from "../entities/user";
import { AuthService } from "../services/auth.service";
import { JwtService } from "../services/jwt.service";
import { LoginDto } from "../dtos/login.dto";
import { RegisterDto } from "../dtos/register.dto";
import { ApiResponse } from "../common/responses/api.response";
import { AppDataSource } from "../config/data_source";
import { UnauthorizedError } from "../common/errors/http.error";
import { APIError, HttpStatusCode } from "../common/errors/api.error";
import { ErrorMessages } from "../common/errors/ErrorMessages";
import * as bcrypt from "bcryptjs";

export class AuthController {
  private authService: AuthService;

  constructor() {
    const userRepository = AppDataSource.getRepository(User);
    const jwtService = new JwtService();
    this.authService = new AuthService(userRepository, jwtService);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const registerDto: RegisterDto = req.body;
      const user = await this.authService.register(registerDto);
      const response = ApiResponse.success(
        { user },
        "User registered successfully"
      );
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginDto: LoginDto = req.body;
      const { user, tokens } = await this.authService.login(loginDto);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const response = ApiResponse.success(
        {
          user,
          accessToken: tokens.accessToken,
        },
        "Login successful"
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user?.id) {
        throw new UnauthorizedError("User not authenticated");
      }

      await this.authService.logout(req.user.id);

      res.clearCookie("refreshToken");

      const response = ApiResponse.success(null, "Logout successful");

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const response = ApiResponse.success(
        { user: req.user },
        "Current user retrieved"
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const lang = req.headers["accept-language"] || "ar";
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage(
            "oldPassword || !newPassword ",
            "required",
            lang
          )
        );
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage("user", "not found", lang)
        );
      }

      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage("password", "invalid", lang)
        );
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.passwordHash = hashedNewPassword;
      await userRepo.save(user);

      return res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            {},
            ErrorMessages.generateErrorMessage("password", "updated", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { phone, newPassword } = req.body;
      if (!phone || !newPassword) {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Phone and new password are required" });
      }

      const user = await userRepository.findOne({ where: { phone } });
      if (!user) {
        return res
          .status(HttpStatusCode.NOT_FOUND)
          .json({ message: "User not found" });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.passwordHash = hashedPassword;
      await userRepository.save(user);

      res
        .status(HttpStatusCode.OK)
        .json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  }
}
