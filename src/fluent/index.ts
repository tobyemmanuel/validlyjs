// First import and export the CoreBuilder class
import { CoreBuilder } from './core-builder';
export * from './core-builder';

// Then export other builders
export * from './base-builder';
export * from './string-builder';
export * from './number-builder';
export * from './boolean-builder';
export * from './date-builder';
export * from './file-builder';
export * from './array-builder';
export * from './object-builder';
export * from './union-builder';

// Finally re-export the static methods
export const {
    string,
    number,
    boolean,
    date,
    file,
    array,
    object,
    union
} = CoreBuilder;