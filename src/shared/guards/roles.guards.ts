/* eslint-disable prettier/prettier */

import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { token } = context.switchToHttp().getRequest();
    const role = token.role;

    const requiredRoles = this.reflector.getAllAndOverride<('administrator' | 'user')[]>(ROLES_KEY, [
        context.getHandler(), 
        context.getClass
    ])

    return requiredRoles.includes(role);
  }
}
