import { jest } from '@jest/globals';
import { FluentParser } from '../../parsers';
import { union, number, string, object } from '../../fluent';
import { FluentRule } from '../../types';

describe('FluentParser', () => {
  let parser: FluentParser;

  beforeEach(() => {
    parser = new FluentParser();
  });

  it('parses string rules', () => {
    const schema = string().required().min(3).email();
    const result = parser.parse(schema);
    expect(result).toEqual([
      { name: 'string', parameters: [], modifiers: [], dataType: 'string' },
      { name: 'required', parameters: [], modifiers: [], isModifier: true },
      { name: 'string.min', parameters: [3], modifiers: [], dataType: 'string' },
      { name: 'string.email', parameters: [], modifiers: [], dataType: 'string' }
    ]);
  });

  it('parses number rules', () => {
    const schema = number().min(18).max(120);
    const result = parser.parse(schema);
    expect(result).toEqual([
      { name: 'number', parameters: [], modifiers: [], dataType: 'number' },
      { name: 'number.min', parameters: [18], modifiers: [], dataType: 'number' },
      { name: 'number.max', parameters: [120], modifiers: [], dataType: 'number' }
    ]);
  });

  it('parses union types', () => {
    const schema = union()
      .add(string().email())
      .add(number().positive());
    const result = parser.parse(schema);
    expect(result).toEqual([
      [
        { name: 'string', parameters: [], modifiers: [], dataType: 'string' },
        { name: 'string.email', parameters: [], modifiers: [], dataType: 'string' }
      ],
      [
        { name: 'number', parameters: [], modifiers: [], dataType: 'number' },
        { name: 'number.positive', parameters: [], modifiers: [], dataType: 'number' }
      ]
    ]);
  });

  it('handles nested objects', () => {
    const schema = object().shape({
      profile: object().shape({
        name: string().required()
      })
    });
    const result = parser.parse(schema);

    expect(result).toEqual([
      { name: 'object', parameters: [], modifiers: [], dataType: 'object' },
      { 
        name: 'object.shape', 
        parameters: [{
          profile: {
            _type: 'fluent',
            _dataType: 'object',
            _rules: [{
              name: 'object.shape',
              parameters: [{
                name: {
                  _type: 'fluent',
                  _dataType: 'string',
                  _rules: [],
                  _modifiers: [{ type: 'required' }]
                }
              }],
              async: false,
              dependencies: [],
              validator: expect.any(Function)
            }],
            _modifiers: []
          }
        }], 
        modifiers: [], 
        dataType: 'object' 
      }
    ]);
  });

  it('throws on invalid fluent schema', () => {
    const schema = 'invalid' as unknown as FluentRule; // Not a fluent builder
    expect(() => parser.parse(schema)).toThrow('Invalid fluent schema');
  });
});
