export type UpdateAccountPayload = {
  name?: string;
  email?: string;
  currentPassword?: string;
  password?: string;
  skinFile?: File | null;
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
