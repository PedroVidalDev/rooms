import { VERIFICATION_CODE_LENGTH } from "./consts";
import type { VerificationCodeValidationResult } from "./types";

const DIGIT_REGEX = /^\d$/;
const SIX_DIGITS_REGEX = /^\d{6}$/;

export const createEmptyCodeDigits = (): string[] =>
  Array.from({ length: VERIFICATION_CODE_LENGTH }, () => "");

export const sanitizeSingleDigit = (rawValue: string): string => {
  const digitsOnly = rawValue.replace(/\D/g, "");
  return digitsOnly.slice(-1);
};

export const extractPastedDigits = (rawValue: string): string[] => {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH);
  return digitsOnly.split("").filter((char) => DIGIT_REGEX.test(char));
};

export const validateVerificationCode = (
  digits: string[],
): VerificationCodeValidationResult => {
  const code = digits.join("");

  if (code.length < VERIFICATION_CODE_LENGTH || !SIX_DIGITS_REGEX.test(code)) {
    return {
      valid: false,
      error: "Por favor, preencha todos os 6 dígitos do código de verificação.",
    };
  }

  return {
    valid: true,
    code,
  };
};
