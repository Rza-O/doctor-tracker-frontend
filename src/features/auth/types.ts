// Mirrors the backend's PublicUser and login schema.
export type Role = 'admin' | 'viewer';

export type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
};

export type LoginInput = {
  email: string;
  password: string;
};
