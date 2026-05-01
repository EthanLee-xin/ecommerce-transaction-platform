export type UserRole = 'customer' | 'operator' | 'warehouse' | 'finance' | 'admin';

export type UserSummaryDto = {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
};

export type AuthUserDto = UserSummaryDto & {
  token?: string;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export type UpdateProfileInput = {
  name: string;
  email: string;
  password?: string;
};

export type UpdateUserInput = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};
