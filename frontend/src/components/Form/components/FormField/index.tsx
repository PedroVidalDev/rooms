import type { FormFieldProps } from "./types";

export const FormField = (props: FormFieldProps) => {
  const {
    id,
    label,
    type = "text",
    placeholder,
    autoComplete,
    autoFocus = false,
    value,
    disabled = false,
    min,
    max,
    onChange,
  } = props;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#e7edf5",
          opacity: 0.75,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          borderRadius: 10,
          border: "1px solid #44505c",
          background: "#1d232b",
          color: "#e7edf5",
          padding: "11px 12px",
          fontSize: 14,
          fontFamily: "system-ui, sans-serif",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};
