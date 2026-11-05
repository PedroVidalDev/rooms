import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
  style?: CSSProperties;
};
