import { Rule } from '../../types/rules';
import { parseDateString } from '@/utils';

/**
 * Date after validation
 */
export const dateAfterRule: Rule = {
  name: 'date.after',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value instanceof Date)) return false;
    if (isNaN(value.getTime())) return false;
    
    const [compareDate] = parameters;
    const compare = typeof compareDate === 'string' ? parseDateString(compareDate) : compareDate;
    if (!(compare instanceof Date) || isNaN(compare.getTime())) return false;
    
    // Compare at day level (strip time)
    const valueDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const compareDateTime = new Date(compare.getFullYear(), compare.getMonth(), compare.getDate());
    
    return valueDate.getTime() > compareDateTime.getTime();
  },
  message: 'The {field} must be a date after {0}.',
  priority: 2,
};

/**
 * Date before validation
 */
export const dateBeforeRule: Rule = {
  name: 'date.before',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value instanceof Date)) return false;
    if (isNaN(value.getTime())) return false;
    
    const [compareDate] = parameters;
    const compare = typeof compareDate === 'string' ? parseDateString(compareDate) : compareDate;
    if (!(compare instanceof Date) || isNaN(compare.getTime())) return false;
    
    // Compare at day level (strip time)
    const valueDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const compareDateTime = new Date(compare.getFullYear(), compare.getMonth(), compare.getDate());
    
    return valueDate.getTime() < compareDateTime.getTime();
  },
  message: 'The {field} must be a date before {0}.',
  priority: 2,
};

/**
 * Date after or equal validation
 */
export const dateAfterOrEqualRule: Rule = {
  name: 'date.after_or_equal',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value instanceof Date)) return false;
    if (isNaN(value.getTime())) return false;
    
    const [compareDate] = parameters;
    const compare = typeof compareDate === 'string' ? parseDateString(compareDate) : compareDate;
    if (!(compare instanceof Date) || isNaN(compare.getTime())) return false;
    
    // Compare at day level (strip time)
    const valueDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const compareDateTime = new Date(compare.getFullYear(), compare.getMonth(), compare.getDate());
    
    return valueDate.getTime() >= compareDateTime.getTime();
  },
  message: 'The {field} must be a date on or after {0}.',
  priority: 2,
};

/**
 * Date before or equal validation
 */
export const dateBeforeOrEqualRule: Rule = {
  name: 'date.before_or_equal',
  validate: (value: any, parameters: any[]): boolean => {
    if (!(value instanceof Date)) return false;
    if (isNaN(value.getTime())) return false;
    
    const [compareDate] = parameters;
    const compare = typeof compareDate === 'string' ? parseDateString(compareDate) : compareDate;
    if (!(compare instanceof Date) || isNaN(compare.getTime())) return false;

    // Compare at day level (strip time)
    const valueDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const compareDateTime = new Date(compare.getFullYear(), compare.getMonth(), compare.getDate());

    return valueDate.getTime() <= compareDateTime.getTime();
  },
  message: 'The {field} must be a date on or before {0}.',
  priority: 2,
};