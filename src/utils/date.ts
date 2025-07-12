// Pre-compiled regex patterns for better performance
const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/;
const TIME_ONLY_REGEX = /^((\d{1,2}:\d{2}(:\d{2})?)|(\d{1,2}:\d{2}(:\d{2})? ?([aA][mM]|[pP][mM])))$/;

// Pre-calculated days in month (non-leap year)
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Ultra-fast leap year check (bitwise operations)
const isLeapYear = (year: number): boolean => Boolean(!(year & 3)) && Boolean(year % 100 || !(year % 400));

// Ultra-fast time parsing with minimal string operations
const parseTimeUltraFast = (timeStr: string): { hours: number; minutes: number; seconds: number } | null => {
  const len = timeStr.length;
  let hours = 0, minutes = 0, seconds = 0;
  
  // Check for AM/PM by looking at last 2 chars
  const hasAmPm = len >= 2 && (timeStr[len - 2] === 'A' || timeStr[len - 2] === 'P' || 
                               timeStr[len - 2] === 'a' || timeStr[len - 2] === 'p');
  
  if (hasAmPm) {
    // Extract period without string operations
    const isPm = timeStr[len - 2] === 'P' || timeStr[len - 2] === 'p';
    
    // Find where time part ends (before space or AM/PM)
    let timeEnd = len - 2;
    if (timeStr[timeEnd - 1] === ' ') timeEnd--;
    
    // Parse time part
    let colonPos1 = -1, colonPos2 = -1;
    for (let i = 0; i < timeEnd; i++) {
      if (timeStr[i] === ':') {
        if (colonPos1 === -1) colonPos1 = i;
        else { colonPos2 = i; break; }
      }
    }
    
    if (colonPos1 === -1) return null;
    
    // Parse hours
    for (let i = 0; i < colonPos1; i++) {
      const digit = timeStr.charCodeAt(i) - 48;
      if (digit < 0 || digit > 9) return null;
      hours = hours * 10 + digit;
    }
    
    // Parse minutes
    for (let i = colonPos1 + 1; i < (colonPos2 === -1 ? timeEnd : colonPos2); i++) {
      const digit = timeStr.charCodeAt(i) - 48;
      if (digit < 0 || digit > 9) return null;
      minutes = minutes * 10 + digit;
    }
    
    // Parse seconds if present
    if (colonPos2 !== -1) {
      for (let i = colonPos2 + 1; i < timeEnd; i++) {
        const digit = timeStr.charCodeAt(i) - 48;
        if (digit < 0 || digit > 9) return null;
        seconds = seconds * 10 + digit;
      }
    }
    
    // Validate 12-hour format
    if (hours < 1 || hours > 12 || minutes > 59 || seconds > 59) return null;
    
    // Convert to 24-hour
    if (isPm && hours < 12) hours += 12;
    else if (!isPm && hours === 12) hours = 0;
  } else {
    // 24-hour format - parse directly
    let colonPos1 = -1, colonPos2 = -1;
    for (let i = 0; i < len; i++) {
      if (timeStr[i] === ':') {
        if (colonPos1 === -1) colonPos1 = i;
        else { colonPos2 = i; break; }
      }
    }
    
    if (colonPos1 === -1) return null;
    
    // Parse hours
    for (let i = 0; i < colonPos1; i++) {
      const digit = timeStr.charCodeAt(i) - 48;
      if (digit < 0 || digit > 9) return null;
      hours = hours * 10 + digit;
    }
    
    // Parse minutes
    for (let i = colonPos1 + 1; i < (colonPos2 === -1 ? len : colonPos2); i++) {
      const digit = timeStr.charCodeAt(i) - 48;
      if (digit < 0 || digit > 9) return null;
      minutes = minutes * 10 + digit;
    }
    
    // Parse seconds if present
    if (colonPos2 !== -1) {
      for (let i = colonPos2 + 1; i < len; i++) {
        const digit = timeStr.charCodeAt(i) - 48;
        if (digit < 0 || digit > 9) return null;
        seconds = seconds * 10 + digit;
      }
    }
    
    // Validate 24-hour format
    if (hours > 23 || minutes > 59 || seconds > 59) return null;
  }
  
  return { hours, minutes, seconds };
};

export function parseDateString(value: string): Date | string | null {
  if (typeof value !== 'string') return null;
  
  // Handle relative dates first
  const lowerValue = value.toLowerCase().trim();
  const now = new Date();
  
  switch (lowerValue) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    case 'tomorrow':
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    
    case 'yesterday':
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    
    case 'now':
      return new Date();
    
    // Handle relative days like "+1 day", "-2 days", etc.
    default:
      const relativeMatch = lowerValue.match(/^([+-]?\d+)\s*(day|days|week|weeks|month|months|year|years)$/);
      if (relativeMatch) {
        const amount = parseInt(relativeMatch[1] as string);
        const unit = relativeMatch[2];
        const result = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (unit) {
          case 'day':
          case 'days':
            result.setDate(result.getDate() + amount);
            break;
          case 'week':
          case 'weeks':
            result.setDate(result.getDate() + (amount * 7));
            break;
          case 'month':
          case 'months':
            result.setMonth(result.getMonth() + amount);
            break;
          case 'year':
          case 'years':
            result.setFullYear(result.getFullYear() + amount);
            break;
        }
        return result;
      }
      break;
  }
  
  const len = value.length;
  
  // Handle ISO 8601 - ultra-fast path with char-by-char validation
  if (len >= 19 && value[4] === '-' && value[7] === '-' && value[10] === 'T' && value[len - 1] === 'Z') {
    // Quick validation before regex
    let isValid = true;
    for (let i = 0; i < 4; i++) {
      if (value.charCodeAt(i) < 48 || value.charCodeAt(i) > 57) { isValid = false; break; }
    }
    if (isValid && ISO_REGEX.test(value)) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
  }
  
  // Check if time-only format - use regex only if it looks like time
  if (len >= 4 && len <= 11 && value.indexOf(':') !== -1) {
    if (TIME_ONLY_REGEX.test(value)) {
      const timeResult = parseTimeUltraFast(value);
      return timeResult ? value : null;
    }
  }
  
  // Handle date with optional time - ultra-fast parsing
  let spaceIndex = -1;
  for (let i = 0; i < len; i++) {
    if (value[i] === ' ') {
      spaceIndex = i;
      break;
    }
  }
  
  const datePart = spaceIndex === -1 ? value : value.substring(0, spaceIndex);
  const timePart = spaceIndex === -1 ? null : value.substring(spaceIndex + 1);
  
  // Find separators and determine format
  let sep1 = -1, sep2 = -1;
  let separator = '';
  
  for (let i = 0; i < datePart.length; i++) {
    if (datePart[i] === '/' || datePart[i] === '-') {
      if (sep1 === -1) {
        sep1 = i;
        separator = datePart[i] as string;
      } else if (datePart[i] === separator) {
        sep2 = i;
        break;
      }
    }
  }
  
  if (sep1 === -1 || sep2 === -1) return null;
  
  // Parse date components manually for maximum speed
  let day = 0, month = 0, year = 0;
  
  // Parse first part
  let firstPart = 0;
  for (let i = 0; i < sep1; i++) {
    const digit = datePart.charCodeAt(i) - 48;
    if (digit < 0 || digit > 9) return null;
    firstPart = firstPart * 10 + digit;
  }
  
  // Parse second part
  let secondPart = 0;
  for (let i = sep1 + 1; i < sep2; i++) {
    const digit = datePart.charCodeAt(i) - 48;
    if (digit < 0 || digit > 9) return null;
    secondPart = secondPart * 10 + digit;
  }
  
  // Parse third part
  let thirdPart = 0;
  for (let i = sep2 + 1; i < datePart.length; i++) {
    const digit = datePart.charCodeAt(i) - 48;
    if (digit < 0 || digit > 9) return null;
    thirdPart = thirdPart * 10 + digit;
  }
  
  // Determine format based on first part length and value
  if (sep1 === 4 && firstPart > 1900) {
    // YYYY-MM-DD format
    year = firstPart;
    month = secondPart;
    day = thirdPart;
  } else {
    // DD/MM/YYYY or DD-MM-YYYY format
    day = firstPart;
    month = secondPart;
    year = thirdPart;
  }
  
  // Ultra-fast validation
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1) return null;
  
  // Validate days in month
  const maxDays = month === 2 && isLeapYear(year) ? 29 : (DAYS_IN_MONTH[month - 1]) as number;
  if (day > maxDays) return null;
  
  let hours = 0, minutes = 0, seconds = 0;
  
  if (timePart) {
    const timeResult = parseTimeUltraFast(timePart);
    if (!timeResult) return null;
    ({ hours, minutes, seconds } = timeResult);
  }
  
  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
  return isNaN(date.getTime()) ? null : date;
}