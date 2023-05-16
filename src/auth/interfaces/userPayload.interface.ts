import { Roles } from '../enums';

export interface UserPayload {
  userId: string;
  role: Roles;
}
