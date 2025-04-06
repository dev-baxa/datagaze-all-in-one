import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]): ClassDecorator & MethodDecorator =>
    SetMetadata(ROLES_KEY, roles);
