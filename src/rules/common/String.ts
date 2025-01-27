import { RuleHandler, ValidationContext, DefaultMessages } from "../../types/interfaces.js";

export const stringRule: RuleHandler = {
  validate: (value: any, params: string[], ctx: ValidationContext) => {
    if (typeof value !== "string") return false;

    // Trim if configured
    const processed = ctx.config.autoTrim ? value.trim() : value;

    // Handle nullable
    if (params.includes("nullable") && processed === "") return true;

    // Validate string-specific rules
    for (const param of params) {
      const [ruleName, ruleValue] = param.split(":");

      switch (ruleName) {
        case "min":
          if (processed.length < Number(ruleValue)) return false;
          break;

        case "max":
          if (processed.length > Number(ruleValue)) return false;
          break;

        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(processed)) return false;
          break;

        case "alpha":
          if (!/^[A-Za-z]+$/.test(processed)) return false;
          break;

        case "alpha_num":
          if (!/^[A-Za-z0-9]+$/.test(processed)) return false;
          break;

        case "uuid":
          if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              processed
            )
          )
            return false;
          break;
      }
    }

    return true;
  },

  message: (params: string[], ctx: ValidationContext) => {
    // Get the first rule that failed
    const failedRule = params[0]?.split(":")[0] || "default";

    // Get the configured message
    const message = ctx.config.messages[failedRule];

    // Handle string or object messages
    if (typeof message === "string") {
      return ctx.formatMessage(params, message);
    }

    if (typeof message === "object") {
      // Handle nested message structure (e.g., min.string)
      const subKey = params[0]?.split(".")[1];
      if (subKey && message[subKey]) {
        return ctx.formatMessage(params, message[subKey]);
      }
    }

    // Define default messages with proper typing
    const defaultMessages: DefaultMessages = {
      default: `${ctx.field} must be a string`,
      required: `${ctx.field} is required`,
      min: `${ctx.field} must be at least ${params[0]} characters`,
      max: `${ctx.field} may not be greater than ${params[0]} characters`,
      email: `${ctx.field} must be a valid email address`,
      alpha: `${ctx.field} must contain only letters`,
      alpha_num: `${ctx.field} must contain only letters and numbers`,
      uuid: `${ctx.field} must be a valid UUID`,
    };

    // Safe access with fallback
    return defaultMessages[failedRule] || defaultMessages.default;
  },

  additionalRules: {
    min: (min: number) => ({
      validate: (value: string) => value.length >= min,
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages.min;
        const defaultMessage = `Must be at least ${min} characters`;
        const resolvedMessage =
          typeof message === "string"
            ? message
            : message?.string || defaultMessage;
        return ctx.formatMessage([min.toString()], resolvedMessage);
      },
    }),
    max: (max: number) => ({
      validate: (value: string) => value.length <= max,
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages.max;
        const defaultMessage = `Cannot exceed ${max} characters`;

        const resolvedMessage =
          typeof message === "string"
            ? message
            : message?.string || defaultMessage;

        return ctx.formatMessage([max.toString()], resolvedMessage);
      },
    }),
    email: () => ({
      validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages.email;
        const defaultMessage = "Must be a valid email address";

        const resolvedMessage =
          typeof message === "string"
            ? message
            : message?.string || defaultMessage;

        return ctx.formatMessage([], resolvedMessage);
      },
    }),
    alpha: () => ({
      validate: (value: string) => /^[A-Za-z]+$/.test(value),
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages.alpha;
        const defaultMessage = "Must contain only letters";

        const resolvedMessage =
          typeof message === "string"
            ? message
            : message?.string || defaultMessage;

        return ctx.formatMessage([], resolvedMessage);
      },
    }),

    alpha_num: () => ({
      validate: (value: string) => /^[A-Za-z0-9]+$/.test(value),
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages.alpha_num;
        const defaultMessage = "Must contain only letters and numbers";

        const resolvedMessage =
          typeof message === "string"
            ? message
            : message?.string || defaultMessage;

        return ctx.formatMessage([], resolvedMessage);
      },
    }),

    uuid: () => ({
      validate: (value: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value
        ),
      message: ([], ctx: ValidationContext) => {
        // message: (params: string[], ctx: ValidationContext) => {
        const message = ctx.config.messages.uuid;
        const defaultMessage = "Must be a valid UUID";

        const resolvedMessage =
          typeof message === "string"
            ? message
            : message?.string || defaultMessage;

        return ctx.formatMessage([], resolvedMessage);
      },
    }),
  },
};
