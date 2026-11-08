export type VerificationCodeFormProps = {
  isSubmitting?: boolean;
  onSubmit: (code: string) => void;
};

export type VerificationCodeValidationResult =
  | { valid: true; code: string }
  | { valid: false; error: string };
