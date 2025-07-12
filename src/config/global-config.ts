import { GlobalConfig as GlobalConfigInterface } from '../types';
import { laravelPreset, apiPreset, formPreset } from '../messages';

const presets: Record<string, Partial<GlobalConfigInterface>> = {
  laravel: laravelPreset,
  api: apiPreset,
  form: formPreset,
};
export class GlobalConfig {
  private static config: GlobalConfigInterface = {
    responseType: 'laravel',
    language: 'en',
    messages: {},
    fieldMessages: {},
  };

  static configure(config: Partial<GlobalConfigInterface>): void {
    this.config = { ...this.config, ...config };
  }

  static usePreset(preset: string): void {
    if (presets[preset]) {
      this.configure(presets[preset] as Partial<GlobalConfig>);
    } else {
      throw new Error(`Unknown preset: ${preset}`);
    }
  }

  static createPreset(name: string, config: Partial<GlobalConfig>): void {
    presets[name] = config;

    if (presets[name]) {
      this.configure(presets[name] as Partial<GlobalConfig>);
    } else {
      throw new Error(`Unknown preset: ${name}`);
    }
  }

  static getConfig(): GlobalConfigInterface {
    return { ...this.config };
  }
}
