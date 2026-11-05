import type { LoginPayload } from "../../types";

export type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export type LoginFormProps = {
  initialEmail?: string;
  isSubmitting?: boolean;
  onSubmit: (payload: LoginPayload) => void;
};

export type LoginValidationResult =
  | { valid: true; payload: LoginPayload }
  | { valid: false; errors: LoginFieldErrors };
