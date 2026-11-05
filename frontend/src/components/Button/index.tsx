import {
  BUTTON_BASE_STYLE,
  BUTTON_DISABLED_STYLE,
  BUTTON_VARIANT_STYLES,
} from "./consts";
import type { ButtonProps } from "./types";

export const Button = (props: ButtonProps) => {
  const {
    variant = "primary",
    fullWidth = false,
    disabled = false,
    type = "button",
    children,
    style,
    ...rest
  } = props;

  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        ...BUTTON_BASE_STYLE,
        ...BUTTON_VARIANT_STYLES[variant],
        ...(disabled ? BUTTON_DISABLED_STYLE : {}),
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
};
