import type { LoginPayload } from "../../types";

export type LoginFormProps = {
  initialEmail?: string;
  isSubmitting?: boolean;
  onSubmit: (payload: LoginPayload) => void;
  onValidationError?: (message: string) => void;
};

export type LoginValidationResult =
  | { valid: true; payload: LoginPayload }
  | { valid: false; error: string };
