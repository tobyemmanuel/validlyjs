import { jest } from '@jest/globals';
import { StringParser } from '../../parsers';
import { UnionParser } from '../../parsers/union-parser';

describe('StringParser', () => {
  let parser: StringParser;
  let unionParser: UnionParser;

  beforeEach(() => {
    parser = new StringParser();
    unionParser = new UnionParser();

    // Set up cross-references like ParserFactory does
    parser.setUnionParser(unionParser);
    unionParser.setStringParser(parser);
  });

  it('parses string rules', () => {
    const schema = 'string|required|min:3|email';
    const result = parser.parse(schema);
    expect(result).toEqual([
      { name: 'required', parameters: [], modifiers: [], isModifier: true },
      { name: 'string', parameters: [], modifiers: [], dataType: 'string' },
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
    const schema = 'number|min:18|max:120';
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
    const schema = 'required|union:(string|min:3;number|positive)';
    const result = parser.parse(schema);
    expect(result).toEqual([
      { name: 'required', parameters: [], modifiers: [], isModifier: true },
      [
        {
          name: 'string',
          parameters: [],
          modifiers: [],
          dataType: 'string',
        },
        {
          name: 'string.min',
          parameters: [3],
          modifiers: [],
          dataType: 'string',
        },
      ],
      [
        {
          name: 'number',
          parameters: [],
          modifiers: [],
          dataType: 'number',
        },
        {
          name: 'number.positive',
          parameters: [],
          modifiers: [],
          dataType: 'number',
        },
      ],
    ]);
  });

  it('throws on invalid string schema', () => {
    const schema = '';
    expect(() => parser.parse(schema)).toThrow('Invalid string schema');
  });
});
