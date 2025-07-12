import { Parser, RuleDefinition } from '../types';
import { StringParser } from './string-parser';
import { ArrayParser } from './array-parser';
import { FluentParser } from './fluent-parser';
// import { WildcardParser } from './wildcard-parser';
// import { DotNotationParser } from './dot-notation-parser';
import { UnionParser } from './union-parser';

export class ParserFactory {
  private static parsers: Parser[] = [];
  private static initialized = false;
  
  private static initializeParsers(): void {
    if (this.initialized) return;
    
    // Create parser instances
    const fluentParser = new FluentParser();
    const stringParser = new StringParser();
    const unionParser = new UnionParser();
    const arrayParser = new ArrayParser();
    // const wildcardParser = new WildcardParser();
    // const dotNotationParser = new DotNotationParser();
    
    // Set up cross-references between StringParser and UnionParser
    stringParser.setUnionParser(unionParser);
    unionParser.setStringParser(stringParser);
    
    // Pre-sort parsers by priority (highest first)
    // Using direct assignment with pre-sorted array for better performance
    this.parsers = [
      fluentParser,     // priority 3
      stringParser,     // priority 2
      unionParser,      // priority 2
      arrayParser,      // priority 2
      // wildcardParser,   // priority 1
      // dotNotationParser // priority 1
    ];
    
    this.initialized = true;
  }
  
  static getParser(input: RuleDefinition): Parser {
    // Initialize parsers if not already done
    this.initializeParsers();
    
    // Use traditional for loop for better performance
    const parsers = this.parsers as Parser<RuleDefinition>[];
    for (let i = 0; i < parsers.length; i++) {
      if (parsers[i]?.canParse(input)) {
        return parsers[i]!;
      }
    }
    
    throw new Error('No suitable parser found for input');
  }
  
  static addParser(parser: Parser): void {
    // Initialize parsers if not already done
    this.initializeParsers();
    
    // Find the correct position to insert based on priority
    const priority = parser.priority;
    const parsers = this.parsers;
    let insertIndex = parsers.length;
    
    // Find insertion point (parsers are sorted by priority desc)
    for (let i = 0; i < parsers.length; i++) {
      if (parsers[i]!.priority < priority) {
        insertIndex = i;
        break;
      }
    }
    
    // Insert at the correct position
    parsers.splice(insertIndex, 0, parser);
  }
  
  // Method to get all parsers (useful for testing or debugging)
  static getAllParsers(): Parser[] {
    this.initializeParsers();
    // Return a shallow copy to prevent external modification
    return this.parsers.slice();
  }
  
  // Method to reset parsers (useful for testing)
  static reset(): void {
    this.parsers = [];
    this.initialized = false;
  }
}