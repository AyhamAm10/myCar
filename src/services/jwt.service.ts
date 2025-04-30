import * as jwt from 'jsonwebtoken';
import { User } from '../entities/user';
import { UnauthorizedError } from '../common/errors/http.error';


export class JwtService {
  private readonly accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
  private readonly refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;

  generateTokens(user: User) {
    const payload = {
      id: user.id,
      phone: user.phone,
      role: user.role
    };

    const accessToken = jwt.sign(
      payload,
      this.accessTokenSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      payload,
      this.refreshTokenSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  verifyToken(token: string, isRefreshToken = false): any {
    try {
      const secret = isRefreshToken 
        ? this.refreshTokenSecret 
        : this.accessTokenSecret;
      
      return jwt.verify(token, secret);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}