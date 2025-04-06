import { SetMetadata } from '@nestjs/common';

export const rolesKey = 'roles';

export const Roles = (...roles: string[]): ClassDecorator & MethodDecorator =>
    SetMetadata(rolesKey, roles);
