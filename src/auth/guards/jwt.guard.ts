import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';

import { UserPayload } from '../interfaces';
import { Roles } from '../enums';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<Roles[]>('roles', context.getHandler());
    if (!roles) return true;

    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<UserPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      request['user'] = payload;

      const includeRole = roles.includes(payload.role);
      if (!includeRole) throw new UnauthorizedException();
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
