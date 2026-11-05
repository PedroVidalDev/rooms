import { useState } from "react";
import { Button } from "../Button";
import { FormField } from "./components/FormField";
import { buildInitialFormValues, runFormValidation } from "./helpers";
import type { FormProps } from "./types";

export const Form = <TName extends string = string>(props: FormProps<TName>) => {
  const {
    idPrefix = "form",
    fields,
    initialValues,
    submitLabel,
    submittingLabel,
    submitVariant = "primary",
    isSubmitting = false,
    validateForm,
    onSubmit,
    onValidationError,
    footer,
  } = props;

  const [values, setValues] = useState<Record<TName, string>>(() =>
    buildInitialFormValues(fields, initialValues),
  );

  const handleFieldChange = (name: TName, nextValue: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    const validationError = runFormValidation(fields, values, validateForm);
    if (validationError) {
      onValidationError?.(validationError);
      return;
    }

    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {fields.map((field) => (
        <FormField
          key={field.name}
          id={`${idPrefix}-${field.name}`}
          label={field.label}
          type={field.type}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          autoFocus={field.autoFocus}
          min={field.min}
          max={field.max}
          value={values[field.name] ?? ""}
          disabled={isSubmitting}
          onChange={(nextValue) => handleFieldChange(field.name, nextValue)}
        />
      ))}

      <Button
        type="submit"
        variant={submitVariant}
        fullWidth
        disabled={isSubmitting}
        style={{ marginTop: 4, fontSize: 15 }}
      >
        {isSubmitting ? submittingLabel ?? submitLabel : submitLabel}
      </Button>

      {footer}
    </form>
  );
};
