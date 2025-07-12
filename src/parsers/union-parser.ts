import { Parser, ParsedRule } from '../types';

export class UnionParser implements Parser {
  priority = 2;
  private stringParser: any = null;

  // Method to set string parser reference
  setStringParser(stringParser: any) {
    this.stringParser = stringParser;
  }

  canParse(input: any): boolean {
    return typeof input === 'string' && input.startsWith('union:');
  }

  parse(input: string): ParsedRule[][] {
    if (!input.startsWith('union:')) {
      throw new Error('Invalid union format: must start with "union:"');
    }
    
    // Remove 'union:' prefix
    const unionContent = input.slice(6);
   
    if (!unionContent.trim()) {
      throw new Error('Empty union content');
    }
    
    let ruleSets: string[];
    try {
      // Check if it uses the new bracket syntax
      if (unionContent.startsWith('(') && unionContent.endsWith(')')) {
        // Extract content inside brackets
        const bracketContent = unionContent.slice(1, -1);
       
        if (!bracketContent.trim()) {
          throw new Error('Empty union brackets');
        }
       
        // Split by semicolon at the top level (respecting nested brackets)
        ruleSets = this.splitByTopLevelDelimiter(bracketContent, ';');
      } else {
        // Fallback to old semicolon-based parsing for backward compatibility
        ruleSets = this.splitByTopLevelDelimiter(unionContent, ';');
      }
    } catch (error: any) {
      throw new Error(`Error parsing union content: ${error.message}`);
    }
    
    // Parse each rule set using the string parser
    const parsedRuleSets: ParsedRule[][] = [];
   
    for (const ruleSet of ruleSets) {
      const trimmedRuleSet = ruleSet.trim();
      if (!trimmedRuleSet) {
        continue; // Skip empty rule sets
      }
     
      try {
        if (!this.stringParser) {
          throw new Error('String parser not available');
        }
        
        const parsed = this.stringParser.parse(trimmedRuleSet);
        parsedRuleSets.push(parsed);
      } catch (error: any) {
        throw new Error(`Error parsing rule set '${trimmedRuleSet}': ${error.message}`);
      }
    }
    
    if (parsedRuleSets.length === 0) {
      throw new Error('No valid rule sets found in union');
    }
    
    return parsedRuleSets;
  }

  private splitByTopLevelDelimiter(content: string, delimiter: string): string[] {
    const parts: string[] = [];
    let current = '';
    let bracketDepth = 0;
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
     
      // Handle quotes
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        current += char;
      } else if (inQuotes) {
        current += char;
      }
      // Handle brackets when not in quotes
      else if (char === '(') {
        bracketDepth++;
        current += char;
      } else if (char === ')') {
        bracketDepth--;
        current += char;
      } else if (char === delimiter && bracketDepth === 0) {
        // This delimiter is at the top level
        const trimmed = current.trim();
        if (trimmed) {
          parts.push(trimmed);
        }
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last part
    const trimmed = current.trim();
    if (trimmed) {
      parts.push(trimmed);
    }
    
    return parts;
  }
}