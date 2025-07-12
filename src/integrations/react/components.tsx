import React, { createContext, useContext, ReactNode } from 'react';
import { Validator,  ValidationResult, RuleDefinition, ValidatorOptions } from 'validlyjs';
import { useValidation, UseValidationOptions } from './use-validation';

// Validation Context
interface ValidationContextType {
  validator: Validator;
  options: ValidatorOptions;
}

const ValidationContext = createContext<ValidationContextType | null>(null);

export interface ValidationProviderProps {
  children: ReactNode;
  options?: ValidatorOptions;
}

export function ValidationProvider({ children, options = {} }: ValidationProviderProps) {
  const validator = new Validator({}, options);
  
  return (
    <ValidationContext.Provider value={{ validator, options }}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidationContext() {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidationContext must be used within a ValidationProvider');
  }
  return context;
}

// Validated Form Component
export interface ValidatedFormProps {
  onSubmit: (data: any, isValid: boolean, result: ValidationResult) => void;
  children: ReactNode;
  data: Record<string, any>;
  rules: Record<string, RuleDefinition>;
  options?: UseValidationOptions;
  className?: string;
  [key: string]: any;
}

export function ValidatedForm({
  onSubmit,
  children,
  data,
  rules,
  options,
  className,
  ...props
}: ValidatedFormProps) {
  // const { validate } = useValidation(data, rules, options);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validator = new Validator(rules, options);
    const result = await validator.validate(data);
    
    onSubmit(data, result.isValid, result);
  };
  
  return (
    <form onSubmit={handleSubmit} className={className} {...props}>
      {children}
    </form>
  );
}

// Validated Field Component
export interface ValidatedFieldProps {
  name: string;
  children: (fieldProps: {
    error?: string;
    hasError: boolean;
    isDirty: boolean;
    isTouched: boolean;
    onChange: (value: any) => void;
    onBlur: () => void;
  }) => ReactNode;
  data: Record<string, any>;
  rules: Record<string, RuleDefinition>;
  options?: UseValidationOptions;
}

export function ValidatedField({ name, children, data, rules, options }: ValidatedFieldProps) {
  const {
    // errors,
    isDirty,
    touchedFields,
    handleChange,
    handleBlur,
    getFieldError,
    hasFieldError
  } = useValidation(data, rules, options);
  
  return (
    <>
      {children({
        error: getFieldError(name) || '',
        hasError: hasFieldError(name) || false,
        isDirty: isDirty[name] || false,
        isTouched: touchedFields.has(name),
        onChange: (value: any) => handleChange(name, value),
        onBlur: () => handleBlur(name)
      })}
    </>
  );
}