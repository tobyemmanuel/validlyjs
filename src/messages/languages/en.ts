import { LanguagePack } from '../../types/messages.js';

const enMessages: LanguagePack = {
  // Core modifiers
  required: 'The {field} field is required',
  nullable: 'The {field} field may be null',
  optional: 'The {field} field is optional',

  // Type validation rules (ADD THESE)
  string: 'The {field} field must be a string',
  number: 'The {field} field must be a number',
  boolean: 'The {field} field must be a boolean',
  array: 'The {field} field must be an array',
  object: 'The {field} field must be an object',
  date: 'The {field} field must be a valid date',

  // String rules
  'string.min': 'The {field} field must be at least {min} characters',
  'string.max': 'The {field} field must not exceed {max} characters',
  'string.length': 'The {field} field must be exactly {length} characters',
  'string.email': 'The {field} field must be a valid email address',
  'string.url': 'The {field} field must be a valid URL',
  'string.regex': 'The {field} field format is invalid',
  'string.alpha': 'The {field} field must only contain letters',
  'string.alpha_num': 'The {field} field must only contain letters and numbers',
  'string.alpha_num_dash':
    'The {field} field must only contain letters, numbers, dashes, and underscores',
  'string.uuid': 'The {field} field must be a valid UUID',
  'string.json': 'The {field} field must be valid JSON',
  'string.starts_with': 'The {field} field must start with {prefix}',
  'string.ends_with': 'The {field} field must end with {suffix}',
  'string.contains': 'The {field} field must contain {substring}',
  'string.in': 'The {field} field must be one of: {options}',
  'string.not_in': 'The {field} field must not be one of: {options}',
  'string.hex': 'The {field} field must be a valid hexadecimal color',
  'string.credit_card': 'The {field} field must be a valid credit card number',
  'string.alpha_space':
    'The {field} field must only contain letters and spaces',

  // Number rules
  'number.min': 'The {field} field must be at least {min}',
  'number.size': 'The {field} field must equal {0}',
  'number.max': 'The {field} field must not exceed {max}',
  'number.numeric': 'The {field} field must be numeric',
  'number.between': 'The {field} field must be between {min} and {max}',
  'number.positive': 'The {field} field must be positive',
  'number.negative': 'The {field} field must be negative',
  'number.integer': 'The {field} field must be an integer',
  'number.decimal':
    'The {field} field must have at most {places} decimal places',
  'number.multiple_of': 'The {field} field must be a multiple of {divisor}',
  'number.in': 'The {field} field must be one of: {options}',
  'number.not_in': 'The {field} field must not be one of: {options}',

  // Boolean rules
  'boolean.true': 'The {field} field must be true',
  'boolean.accepted': 'The {field} field must be accepted',
  'boolean.false': 'The {field} field must be false',

  // Date rules
  'date.after': 'The {field} field must be after {date}',
  'date.before': 'The {field} field must be before {date}',
  'date.after_or_equal': 'The {field} field must be after or equal to {date}',
  'date.before_or_equal': 'The {field} field must be before or equal to {date}',
  'date.format': 'The {field} field must match format {format}',
  'date.timezone': 'The {field} field must be in timezone {timezone}',
  'date.weekday': 'The {field} field must be a weekday',
  'date.weekend': 'The {field} field must be a weekend',
  'date.iso': 'The {field} field must be a valid ISO date',

  // Array rules
  'array.min': 'The {field} field must contain at least {min} items',
  'array.max': 'The {field} field must not contain more than {max} items',
  'array.length': 'The {field} field must contain exactly {length} items',
  'array.unique': 'The {field} field must contain unique items',
  'array.contains': 'The {field} field must contain {value}',

  // Object rules
  'object.shape': 'The {field} field contains invalid shape',
  'object.strict': 'The {field} field contains invalid properties',
  'object.keys': 'The {field} field contains invalid keys',

  // File rules
  'file.max': 'The {field} field must not exceed {max}KB',
  'file.min': 'The {field} field must be at least {min}KB',
  'file.width': 'The {field} field must be {width} pixels wide',
  'file.height': 'The {field} field must be {height} pixels high',
  'file.minWidth': 'The {field} field must be at least {minWidth} pixels wide',
  'file.minHeight':
    'The {field} field must be at least {minHeight} pixels high',
  'file.maxWidth': 'The {field} field must not exceed {maxWidth} pixels wide',
  'file.maxHeight': 'The {field} field must not exceed {maxHeight} pixels high',
  'file.extensions': 'The {field} field must have extension: {extensions}',
  'file.image': 'The {field} field must be an image',
  'file.dimensions': 'The {field} field dimensions are invalid',
  'file.between': 'The {field} field must be between {min}KB and {max}KB',
  'file.size': 'The {field} field must be exactly {size}KB',

  // Conditional rules
  required_if: 'The {field} field is required when {field} is {value}',
  required_with: 'The {field} field is required when {fields} is present',
  required_with_all:
    'The {field} field is required when all of {fields} are present',
  required_without:
    'The {field} field is required when {fields} is not present',
  required_without_all:
    'The {field} field is required when none of {fields} are present',
  required_unless: 'The {field} field is required unless {field} is {value}',

  // Union rules
  union: 'The {field} field must match one of these formats: {formats}',
  'union.failed':
    'The {field} field must match at least one of the specified formats',
  'union.detailed':
    'The {field} field must match one of these formats: {formats}',

  // Generic fallbacks
  invalid: 'The {field} field is invalid',
  type_error: 'The {field} field must be of type {type}',
  custom_rule: 'The {field} field failed custom validation',
};

export default enMessages;
