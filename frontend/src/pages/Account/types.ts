export type UpdateAccountPayload = {
  name?: string;
  email?: string;
  currentPassword?: string;
  password?: string;
};

export type UpdateAccountResponse = {
  name: string;
  email: string;
};

export type AccountFieldErrors = {
  name?: string;
  email?: string;
  currentPassword?: string;
  password?: string;
  skinFile?: string;
};
