import type { RegisterPayload } from "../../types";

export type RegisterFieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export type RegisterFormProps = {
  isSubmitting?: boolean;
  onSubmit: (payload: RegisterPayload) => void;
};

export type RegisterValidationResult =
  | { valid: true; payload: RegisterPayload }
  | { valid: false; errors: RegisterFieldErrors };
