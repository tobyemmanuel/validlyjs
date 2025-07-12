import { Rule, CustomRuleDefinition } from '../types';
// import { MessageResolver } from '../messages/message-resolver';
import { setMessageBridge, MessageBridge } from '../messages/message-bridge';

export class RuleRegistry {
  private static rules: Map<string, Rule> = new Map();
  private static defaultMessages: Map<string, string> = new Map();
  private static customRules: Map<string, Rule> = new Map();

  // Track loaded rule modules to prevent duplicate loading
  private static loadedModules: Set<string> = new Set();

  // Initialize the message bridge
  static {
    const bridge: MessageBridge = {
      getCustomRuleMessage: (ruleName: string) => {
        return this.defaultMessages.get(ruleName);
      },
    };
    setMessageBridge(bridge);
  }

  static register(name: string, rule: Rule | CustomRuleDefinition): void {
    const normalizedRule: Rule = this.normalizeRule(name, rule);
    this.rules.set(name, normalizedRule);

    // Only resolve message if it exists to avoid unnecessary processing
    if (normalizedRule.message) {
      // Check if we already have a cached message
      if (!this.defaultMessages.has(name)) {

        this.defaultMessages.set(
          name,
          normalizedRule.message
        );
      }
    }
  }

  static registerCustomRule(
    name: string,
    rule: Rule | CustomRuleDefinition
  ): void {
    const normalizedRule: Rule = this.normalizeRule(name, rule);

    // Batch the operations to reduce map operations
    this.customRules.set(name, normalizedRule);
    this.rules.set(name, normalizedRule);

    if (normalizedRule.message) {
      this.defaultMessages.set(name, normalizedRule.message);
    }
  }

  static isCustomRule(name: string): boolean {
    return this.customRules.has(name);
  }

  static get(name: string): Rule | undefined {
    return this.rules.get(name);
  }

  static has(name: string): boolean {
    // Check custom rules first as they're typically fewer
    return this.customRules.has(name) || this.rules.has(name);
  }

  static getAll(): Map<string, Rule> {
    return new Map(this.rules);
  }

  static getCustomRules(): Map<string, Rule> {
    return new Map(this.customRules);
  }

  static getDefaultMessage(name: string): string | undefined {
    return this.defaultMessages.get(name);
  }

  static remove(name: string): boolean {
    // Batch delete operations
    this.defaultMessages.delete(name);
    this.customRules.delete(name);
    // this.builtInRuleCache.delete(name); // Clear cache entry
    return this.rules.delete(name);
  }

  static clear(): void {
    this.rules.clear();
    this.customRules.clear();
    this.defaultMessages.clear();
    // this.builtInRuleCache.clear();
    this.loadedModules.clear();
  }

  static clearCustomRules(): void {
    // Use iterator for better performance with large maps
    for (const [name] of this.customRules) {
      this.rules.delete(name);
      this.defaultMessages.delete(name);
      // this.builtInRuleCache.delete(name);
    }
    this.customRules.clear();
  }

  private static normalizeRule(
    name: string,
    rule: Rule | CustomRuleDefinition
  ): Rule {
    // Fast path for already normalized rules
    if ('name' in rule && rule.name === name) {
      return rule as Rule;
    }

    return {
      name,
      validate: rule.validate,
      message: rule.message ?? 'unknown',
      async: rule.async ?? false,
      priority: rule.priority ?? 0,
    };
  }

  static loadBuiltInRules(): void {
    // Load all rule modules in parallel for better performance
    Promise.all([
      this.loadCoreRules(),
      this.loadStringRules(),
      this.loadNumberRules(),
      this.loadDateRules(),
      this.loadFileRules(),
      this.loadArrayRules(),
      this.loadBooleanRules(),
      this.loadNetworkRules(),
      this.loadObjectRules(),
    ]).catch((error) => {
      console.error('Failed to load built-in rules:', error);
    });
  }

  private static async loadCoreRules(): Promise<void> {
    if (this.loadedModules.has('core')) return;

    try {
      const [coreModule, unionModule, conditionalModule, typeModule] =
        await Promise.all([
          import('../rules/core/required'),
          import('../rules/core/union'),
          import('../rules/core/conditional'),
          import('../rules/core/type-checking'),
        ]);

      // Batch register core rules
      const coreRules = [
        ['required', coreModule.requiredRule],
        ['nullable', coreModule.nullableRule],
        ['optional', coreModule.optionalRule],
        ['present', coreModule.presentRule],
        ['confirmed', coreModule.confirmedRule],
        ['same', coreModule.sameRule],
        ['different', coreModule.differentRule],
        ['union', unionModule.unionRule],
      ] as const;

      coreRules.forEach(([name, rule]) => this.register(name, rule));

      // Batch register conditional rules
      const conditionalRules = [
        ['required_if', conditionalModule.requiredIfRule],
        ['required_unless', conditionalModule.requiredUnlessRule],
        ['required_with', conditionalModule.requiredWithRule],
        ['required_with_all', conditionalModule.requiredWithAllRule],
        ['required_without', conditionalModule.requiredWithoutRule],
        ['required_without_all', conditionalModule.requiredWithoutAllRule],
        ['prohibited', conditionalModule.prohibitedRule],
        ['prohibited_if', conditionalModule.prohibitedIfRule],
        ['prohibited_unless', conditionalModule.prohibitedUnlessRule],
      ] as const;

      conditionalRules.forEach(([name, rule]) => this.register(name, rule));

      // Batch register type rules
      const typeRules = [
        ['string', typeModule.stringRule],
        ['number', typeModule.numberRule],
        ['integer', typeModule.integerRule],
        ['boolean', typeModule.booleanRule],
        ['array', typeModule.arrayRule],
        ['object', typeModule.objectRule],
        ['date', typeModule.dateRule],
        ['file', typeModule.fileRule],
        ['numeric', typeModule.numericRule],
        ['scalar', typeModule.scalarRule],
      ] as const;

      typeRules.forEach(([name, rule]) => this.register(name, rule));

      this.loadedModules.add('core');
    } catch (error) {
      console.error('Failed to load core rules:', error);
    }
  }

  private static async loadStringRules(): Promise<void> {
    if (this.loadedModules.has('string')) return;

    try {
      const module = await import('../rules/string/index');

      // Batch register string rules
      const stringRules = [
        ['string.min', module.stringMinRule],
        ['string.max', module.stringMaxRule],
        ['string.length', module.stringLengthRule],
        ['string.size', module.stringSizeRule],
        ['string.between', module.stringBetweenRule],
        ['string.starts_with', module.startsWithRule],
        ['string.ends_with', module.endsWithRule],
        ['string.contains', module.containsRule],
        ['string.in', module.inRule],
        ['string.not_in', module.notInRule],
        ['string.regex', module.regexRule],
        ['string.alpha', module.alphaRule],
        ['string.alpha_num', module.alphaNumericRule],
        ['string.alpha_dash', module.alphaDashRule],
        ['string.alpha_space', module.alphaSpaceRule],
        ['string.email', module.emailRule],
        ['string.url', module.urlRule],
        ['string.uuid', module.uuidRule],
        ['string.json', module.jsonRule],
        ['string.ipv4', module.ipv4Rule],
        ['string.ipv6', module.ipv6Rule],
        ['string.ip', module.ipRule],
        ['string.mac_address', module.macAddressRule],
        ['string.hex_color', module.hexColorRule],
        ['string.credit_card', module.creditCardRule],
      ] as const;

      stringRules.forEach(([name, rule]) => this.register(name, rule));
      this.loadedModules.add('string');
    } catch (error) {
      console.error('Failed to load string rules:', error);
    }
  }

  private static async loadNumberRules(): Promise<void> {
    if (this.loadedModules.has('number')) return;

    try {
      const module = await import('../rules/number/index');

      const numberRules = [
        ['number.min', module.numberMinRule],
        ['number.max', module.numberMaxRule],
        ['number.between', module.numberBetweenRule],
        ['number.numeric', module.numberNumericRule],
        ['number.size', module.numberSizeRule],
        ['number.in', module.numberInRule],
        ['number.not_in', module.numberNotInRule],
        ['number.positive', module.numberPositiveRule],
        ['number.negative', module.numberNegativeRule],
        ['number.integer', module.numberIntegerRule],
        ['number.decimal', module.numberDecimalRule],
        ['number.multiple_of', module.numberMultipleOfRule],
      ] as const;

      numberRules.forEach(([name, rule]) => this.register(name, rule));
      this.loadedModules.add('number');
    } catch (error) {
      console.error('Failed to load number rules:', error);
    }
  }

  private static async loadBooleanRules(): Promise<void> {
    if (this.loadedModules.has('boolean')) return;

    try {
      const module = await import('../rules/boolean/index');

      const booleanRules = [
        ['boolean.true', module.booleanTrueRule],
        ['boolean.accepted', module.booleanAcceptedRule],
        ['boolean.false', module.booleanFalseRule],
      ] as const;

      booleanRules.forEach(([name, rule]) => this.register(name, rule));
      this.loadedModules.add('boolean');
    } catch (error) {
      console.error('Failed to load boolean rules:', error);
    }
  }

  private static async loadDateRules(): Promise<void> {
    if (this.loadedModules.has('date')) return;

    try {
      const module = await import('../rules/date/index');

      const dateRules = [
        ['date.format', module.dateFormatRule],
        ['date.iso', module.dateIsoRule],
        ['date.timezone', module.dateTimezoneRule],
        ['date.weekday', module.dateWeekdayRule],
        ['date.weekend', module.dateWeekendRule],
        ['date.after', module.dateAfterRule],
        ['date.before', module.dateBeforeRule],
        ['date.after_or_equal', module.dateAfterOrEqualRule],
        ['date.before_or_equal', module.dateBeforeOrEqualRule],
      ] as const;

      dateRules.forEach(([name, rule]) => this.register(name, rule));
      this.loadedModules.add('date');
    } catch (error) {
      console.error('Failed to load date rules:', error);
    }
  }

  private static async loadArrayRules(): Promise<void> {
    if (this.loadedModules.has('array')) return;

    try {
      const [sizeModule, contentModule, eachModule] = await Promise.all([
        import('../rules/array/size'),
        import('../rules/array/content'),
        import('../rules/array/each'),
      ]);

      const arrayRules = [
        ['array.min', sizeModule.arrayMinRule],
        ['array.max', sizeModule.arrayMaxRule],
        ['array.length', sizeModule.arrayLengthRule],
        ['array.between', sizeModule.arrayBetweenRule],
        ['array.unique', contentModule.arrayUniqueRule],
        ['array.distinct', contentModule.arrayDistinctRule],
        ['array.contains', contentModule.arrayContainsRule],
        ['array.notContains', contentModule.arrayNotContainsRule],
        ['array.each', eachModule.arrayEachRule],
        // ['array.at', eachModule.arrayAtRule],
      ] as const;

      arrayRules.forEach(([name, rule]) => this.register(name, rule));
      this.loadedModules.add('array');
    } catch (error) {
      console.error('Failed to load array rules:', error);
    }
  }

  private static async loadObjectRules(): Promise<void> {
    if (this.loadedModules.has('object')) return;

    try {
      const module = await import('../rules/object');

      const objectRules = [
        ['object.shape', module.objectShapeRule],
        ['object.has', module.objectHasRule],
        ['object.keys', module.objectKeysRule],
        ['object.requiredKeys', module.objectRequiredKeysRule],
        ['object.keyCount', module.objectKeyCountRule],
        ['object.strict', module.objectStrictRule],
        ['object.notEmpty', module.objectNotEmptyRule],
      ] as const;

      objectRules.forEach(([name, rule]) => this.register(name, rule));
      this.loadedModules.add('object');
    } catch (error) {
      console.error('Failed to load object rules:', error);
    }
  }

  private static async loadFileRules(): Promise<void> {
    if (this.loadedModules.has('file')) return;

    try {
      const [sizeModule, typeModule, imageModule, dimensionsModule] =
        await Promise.all([
          import('../rules/file/size'),
          import('../rules/file/type'),
          import('../rules/file/image'),
          import('../rules/file/dimensions'),
        ]);

      const fileRules = [
        ['file.min', sizeModule.fileMinRule],
        ['file.max', sizeModule.fileMaxRule],
        ['file.size', sizeModule.fileSizeRule],
        ['file.between', sizeModule.fileRangeRule],
        ['file.mimes', typeModule.fileMimeTypesRule],
        ['file.extensions', typeModule.fileExtensionsRule],
        ['file.image', imageModule.fileImageRule],
        ['file.width', dimensionsModule.fileWidthRule],
        ['file.height', dimensionsModule.fileHeightRule],
        ['file.min_width', dimensionsModule.fileMinWidthRule],
        ['file.max_width', dimensionsModule.fileMaxWidthRule],
        ['file.min_height', dimensionsModule.fileMinHeightRule],
        ['file.max_height', dimensionsModule.fileMaxHeightRule],
      ] as const;

      fileRules.forEach(([name, rule]) => this.register(name, rule));
      this.loadedModules.add('file');
    } catch (error) {
      console.error('Failed to load file rules:', error);
    }
  }

  private static async loadNetworkRules(): Promise<void> {
    if (this.loadedModules.has('network')) return;

    try {
      const [portModule, domainModule] = await Promise.all([
        import('../rules/network/port'),
        import('../rules/network/domain'),
      ]);

      const networkRules = [
        ['network.port', portModule.portRule],
        ['network.domain', domainModule.domainRule],
      ] as const;

      networkRules.forEach(([name, rule]) => this.register(name, rule));
      this.loadedModules.add('network');
    } catch (error) {
      console.error('Failed to load network rules:', error);
    }
  }
}
