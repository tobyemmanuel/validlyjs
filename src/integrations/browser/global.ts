import { DOMBinder } from './dom-binder';
import { Validator } from '../../core/validator';
import { ValidatorOptions, RuleDefinition } from '../../index';

// Global ValidlyJS object for UMD builds
export class ValidlyJS {
  private domBinder: DOMBinder;
  
  constructor() {
    this.domBinder = new DOMBinder();
  }
  
  // Create a new validator instance
  validator(rules: Record<string, RuleDefinition> = {}, options: ValidatorOptions = {}) {
    return new Validator(rules, options);
  }
  
  // Bind form validation
  bindForm(form: HTMLFormElement | string, rules: Record<string, RuleDefinition>, options = {}) {
    const formElement = typeof form === 'string' 
      ? document.querySelector(form) as HTMLFormElement
      : form;
      
    if (!formElement) {
      throw new Error('Form element not found');
    }
    
    return this.domBinder.bindForm(formElement, rules, options);
  }
  
  // Unbind form validation
  unbindForm(form: HTMLFormElement | string) {
    const formElement = typeof form === 'string'
      ? document.querySelector(form) as HTMLFormElement
      : form;
      
    if (formElement) {
      this.domBinder.unbindForm(formElement);
    }
  }
  
  // Validate a single field
  async validateField(fieldName: string, value: any, rules: RuleDefinition, options?: ValidatorOptions) {
    return this.domBinder.validateField(fieldName, value, rules, options);
  }
  
  // Get form data
  getFormData(form: HTMLFormElement | string) {
    const formElement = typeof form === 'string'
      ? document.querySelector(form) as HTMLFormElement
      : form;
      
    if (!formElement) {
      throw new Error('Form element not found');
    }
    
    return this.domBinder.getFormData(formElement);
  }
}

// Auto-initialize global object in browser environment
if (typeof window !== 'undefined') {
  (window as any).ValidlyJS = new ValidlyJS();
}

export default ValidlyJS;