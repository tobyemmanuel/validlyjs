import {
  Validator,
  ValidationResult,
  RuleDefinition,
  ValidatorOptions,
} from '../../index';

export interface FormBindingOptions {
  validateOnBlur?: boolean;
  validateOnInput?: boolean;
  validateOnSubmit?: boolean;
  showErrors?: boolean;
  errorClass?: string;
  validClass?: string;
  errorTemplate?: (message: string) => string;
  onSuccess?: (data: Record<string, any>, result: ValidationResult) => void;
  onError?: (errors: any, result: ValidationResult) => void;
}

export interface FormBinding {
  rules: Record<string, RuleDefinition>;
  options: FormBindingOptions;
  errors: Map<string, string[]>;
  validator: Validator;
  eventListeners: Map<HTMLElement, { event: string; handler: EventListener }[]>;
}

export class DOMBinder {
  private boundForms: Map<HTMLFormElement, FormBinding> = new Map();

  // Bind validation to a form
  bindForm(
    form: HTMLFormElement,
    rules: Record<string, RuleDefinition>,
    options: FormBindingOptions = {}
  ): FormBinding {
    const defaultOptions: FormBindingOptions = {
      validateOnBlur: true,
      validateOnInput: false,
      validateOnSubmit: true,
      showErrors: true,
      errorClass: 'error',
      validClass: 'valid',
      errorTemplate: (message: string) =>
        `<span class="error-message">${message}</span>`,
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const validator = new Validator(rules);

    const binding: FormBinding = {
      rules,
      options: mergedOptions,
      errors: new Map(),
      validator,
      eventListeners: new Map(),
    };

    this.boundForms.set(form, binding);

    // Add event listeners
    if (mergedOptions.validateOnBlur) {
      this.addBlurListeners(form, binding);
    }

    if (mergedOptions.validateOnInput) {
      this.addInputListeners(form, binding);
    }

    if (mergedOptions.validateOnSubmit) {
      this.addSubmitListener(form, binding);
    }

    return binding;
  }

  // Unbind form
  unbindForm(form: HTMLFormElement): void {
    const binding = this.boundForms.get(form);
    if (binding) {
      this.removeEventListeners(form, binding);
      this.boundForms.delete(form);
    }
  }

  // Validate a single field
  async validateField(
    fieldName: string,
    value: any,
    rules: RuleDefinition,
    options?: ValidatorOptions
  ): Promise<string[]> {
    const validator = new Validator({ [fieldName]: rules }, options);
    const result = await validator.validate({ [fieldName]: value });

    // Handle Laravel format (object) - extract field errors directly
    const fieldErrors = (result.errors as any)[fieldName];
    return Array.isArray(fieldErrors) ? fieldErrors : [];
  }

  // Display field error
  displayFieldError(
    field: HTMLElement,
    errors: string[],
    binding: FormBinding
  ): void {
    if (!binding.options.showErrors) return;

    // Remove existing error displays
    this.clearFieldError(field);

    if (errors.length > 0) {
      field.classList.add(binding.options.errorClass || 'error');
      field.classList.remove(binding.options.validClass || 'valid');

      if (binding.options.errorTemplate) {
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.innerHTML = binding.options.errorTemplate(
          errors[0] as string
        );

        // Insert after the field
        field.parentNode?.insertBefore(errorElement, field.nextSibling);
      }
    } else {
      field.classList.remove(binding.options.errorClass || 'error');
      field.classList.add(binding.options.validClass || 'valid');
    }
  }

  // Get form data as object
  getFormData(form: HTMLFormElement): Record<string, any> {
    const data: Record<string, any> = {};

    // Use form elements directly instead of FormData for better compatibility
    const formElements = form.querySelectorAll(
      'input, select, textarea'
    ) as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

    formElements.forEach((element) => {
      const name = element.name;
      if (name) {
        if (element.type === 'checkbox') {
          const checkbox = element as HTMLInputElement;
          if (checkbox.checked) {
            if (data[name]) {
              if (Array.isArray(data[name])) {
                data[name].push(checkbox.value);
              } else {
                data[name] = [data[name], checkbox.value];
              }
            } else {
              data[name] = checkbox.value;
            }
          }
        } else if (element.type === 'radio') {
          const radio = element as HTMLInputElement;
          if (radio.checked) {
            data[name] = radio.value;
          }
        } else if (element.type === 'file') {
          const fileInput = element as HTMLInputElement;
          if (fileInput.files && fileInput.files.length > 0) {
            data[name] = fileInput.multiple
              ? Array.from(fileInput.files)
              : fileInput.files[0];
          }
        } else {
          data[name] = element.value;
        }
      }
    });

    return data;
  }

  // Clear field error
  clearFieldError(field: HTMLElement): void {
    const errorElement = field.parentNode?.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  private addBlurListeners(form: HTMLFormElement, binding: FormBinding): void {
    const fields = form.querySelectorAll('input, select, textarea');

    fields.forEach((field) => {
      const handler = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const fieldName = target.name;

        if (fieldName && binding.rules[fieldName]) {
          const errors = await this.validateField(
            fieldName,
            target.value,
            binding.rules[fieldName] as RuleDefinition
          );

          binding.errors.set(fieldName, errors);
          this.displayFieldError(target, errors, binding);
        }
      };

      field.addEventListener('blur', handler);

      // Track event listeners for proper cleanup
      if (!binding.eventListeners.has(field as HTMLElement)) {
        binding.eventListeners.set(field as HTMLElement, []);
      }
      binding.eventListeners
        .get(field as HTMLElement)!
        .push({ event: 'blur', handler });
    });
  }

  private addInputListeners(form: HTMLFormElement, binding: FormBinding): void {
    const fields = form.querySelectorAll('input, select, textarea');

    fields.forEach((field) => {
      const handler = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const fieldName = target.name;

        if (fieldName && binding.rules[fieldName]) {
          const errors = await this.validateField(
            fieldName,
            target.value,
            binding.rules[fieldName] as RuleDefinition
          );

          binding.errors.set(fieldName, errors);
          this.displayFieldError(target, errors, binding);
        }
      };

      field.addEventListener('input', handler);

      // Track event listeners for proper cleanup
      if (!binding.eventListeners.has(field as HTMLElement)) {
        binding.eventListeners.set(field as HTMLElement, []);
      }
      binding.eventListeners
        .get(field as HTMLElement)!
        .push({ event: 'input', handler });
    });
  }

  private addSubmitListener(form: HTMLFormElement, binding: FormBinding): void {
    const handler = async (e: Event) => {
      e.preventDefault();

      const data = this.getFormData(form);
      const result = await binding.validator.validate(data);

      if (result.isValid) {
        binding.options.onSuccess?.(data, result);
      } else {
        // Handle Laravel format errors (object format)
        const groupedErrors: Record<string, string[]> = {};

        // Check if errors is an object (Laravel format) or array (flat format)
        if (Array.isArray(result.errors)) {
          // Handle flat format
          result.errors.forEach((error) => {
            if (!groupedErrors[error.field]) {
              groupedErrors[error.field] = [];
            }
            groupedErrors[error.field]?.push(error.message);
          });
        } else {
          // Handle Laravel format (object)
          Object.entries(result.errors as Record<string, string[]>).forEach(
            ([fieldName, errors]) => {
              groupedErrors[fieldName] = Array.isArray(errors)
                ? errors
                : [errors as string];
            }
          );
        }

        // Update field displays
        Object.entries(groupedErrors).forEach(([fieldName, errors]) => {
          const field = form.querySelector(
            `[name="${fieldName}"]`
          ) as HTMLElement;
          if (field) {
            this.displayFieldError(field, errors, binding);
          }
        });

        binding.options.onError?.(groupedErrors, result);
      }
    };

    form.addEventListener('submit', handler);

    // Track event listeners for proper cleanup
    if (!binding.eventListeners.has(form)) {
      binding.eventListeners.set(form, []);
    }
    binding.eventListeners.get(form)!.push({ event: 'submit', handler });
  }

  private removeEventListeners(
    _form: HTMLFormElement,
    binding: FormBinding
  ): void {
    // Remove all tracked event listeners
    binding.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });

    // Clear the tracking map
    binding.eventListeners.clear();
  }
}
