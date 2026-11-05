import type { RegisterPayload } from "../../types";

export type RegisterFormProps = {
  isSubmitting?: boolean;
  onSubmit: (payload: RegisterPayload) => void;
  onValidationError?: (message: string) => void;
};

export type RegisterValidationResult =
  | { valid: true; payload: RegisterPayload }
  | { valid: false; error: string };
