export { MessageResolver } from './message-resolver';
export { MessageFormatter } from './formatter';
export type { 
  MessageConfig, 
  MessageTemplate, 
  MessageContext, 
  LanguagePack,
  MessageFormatter as IMessageFormatter 
} from '../types/messages';

// Language exports
export { default as enMessages } from './languages/en';
export { default as esMessages } from './languages/es';
export { default as frMessages } from './languages/fr';

// Preset exports
export { laravelPreset } from './presets/laravel';
export { apiPreset } from './presets/api';
export { formPreset } from './presets/form';