export type UserSummary = {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
};

export type AuthUser = UserSummary & {
  token?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type ProfileUpdateRequest = {
  name: string;
  email: string;
  password?: string;
};

export type UpdateUserRequest = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};
