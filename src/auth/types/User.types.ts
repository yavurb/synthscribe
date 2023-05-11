import { UserDocument } from '../schemas/User.schema';

export type UserFilters = Pick<
  {
    [Property in keyof UserDocument]?: string;
  },
  'username' | 'email' | '_id'
>;
