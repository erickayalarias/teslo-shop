import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLE_PROTECTED } from '../decorator/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>(
      META_ROLE_PROTECTED,
      context.getHandler(),
    );
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    if (!user) throw new BadRequestException('User not found');
    for (const role of user.roles) {
      if (roles.includes(role)) return true;
    }
    throw new ForbiddenException('You do not have permission to access this');
  }
}
