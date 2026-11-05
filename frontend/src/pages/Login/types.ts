export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = { token: string };

export type LoginLocationState = {
  error?: string;
  successMessage?: string;
  registeredEmail?: string;
};
