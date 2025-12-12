import { useState, useCallback } from "react";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface FieldConfig {
  initialValue?: any;
  validation?: ValidationRule;
}

export interface FormConfig {
  [key: string]: FieldConfig;
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface FormValues {
  [key: string]: any;
}

export const useForm = <T extends FormValues>(config: FormConfig) => {
  const [values, setValues] = useState<T>(() => {
    const initialValues: any = {};
    Object.keys(config).forEach((key) => {
      initialValues[key] = config[key].initialValue ?? "";
    });
    return initialValues;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: string, value: any): string | null => {
      const fieldConfig = config[name];
      if (!fieldConfig || !fieldConfig.validation) return null;

      const rules = fieldConfig.validation;

      // Required validation
      if (
        rules.required &&
        (!value || (typeof value === "string" && value.trim() === ""))
      ) {
        return `${name} is required`;
      }

      // If value is empty and not required, skip other validations
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return null;
      }

      // Min length validation
      if (
        rules.minLength &&
        typeof value === "string" &&
        value.length < rules.minLength
      ) {
        return `${name} must be at least ${rules.minLength} characters`;
      }

      // Max length validation
      if (
        rules.maxLength &&
        typeof value === "string" &&
        value.length > rules.maxLength
      ) {
        return `${name} must be at most ${rules.maxLength} characters`;
      }

      // Pattern validation
      if (
        rules.pattern &&
        typeof value === "string" &&
        !rules.pattern.test(value)
      ) {
        return `${name} format is invalid`;
      }

      // Min value validation
      if (
        rules.min !== undefined &&
        typeof value === "number" &&
        value < rules.min
      ) {
        return `${name} must be at least ${rules.min}`;
      }

      // Max value validation
      if (
        rules.max !== undefined &&
        typeof value === "number" &&
        value > rules.max
      ) {
        return `${name} must be at most ${rules.max}`;
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(value);
      }

      return null;
    },
    [config]
  );

  const setValue = useCallback(
    (name: string, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate on change if field has been touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const setFieldTouched = useCallback(
    (name: string, isTouched: boolean = true) => {
      setTouched((prev) => ({ ...prev, [name]: isTouched }));

      if (isTouched) {
        const error = validateField(name, values[name]);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [values, validateField]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(config).forEach((name) => {
      const error = validateField(name, values[name]);
      newErrors[name] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  }, [config, values, validateField]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => {
      return async (e?: any) => {
        if (e?.preventDefault) {
          e.preventDefault();
        }

        setIsSubmitting(true);

        // Mark all fields as touched
        const allTouched: { [key: string]: boolean } = {};
        Object.keys(config).forEach((key) => {
          allTouched[key] = true;
        });
        setTouched(allTouched);

        const isValid = validateAll();

        if (isValid) {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error("Form submission error:", error);
          }
        }

        setIsSubmitting(false);
      };
    },
    [config, values, validateAll]
  );

  const reset = useCallback(() => {
    const initialValues: any = {};
    Object.keys(config).forEach((key) => {
      initialValues[key] = config[key].initialValue ?? "";
    });
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [config]);

  const setFieldError = useCallback((name: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const getFieldProps = useCallback(
    (name: string) => ({
      value: values[name],
      onChangeText: (text: string) => setValue(name, text),
      onBlur: () => setFieldTouched(name, true),
      error: touched[name] && !!errors[name],
      helperText: touched[name] ? errors[name] : undefined,
    }),
    [values, errors, touched, setValue, setFieldTouched]
  );

  const isValid = useCallback(() => {
    return Object.values(errors).every((error) => !error);
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    setFieldError,
    handleSubmit,
    reset,
    validateAll,
    getFieldProps,
    isValid,
  };
};
