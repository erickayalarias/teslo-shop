import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';

export const META_ROLE_PROTECTED = 'roles';
export const RoleProtected = (...args: ValidRoles[]) => {
  return SetMetadata(META_ROLE_PROTECTED, args);
};
