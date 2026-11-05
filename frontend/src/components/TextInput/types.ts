import type { InputHTMLAttributes } from "react";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style"> & {
  label?: string;
  error?: string | null;
};
