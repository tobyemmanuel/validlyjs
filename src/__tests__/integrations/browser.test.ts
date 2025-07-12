/**
 * @jest-environment jsdom
 */
import { DOMBinder } from '../../integrations/browser/dom-binder';

// Mock DOM environment
Object.defineProperty(window, 'FormData', {
  writable: true,
  value: class FormData {
    private data: Map<string, any> = new Map();
    
    append(key: string, value: any) {
      this.data.set(key, value);
    }
    
    entries() {
      return this.data.entries();
    }
  }
});

describe('Browser DOM Integration Tests', () => {
  let domBinder: DOMBinder;
  let form: HTMLFormElement;
  let emailInput: HTMLInputElement;
  let nameInput: HTMLInputElement;

  beforeEach(() => {
    domBinder = new DOMBinder();
    
    // Create test form
    document.body.innerHTML = `
      <form id="test-form">
        <input type="email" name="email" id="email" />
        <input type="text" name="name" id="name" />
        <button type="submit">Submit</button>
      </form>
    `;
    
    form = document.getElementById('test-form') as HTMLFormElement;
    emailInput = document.getElementById('email') as HTMLInputElement;
    nameInput = document.getElementById('name') as HTMLInputElement;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('DOMBinder', () => {
    test('should bind form with validation rules', () => {
      const rules = {
        email: 'required|string|email',
        name: 'required|string|min:2'
      };

      const binding = domBinder.bindForm(form, rules);

      expect(binding).toBeDefined();
      expect(binding.rules).toEqual(rules);
      expect(binding.validator).toBeDefined();
    });

    test('should validate field on blur', async () => {
      const rules = {
        email: 'required|string|email',
        name: 'required|string|min:2'
      };

      domBinder.bindForm(form, rules, { validateOnBlur: true });

      emailInput.value = 'invalid-email';
      emailInput.dispatchEvent(new Event('blur'));

      // Wait for async validation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(emailInput.classList.contains('error')).toBe(true);
    });

    test('should validate field on input', async () => {
      const rules = {
        email: 'required|string|email'
      };

      domBinder.bindForm(form, rules, { validateOnInput: true });

      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));

      // Wait for async validation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(emailInput.classList.contains('valid')).toBe(true);
    });

    test('should handle form submission', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      
      const rules = {
        email: 'required|string|email',
        name: 'required|string|min:2'
      };

      domBinder.bindForm(form, rules, {
        validateOnSubmit: true,
        onSuccess,
        onError
      });

      emailInput.value = 'test@example.com';
      nameInput.value = 'John';

      form.dispatchEvent(new Event('submit'));

      // Wait for async validation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onSuccess).toHaveBeenCalled();
    });

    test('should get form data correctly', () => {
      emailInput.value = 'test@example.com';
      nameInput.value = 'John';

      const formData = domBinder.getFormData(form);

      expect(formData).toEqual({
        email: 'test@example.com',
        name: 'John'
      });
    });

    test('should validate single field', async () => {
      const errors = await domBinder.validateField(
        'email',
        'invalid-email',
        'required|string|email'
      );

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('email');
    });

    test('should unbind form', () => {
      const rules = { email: 'required|string|email' };
      domBinder.bindForm(form, rules);
      
      domBinder.unbindForm(form);
      
      // Form should no longer be bound
      expect(() => {
        emailInput.dispatchEvent(new Event('blur'));
      }).not.toThrow();
    });

    test('should display and clear field errors', () => {
      const rules = { email: 'required|string|email' };
      const binding = domBinder.bindForm(form, rules);
      
      // Display error
      domBinder.displayFieldError(emailInput, ['Invalid email'], binding);
      
      expect(emailInput.classList.contains('error')).toBe(true);
      expect(document.querySelector('.field-error')).toBeTruthy();
      
      // Clear error
      domBinder.clearFieldError(emailInput);
      
      expect(document.querySelector('.field-error')).toBeFalsy();
    });
  });
});