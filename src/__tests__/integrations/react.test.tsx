/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useValidation } from '../../integrations/react/use-validation';
import { ValidationProvider, ValidatedForm, ValidatedField, useValidationContext } from '../../integrations/react/components';

// Test component for useValidation hook
function TestValidationComponent({ data, rules, options }: any) {
  const {
    errors,
    isValid,
    isDirty,
    touchedFields,
    isValidating,
    validate,
    handleChange,
    handleBlur,
    reset,
    getFieldError,
    hasFieldError
  } = useValidation(data, rules, options);

  return (
    <div>
      <div data-testid="is-valid">{isValid.toString()}</div>
      <div data-testid="is-validating">{isValidating.toString()}</div>
      <div data-testid="errors">{JSON.stringify(errors)}</div>
      <div data-testid="dirty">{JSON.stringify(isDirty)}</div>
      <button onClick={() => validate()} data-testid="validate-all">Validate All</button>
      <button onClick={() => validate('email')} data-testid="validate-email">Validate Email</button>
      <button onClick={() => handleChange('email', 'test@example.com')} data-testid="change-email">Change Email</button>
      <button onClick={() => handleBlur('email')} data-testid="blur-email">Blur Email</button>
      <button onClick={reset} data-testid="reset">Reset</button>
      <div data-testid="email-error">{getFieldError('email') || ''}</div>
      <div data-testid="has-email-error">{hasFieldError('email').toString()}</div>
    </div>
  );
}

describe('React Integration Tests', () => {
  describe('useValidation Hook', () => {
    const testData = { email: '', name: '' };
    const testRules = {
      email: 'required|string|email',
      name: 'required|string|min:2'
    };

    test('should initialize with correct default state', () => {
      render(<TestValidationComponent data={testData} rules={testRules} />);
      
      expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
      expect(screen.getByTestId('is-validating')).toHaveTextContent('false');
      expect(screen.getByTestId('errors')).toHaveTextContent('{}');
    });

    test('should validate all fields', async () => {
      render(<TestValidationComponent data={testData} rules={testRules} />);
      
      fireEvent.click(screen.getByTestId('validate-all'));
      
      await waitFor(() => {
        expect(screen.getByTestId('is-valid')).toHaveTextContent('false');
      });
    });

    test('should validate single field', async () => {
      render(<TestValidationComponent data={testData} rules={testRules} />);
      
      fireEvent.click(screen.getByTestId('validate-email'));
      
      await waitFor(() => {
        expect(screen.getByTestId('has-email-error')).toHaveTextContent('true');
      });
    });

    test('should handle field changes', () => {
      render(<TestValidationComponent data={testData} rules={testRules} />);
      
      fireEvent.click(screen.getByTestId('change-email'));
      
      expect(screen.getByTestId('dirty')).toHaveTextContent('{"email":true}');
    });

    test('should reset validation state', async () => {
      render(<TestValidationComponent data={testData} rules={testRules} />);
      
      // First validate to create errors
      fireEvent.click(screen.getByTestId('validate-all'));
      await waitFor(() => {
        expect(screen.getByTestId('is-valid')).toHaveTextContent('false');
      });
      
      // Then reset
      fireEvent.click(screen.getByTestId('reset'));
      
      expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
      expect(screen.getByTestId('errors')).toHaveTextContent('{}');
    });
  });

  describe('ValidationProvider', () => {
    test('should provide validation context', () => {
      function TestComponent() {
        const context = useValidationContext();
        return <div data-testid="has-context">{context ? 'true' : 'false'}</div>;
      }

      render(
        <ValidationProvider>
          <TestComponent />
        </ValidationProvider>
      );

      expect(screen.getByTestId('has-context')).toHaveTextContent('true');
    });

    test('should throw error when used outside provider', () => {
      function TestComponent() {
        useValidationContext();
        return <div>Test</div>;
      }

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<TestComponent />)).toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('ValidatedForm', () => {
    test('should handle form submission', async () => {
      const onSubmit = jest.fn();
      const data = { email: 'test@example.com' };
      const rules = { email: 'required|string|email' };

      render(
        <ValidatedForm data={data} rules={rules} onSubmit={onSubmit}>
          <button type="submit">Submit</button>
        </ValidatedForm>
      );

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          data,
          true,
          expect.objectContaining({ isValid: true })
        );
      });
    });
  });

  describe('ValidatedField', () => {
    test('should provide field validation props', () => {
      const data = { email: '' };
      const rules = { email: 'required|string|email' };

      render(
        <ValidatedField name="email" data={data} rules={rules}>
          {({ error, hasError, isDirty, isTouched, onChange, onBlur }) => (
            <div>
              <input
              title='input'
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                data-testid="email-input"
              />
              <div data-testid="has-error">{hasError.toString()}</div>
              <div data-testid="is-dirty">{isDirty.toString()}</div>
              <div data-testid="is-touched">{isTouched.toString()}</div>
              {error && <div data-testid="error-message">{error}</div>}
            </div>
          )}
        </ValidatedField>
      );

      expect(screen.getByTestId('has-error')).toHaveTextContent('false');
      expect(screen.getByTestId('is-dirty')).toHaveTextContent('false');
      expect(screen.getByTestId('is-touched')).toHaveTextContent('false');
    });
  });
});