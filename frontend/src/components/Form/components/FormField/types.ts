import type { HTMLInputTypeAttribute } from "react";

export type FormFieldProps = {
  id: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  value: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  onChange: (value: string) => void;
};
