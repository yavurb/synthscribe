import { SetMetadata } from '@nestjs/common';
import { Roles } from '../enums';

export const EndpointRoles = (...roles: Roles[]) => SetMetadata('roles', roles);
