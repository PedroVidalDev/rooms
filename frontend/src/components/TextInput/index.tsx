import {
  TEXT_INPUT_BASE_STYLE,
  TEXT_INPUT_ERROR_BORDER_STYLE,
  TEXT_INPUT_ERROR_TEXT_STYLE,
  TEXT_INPUT_LABEL_STYLE,
} from "./consts";
import type { TextInputProps } from "./types";

export const TextInput = (props: TextInputProps) => {
  const { id, label, error, ...rest } = props;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label htmlFor={id} style={TEXT_INPUT_LABEL_STYLE}>
          {label}
        </label>
      )}

      <input
        id={id}
        style={{
          ...TEXT_INPUT_BASE_STYLE,
          ...(error ? TEXT_INPUT_ERROR_BORDER_STYLE : {}),
        }}
        {...rest}
      />

      {error && <span style={TEXT_INPUT_ERROR_TEXT_STYLE}>{error}</span>}
    </div>
  );
};
