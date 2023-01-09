/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('administrator' | 'user')[]) => SetMetadata(ROLES_KEY, roles);
