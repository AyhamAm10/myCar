import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { HttpError, UnauthorizedError } from '../common/errors/http.error';
import { User } from '../entities/user';
import { JwtService } from './jwt.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';

export class AuthService {
  constructor(
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ 
      where: { phone: registerDto.phone } 
    });

    if (existingUser) {
      throw new HttpError(400, 'Phone number already in use');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    
    console.log(registerDto)
    const user = this.userRepository.create({
      name: registerDto.name,
      phone: registerDto.phone,
      passwordHash: passwordHash
    });

    console.log(user)


    return await this.userRepository.save(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ 
      where: { phone: loginDto.phone } 
    });

    if (!user) {
      throw new UnauthorizedError('Invalid user');
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid Password');
    }

    const tokens = this.jwtService.generateTokens(user);
    
    return {
      user,
      tokens
    };
  }

  async logout(userId: number) {
  
    return true;
  }
}
