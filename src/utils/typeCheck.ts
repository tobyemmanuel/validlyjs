export const DATA_TYPES = ["string", "number", "boolean", "array", "date", "file", "object"];

export function getDataTypes(rules: string[]): string[] {
  return rules.filter((rule) => DATA_TYPES.includes(rule));
}

export function validateSingleDataType(rules: string[], field: string): void {
  const types = getDataTypes(rules);
  if (types.length > 1) {
    throw new Error(
      `Field "${field}" has conflicting data types: ${types.join(", ")}`
    );
  }
}
