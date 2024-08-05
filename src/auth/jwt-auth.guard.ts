import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authservice: AuthService
  ) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    console.log('Run auth');
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
      const err = 'Authorization header missing';
      throw new UnauthorizedException(err);
    }
    const token = authHeader.split(' ')[1];
    try {
      console.log(token);
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      if (
        await this.authservice.isTokenBlacklisted(request.user.username, token)
      ) {
        const err = 'user already logged out';
        throw new UnauthorizedException(err);
      }
    } catch (error) {
      console.log(error);
      const err = 'Invalid token';
      throw new UnauthorizedException(err);
    }
    return true;
  }
}
