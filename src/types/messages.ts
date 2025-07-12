// Message configuration
export interface MessageConfig {
    language: string;
    messages: Record<string, string>;
    fieldMessages: Record<string, string>;
    customLanguages: Record<string, Record<string, string>>;
  }
  
  // Message template
  export interface MessageTemplate {
    template: string;
    parameters: string[];
  }
  
  // Message context for formatting
  export interface MessageContext {
    field: string;
    rule: string;
    value: any;
    parameters: any[];
    data: Record<string, any>;
  }
  
  // Language pack
  export interface LanguagePack {
    [key: string]: string;
  }
  
  // Message formatter interface
  export interface MessageFormatter {
    format(template: string, context: MessageContext): string;
    formatFieldName(field: string): string;
    addPlaceholder(name: string, formatter: (value: any) => string): void;
  }