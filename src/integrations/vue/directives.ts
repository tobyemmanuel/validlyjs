import { DirectiveBinding, App } from 'vue';
import { Validator } from 'validlyjs';

// v-validate directive
export const vValidate = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value: rules, modifiers } = binding;
    
    if (!rules) return;
    
    const validator = new Validator({ [(el as any).name || 'field']: rules });
    
    const validateField = async () => {
      const fieldName = (el as any).name || 'field';
      const fieldValue = (el as HTMLInputElement).value;
      
      try {
        const result = await validator.validate({ [fieldName]: fieldValue });
        
        // Remove existing error classes
        el.classList.remove('error', 'valid');
        
        if (result.isValid) {
          el.classList.add('valid');
          el.removeAttribute('data-error');
        } else {
          el.classList.add('error');
          const errorMessage = result.errors[0]?.message || 'Validation failed';
          el.setAttribute('data-error', errorMessage);
        }
        
        // Dispatch custom event
        el.dispatchEvent(new CustomEvent('validation', {
          detail: { isValid: result.isValid, errors: result.errors }
        }));
      } catch (error) {
        console.error('Validation error:', error);
      }
    };
    
    // Add event listeners based on modifiers
    if (modifiers.blur || !Object.keys(modifiers).length) {
      el.addEventListener('blur', validateField);
    }
    
    if (modifiers.input) {
      el.addEventListener('input', validateField);
    }
    
    if (modifiers.change) {
      el.addEventListener('change', validateField);
    }
    
    // Store validator for cleanup
    (el as any)._validator = validator;
    (el as any)._validateField = validateField;
  },
  
  unmounted(el: HTMLElement) {
    // Cleanup
    if ((el as any)._validateField) {
      el.removeEventListener('blur', (el as any)._validateField);
      el.removeEventListener('input', (el as any)._validateField);
      el.removeEventListener('change', (el as any)._validateField);
    }
  }
};

// v-validate-on directive for custom events
export const vValidateOn = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value: config, arg: eventName = 'blur' } = binding;
    
    if (!config || !config.rules) return;
    
    const validator = new Validator({ [config.field || 'field']: config.rules });
    
    const validateField = async () => {
      const fieldName = config.field || 'field';
      const fieldValue = config.getValue ? config.getValue(el) : (el as HTMLInputElement).value;
      
      try {
        const result = await validator.validate({ [fieldName]: fieldValue });
        
        if (config.onValidate) {
          config.onValidate(result, el);
        }
      } catch (error) {
        console.error('Validation error:', error);
      }
    };
    
    el.addEventListener(eventName, validateField);
    (el as any)._validateField = validateField;
    (el as any)._eventName = eventName;
  },
  
  unmounted(el: HTMLElement) {
    if ((el as any)._validateField && (el as any)._eventName) {
      el.removeEventListener((el as any)._eventName, (el as any)._validateField);
    }
  }
};

// v-error-display directive
export const vErrorDisplay = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value: fieldName, modifiers } = binding;
    
    if (!fieldName) return;
    
    const template = modifiers.html ? 'html' : 'text';
    
    const handleValidationResult = (event: any) => {
      const result = event.detail;
      
      if (result.errors && result.errors.length > 0) {
        const error = result.errors.find((err: any) => err.field === fieldName);
        
        if (error) {
          if (template === 'text') {
            el.textContent = error.message;
          } else if (template === 'html') {
            el.innerHTML = error.message;
          }
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      } else {
        el.style.display = 'none';
      }
    };
    
    // Listen for validation events from the associated field
    document.addEventListener('validation', handleValidationResult);
    (el as any)._handleValidationResult = handleValidationResult;
  },
  
  unmounted(el: HTMLElement) {
    if ((el as any)._handleValidationResult) {
      document.removeEventListener('validation', (el as any)._handleValidationResult);
    }
  }
};

// Plugin installation function
export function install(app: App) {
  app.directive('validate', vValidate);
  app.directive('validate-on', vValidateOn);
  app.directive('error-display', vErrorDisplay);
}