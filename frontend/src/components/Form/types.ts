import type { HTMLInputTypeAttribute, ReactNode } from "react";
import type { ButtonVariant } from "../Button/types";

export type FormFieldConfig<TName extends string = string> = {
  name: TName;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  defaultValue?: string;
  min?: number;
  max?: number;
  validate?: (value: string, allValues: Record<TName, string>) => string | null;
};

export type FormProps<TName extends string = string> = {
  idPrefix?: string;
  fields: FormFieldConfig<TName>[];
  initialValues?: Partial<Record<TName, string>>;
  submitLabel: string;
  submittingLabel?: string;
  submitVariant?: ButtonVariant;
  isSubmitting?: boolean;
  validateForm?: (values: Record<TName, string>) => string | null;
  onSubmit: (values: Record<TName, string>) => void;
  onValidationError?: (message: string) => void;
  footer?: ReactNode;
};
