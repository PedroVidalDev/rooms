export type RegisterFieldName = "name" | "email" | "password";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  name: string;
  email: string;
};
