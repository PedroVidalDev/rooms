import type { FormFieldConfig } from "./types";

export const buildInitialFormValues = <TName extends string>(
  fields: FormFieldConfig<TName>[],
  initialValues?: Partial<Record<TName, string>>,
): Record<TName, string> => {
  const result = {} as Record<TName, string>;

  for (const field of fields) {
    result[field.name] = initialValues?.[field.name] ?? field.defaultValue ?? "";
  }

  return result;
};

export const runFormValidation = <TName extends string>(
  fields: FormFieldConfig<TName>[],
  values: Record<TName, string>,
  validateForm?: (allValues: Record<TName, string>) => string | null,
): string | null => {
  for (const field of fields) {
    if (field.validate) {
      const fieldError = field.validate(values[field.name] ?? "", values);
      if (fieldError) {
        return fieldError;
      }
    }
  }

  if (validateForm) {
    return validateForm(values);
  }

  return null;
};
