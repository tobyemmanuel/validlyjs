import { jest } from '@jest/globals';
import { ArrayParser } from '../../parsers';

describe('ArrayParser', () => {
  let parser: ArrayParser;

  beforeEach(() => {
    parser = new ArrayParser();
  });

  it('parses string rules', () => {
    const schema = ['string', 'required', 'min:3', 'email'];
    const result = parser.parse(schema);
    expect(result).toEqual([
      { name: 'string', parameters: [], modifiers: [], dataType: 'string' },
      { name: 'required', parameters: [], modifiers: [], isModifier: true },
      {
        name: 'string.min',
        parameters: [3],
        modifiers: [],
        dataType: 'string',
      },
      {
        name: 'string.email',
        parameters: [],
        modifiers: [],
        dataType: 'string',
      },
    ]);
  });

  it('parses number rules', () => {
    const schema = ['number', 'min:18', 'max:120'];
    const result = parser.parse(schema);
    expect(result).toEqual([
      { name: 'number', parameters: [], modifiers: [], dataType: 'number' },
      {
        name: 'number.min',
        parameters: [18],
        modifiers: [],
        dataType: 'number',
      },
      {
        name: 'number.max',
        parameters: [120],
        modifiers: [],
        dataType: 'number',
      },
    ]);
  });

  it('parses union types', () => {
    const schema = [
      ['string', 'email'],
      ['number', 'positive'],
    ];
    const result = parser.parse(schema);
    expect(result).toEqual([
      [
        { name: 'string', parameters: [], modifiers: [], dataType: 'string' },
        {
          name: 'string.email',
          parameters: [],
          modifiers: [],
          dataType: 'string',
        },
      ],
      [
        { name: 'number', parameters: [], modifiers: [], dataType: 'number' },
        {
          name: 'number.positive',
          parameters: [],
          modifiers: [],
          dataType: 'number',
        },
      ],
    ]);
  });

  it('throws on invalid array schema', () => {
    const schema = ''; // Not a fluent builder
    expect(() => parser.parse(schema)).toThrow('Invalid array schema');
  });
});
