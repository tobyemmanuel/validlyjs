const truthyFalsyMap = new Map<any, boolean>([
  ['true', true],
  ['1', true],
  [1, true],
  ['yes', true],
  ['on', true],
  ['false', false],
  ['0', false],
  [0, false],
  ['no', false],
  ['off', false],
]);

export const toBoolean = (value: any): boolean | undefined => {
  return truthyFalsyMap.get(value);
};
