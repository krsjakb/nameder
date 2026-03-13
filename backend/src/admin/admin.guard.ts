import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const adminSecret = request.headers['x-admin-secret'];

    // In a real app, this should be in env variables.
    // For this requested "hardcoded" version:
    const VALID_SECRET = process.env.ADMIN_SECRET || 'admin-secret-token';

    if (adminSecret !== VALID_SECRET) {
      throw new UnauthorizedException('Invalid admin secret');
    }

    return true;
  }
}
