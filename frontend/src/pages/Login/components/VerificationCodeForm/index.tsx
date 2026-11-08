import { useRef, useState } from "react";
import { Button } from "../../../../components/Button";
import {
  TEXT_INPUT_ERROR_TEXT_STYLE,
  TEXT_INPUT_LABEL_STYLE,
} from "../../../../components/TextInput/consts";
import {
  CODE_DIGIT_INPUT_ACTIVE_STYLE,
  CODE_DIGIT_INPUT_BASE_STYLE,
  CODE_DIGIT_INPUT_ERROR_STYLE,
  CODE_DIGIT_INPUT_FILLED_STYLE,
  CODE_INPUTS_ROW_STYLE,
  VERIFICATION_CODE_LENGTH,
} from "./consts";
import {
  createEmptyCodeDigits,
  extractPastedDigits,
  sanitizeSingleDigit,
  validateVerificationCode,
} from "./helpers";
import type { VerificationCodeFormProps } from "./types";

export const VerificationCodeForm = (props: VerificationCodeFormProps) => {
  const { isSubmitting = false, onSubmit } = props;

  const [digits, setDigits] = useState<string[]>(createEmptyCodeDigits);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusInputAt = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(VERIFICATION_CODE_LENGTH - 1, index));
    inputRefs.current[clampedIndex]?.focus();
    inputRefs.current[clampedIndex]?.select();
  };

  const handleDigitChange = (index: number, rawValue: string) => {
    const nextDigit = sanitizeSingleDigit(rawValue);

    setDigits((prev) => {
      const updated = [...prev];
      updated[index] = nextDigit;
      return updated;
    });

    if (fieldError) {
      setFieldError(null);
    }

    if (nextDigit && index < VERIFICATION_CODE_LENGTH - 1) {
      focusInputAt(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigits((prev) => {
          const updated = [...prev];
          updated[index] = "";
          return updated;
        });
        e.preventDefault();
      } else if (index > 0) {
        setDigits((prev) => {
          const updated = [...prev];
          updated[index - 1] = "";
          return updated;
        });
        focusInputAt(index - 1);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      focusInputAt(index - 1);
      e.preventDefault();
      return;
    }

    if (e.key === "ArrowRight" && index < VERIFICATION_CODE_LENGTH - 1) {
      focusInputAt(index + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const pastedDigits = extractPastedDigits(e.clipboardData.getData("text"));
    if (pastedDigits.length === 0) {
      return;
    }

    setDigits((prev) => {
      const updated = [...prev];
      pastedDigits.forEach((digit, offset) => {
        const targetIndex = index + offset;
        if (targetIndex < VERIFICATION_CODE_LENGTH) {
          updated[targetIndex] = digit;
        }
      });
      return updated;
    });

    if (fieldError) {
      setFieldError(null);
    }

    const nextFocusIndex = Math.min(
      index + pastedDigits.length,
      VERIFICATION_CODE_LENGTH - 1,
    );
    focusInputAt(nextFocusIndex);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    const validation = validateVerificationCode(digits);
    if (!validation.valid) {
      setFieldError(validation.error);
      return;
    }

    setFieldError(null);
    onSubmit(validation.code);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="verification-code-0" style={TEXT_INPUT_LABEL_STYLE}>
          Código de 6 dígitos
        </label>

        <div style={CODE_INPUTS_ROW_STYLE}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              id={`verification-code-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              autoFocus={index === 0}
              aria-label={`Dígito ${index + 1} do código de verificação`}
              value={digit}
              disabled={isSubmitting}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              style={{
                ...CODE_DIGIT_INPUT_BASE_STYLE,
                ...(digit ? CODE_DIGIT_INPUT_FILLED_STYLE : {}),
                ...(focusedIndex === index ? CODE_DIGIT_INPUT_ACTIVE_STYLE : {}),
                ...(fieldError ? CODE_DIGIT_INPUT_ERROR_STYLE : {}),
              }}
            />
          ))}
        </div>

        {fieldError && <span style={TEXT_INPUT_ERROR_TEXT_STYLE}>{fieldError}</span>}
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isSubmitting}
        style={{ marginTop: 4, fontSize: 15 }}
      >
        {isSubmitting ? "Verificando..." : "Confirmar Código"}
      </Button>
    </form>
  );
};
