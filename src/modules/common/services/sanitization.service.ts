import { Injectable } from '@nestjs/common';

@Injectable()
export class SanitizationService {
  /**
   * Sanitizes text content by removing potentially dangerous HTML/script tags
   * @param input - The input string to sanitize
   * @returns Sanitized string
   */
  sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Remove dangerous JavaScript patterns first
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/url\s*\(\s*['"]?\s*javascript:/gi, '')
      // Remove 'expression' keyword only, not the parentheses and content
      .replace(/expression/gi, '')
      // Remove 'eval' keyword only, not the parentheses and content
      .replace(/eval/gi, '')
      // Remove 'setTimeout' keyword only, not the parentheses and content
      .replace(/setTimeout/gi, '')
      // Remove 'setInterval' keyword only, not the parentheses and content
      .replace(/setInterval/gi, '');

    // Remove HTML tags (but preserve content between them)
    sanitized = sanitized
      // Remove entire script, iframe, object, embed, style, head, title, html blocks (including content)
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '')
      // Remove self-closing or unclosed <embed ...> tags
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
      .replace(/<html[^>]*>[\s\S]*?<\/html>/gi, '')
      // Remove only the tags for form, textarea, select, body (preserve content)
      .replace(/<form[^>]*>/gi, '').replace(/<\/form>/gi, '')
      .replace(/<textarea[^>]*>/gi, '').replace(/<\/textarea>/gi, '')
      .replace(/<select[^>]*>/gi, '').replace(/<\/select>/gi, '')
      .replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '')
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
      .replace(/<input[^>]*>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<base[^>]*>/gi, '');

    // Remove ALL remaining HTML tags (generic removal for non-dangerous tags)
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove SQL injection patterns
    sanitized = sanitized
      .replace(/union\s+select/gi, '')
      .replace(/drop\s+table/gi, '')
      .replace(/delete\s+from/gi, '')
      .replace(/insert\s+into/gi, '')
      .replace(/\bupdate\b/gi, '')
      .replace(/\bset\b/gi, '')
      .replace(/alter\s+table/gi, '')
      .replace(/create\s+table/gi, '')
      // Remove EXEC and EXECUTE as standalone words
      .replace(/\bexec\b/gi, '')
      .replace(/\bexecute\b/gi, '');

    // Remove NoSQL injection patterns
    sanitized = sanitized
      .replace(/\$where/gi, '')
      .replace(/\$ne/gi, '')
      .replace(/\$gt/gi, '')
      .replace(/\$lt/gi, '')
      .replace(/\$regex/gi, '')
      .replace(/\$in/gi, '')
      .replace(/\$nin/gi, '');

    // Remove command injection patterns (only the punctuation marks)
    sanitized = sanitized
      .replace(/;/g, ' ') // Remove semicolons
      .replace(/\|/g, ' ') // Remove pipes  
      .replace(/&/g, ' ') // Remove ampersands
      .replace(/`/g, '');

    // Remove command substitution and parameter expansion
    sanitized = sanitized
      .replace(/\$\(/g, '(') // replace $() with ()
      .replace(/\$\{[^}]*\}/g, ' '); // always replace with a space

    // Encode HTML entities (ampersand first)
    sanitized = sanitized
      .replace(/&/g, '&amp;') // Encode ampersands first
      .replace(/</g, '&lt;') // Encode less than
      .replace(/>/g, '&gt;') // Encode greater than
      .replace(/"/g, '&quot;') // Encode double quotes
      .replace(/'/g, '&#x27;'); // Encode single quotes

    // Normalize whitespace and trim
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // If the result is only whitespace, return empty string
    if (sanitized === '') {
      return '';
    }

    return sanitized;
  }

  /**
   * Sanitizes username by removing dangerous characters and ensuring valid format
   * @param username - The username to sanitize
   * @returns Sanitized username
   */
  sanitizeUsername(username: string): string {
    if (!username || typeof username !== 'string') {
      return '';
    }

    // Remove <script> and <style> tags and their content first
    let sanitized = username.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    // Remove any other HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove Windows forbidden characters
    sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '');
    // Keep only allowed characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '');

    // Collapse consecutive dots/underscores/hyphens
    sanitized = sanitized.replace(/\.{2,}/g, '.');
    sanitized = sanitized.replace(/_{2,}/g, '_');
    sanitized = sanitized.replace(/-{2,}/g, '-');

    // Remove leading/trailing dots, underscores, hyphens
    sanitized = sanitized.replace(/^[._-]+/, '');
    sanitized = sanitized.replace(/[._-]+$/, '');

    // Truncate to 20 characters
    if (sanitized.length > 20) {
      sanitized = sanitized.substring(0, 20);
    }
    
    // Always remove trailing invalid characters after truncation
    sanitized = sanitized.replace(/[._-]+$/, '');

    return sanitized.toLowerCase();
  }

  /**
   * Sanitizes display name by removing dangerous content while preserving some formatting
   * @param displayName - The display name to sanitize
   * @returns Sanitized display name
   */
  sanitizeDisplayName(displayName: string): string {
    if (!displayName || typeof displayName !== 'string') {
      return '';
    }

    // Remove HTML and script tags first
    let sanitized = displayName.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove dangerous characters but keep allowed ones
    sanitized = sanitized
      .replace(/[<>:"/\\|?*]/g, '') 
      .replace(/[^\w\s\-_.'(),!?]/g, '') 
      .replace(/\s+/g, ' ') 
      .trim();

    if (sanitized.length > 50) {
      sanitized = sanitized.substring(0, 50);
    }

    return sanitized;
  }

  /**
   * Sanitizes email address by removing dangerous content
   * @param email - The email to sanitize
   * @returns Sanitized email
   */
  sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    // Remove HTML and script tags first
    let sanitized = email.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove dangerous characters but keep email format
    sanitized = sanitized
      .replace(/[<>:"/\\|?*]/g, '') 
      .replace(/[^\w@\-_.]/g, '') 
      .toLowerCase()
      .trim();

    return sanitized;
  }

  /**
   * Sanitizes tweet content by removing dangerous content while preserving some formatting
   * @param content - The tweet content to sanitize
   * @returns Sanitized tweet content
   */
  sanitizeTweetContent(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    // Remove HTML and script tags first
    let sanitized = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove dangerous characters but allow some formatting for tweets
    sanitized = sanitized
      .replace(/[<>:"/\\?]/g, '') // Remove dangerous characters (do not remove * or |)
      .replace(/[^\w\s\-_.'(),!?@#$%^&*+=~`{}\[\]|;:\*\|]/g, '') // Keep alphanumeric, spaces, common punctuation, symbols, asterisk, pipe
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Limit length to 280 characters
    if (sanitized.length > 280) {
      sanitized = sanitized.substring(0, 280);
    }

    return sanitized;
  }

  /**
   * Validates if a string contains potentially dangerous content
   * @param input - The string to validate
   * @returns true if dangerous content is detected, false otherwise
   */
  containsDangerousContent(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const dangerousPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      /update\s+.*\s+set/gi,
      /alter\s+table/gi,
      /create\s+table/gi,
      /\bexec\b/gi,
      /\bexecute\b/gi,
      /\$where/gi,
      /\$ne/gi,
      /\$gt/gi,
      /\$lt/gi,
      /\$regex/gi,
      /\$in/gi,
      /\$nin/gi,
      /`/g,
      /\$\s*\(/g,
      /\$\{/g,
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Special method for full HTML entity encoding (including forward slash)
   * Used only when complete HTML entity encoding is required
   * @param input - The input string to encode
   * @returns String with all HTML entities encoded
   */
  private encodeAllHtmlEntities(input: string): string {
    return input
      .replace(/&/g, '&amp;') // Encode ampersands first
      .replace(/</g, '&lt;') // Encode less than
      .replace(/>/g, '&gt;') // Encode greater than
      .replace(/"/g, '&quot;') // Encode double quotes
      .replace(/'/g, '&#x27;') // Encode single quotes
      .replace(/\//g, '&#x2F;'); // Encode forward slash
  }

  /**
   * Special method for testing HTML entity encoding
   * This method applies full HTML entity encoding to the sanitized text
   * @param input - The input string to sanitize and encode
   * @returns Sanitized string with full HTML entity encoding
   */
  sanitizeTextWithFullEncoding(input: string): string {
    // First sanitize (without entity encoding)
    let sanitized = input;
    if (!sanitized || typeof sanitized !== 'string') {
      return '';
    }

    // Remove dangerous JavaScript patterns first
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/url\s*\(\s*['"]?\s*javascript:/gi, '')
      .replace(/expression/gi, '')
      .replace(/eval/gi, '')
      .replace(/setTimeout/gi, '')
      .replace(/setInterval/gi, '');

    // Remove HTML tags (but preserve content between them)
    sanitized = sanitized
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
      .replace(/<html[^>]*>[\s\S]*?<\/html>/gi, '')
      .replace(/<form[^>]*>/gi, '').replace(/<\/form>/gi, '')
      .replace(/<textarea[^>]*>/gi, '').replace(/<\/textarea>/gi, '')
      .replace(/<select[^>]*>/gi, '').replace(/<\/select>/gi, '')
      .replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '')
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
      .replace(/<input[^>]*>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<base[^>]*>/gi, '');

    // Remove ALL remaining HTML tags (generic removal for non-dangerous tags)
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove SQL injection patterns
    sanitized = sanitized
      .replace(/union\s+select/gi, '')
      .replace(/drop\s+table/gi, '')
      .replace(/delete\s+from/gi, '')
      .replace(/insert\s+into/gi, '')
      .replace(/\bupdate\b/gi, '')
      .replace(/\bset\b/gi, '')
      .replace(/alter\s+table/gi, '')
      .replace(/create\s+table/gi, '')
      .replace(/\bexec\b/gi, '')
      .replace(/\bexecute\b/gi, '');

    // Remove NoSQL injection patterns
    sanitized = sanitized
      .replace(/\$where/gi, '')
      .replace(/\$ne/gi, '')
      .replace(/\$gt/gi, '')
      .replace(/\$lt/gi, '')
      .replace(/\$regex/gi, '')
      .replace(/\$in/gi, '')
      .replace(/\$nin/gi, '');

    // Remove command injection patterns (only the punctuation marks)
    sanitized = sanitized
      .replace(/;/g, ' ')
      .replace(/\|/g, ' ')
      .replace(/&/g, ' ')
      .replace(/`/g, '');

    // Remove command substitution and parameter expansion
    sanitized = sanitized
      .replace(/\$\(/g, '(')
      .replace(/\$\{[^}]*\}/g, ' ');

    // Normalize whitespace and trim
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    if (sanitized === '') {
      return '';
    }

    // Now apply full HTML entity encoding
    return this.encodeAllHtmlEntities(sanitized);
  }
} 