import { UserModel } from '../models/user.model';
export interface JwtPayload {
  username: string;
  sub: string;
  role: string;
}
export function createJwtPayload(user: UserModel): JwtPayload {
  return {
    username: user.username,
    sub: user.UserId,
    role: user.role,
  };
}
