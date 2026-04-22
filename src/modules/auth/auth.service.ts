import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { UserDocument } from '../users/schemas/user.schema.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates a user's credentials against the database.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    // user as any is used here because comparePassword is an instance method 
    // defined on the schema, but TypeScript's strict typing doesn't always 
    // infer mongoose instance methods automatically without complex typings.
    if (user && (await (user as any).comparePassword(pass))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  /**
   * Generates a JWT token for the authenticated user.
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Registers a new user and automatically logs them in.
   */
  async register(userData: RegisterDto) {
    const user = await this.usersService.create(userData);
    return this.login(user);
  }
}
