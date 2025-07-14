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
      // Remove expression(...)
      .replace(/expression\s*\([^)]*\)/gi, '')
      // Remove eval(...)
      .replace(/eval\s*\([^)]*\)/gi, '')
      // Remove setTimeout(...)
      .replace(/setTimeout\s*\([^)]*\)/gi, '')
      // Remove setInterval(...)
      .replace(/setInterval\s*\([^)]*\)/gi, '');

    // Remove SQL injection patterns
    sanitized = sanitized
      .replace(/union\s+select/gi, '')
      .replace(/drop\s+table/gi, '')
      .replace(/delete\s+from/gi, '')
      .replace(/insert\s+into/gi, '')
      .replace(/update\s+set/gi, '')
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

    // Remove command injection patterns (all, not just trailing)
    sanitized = sanitized
      .replace(/[;|&]/g, '')
      .replace(/`/g, '')
      .replace(/\$\s*\(/g, '')
      .replace(/\$\{/g, '');

    // Remove command substitution and parameter expansion
    sanitized = sanitized
      .replace(/\$\([^)]*\)/g, '(...)') // replace $() with (...)
      .replace(/\$\{[^}]*\}/g, ''); // remove ${...}

    // Remove HTML tags (but preserve content between them)
    sanitized = sanitized
      // Remove entire script, iframe, object, embed, style, head, title, html blocks (including content)
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
      .replace(/<html[^>]*>[\s\S]*?<\/html>/gi, '')
      // Remove <button> and its content
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
      // Remove only the opening and closing tags for form, textarea, select, base, body
      .replace(/<form[^>]*>/gi, '')
      .replace(/<\/form>/gi, '')
      .replace(/<textarea[^>]*>/gi, '')
      .replace(/<\/textarea>/gi, '')
      .replace(/<select[^>]*>/gi, '')
      .replace(/<\/select>/gi, '')
      .replace(/<base[^>]*>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      // Remove self-closing and single tags
      .replace(/<input[^>]*>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      // Remove any remaining HTML tags (stricter: <tag ...> or </tag>)
      .replace(/<\/?[a-zA-Z][^>]*>/g, '');

    // Encode HTML entities (ampersand first)
    sanitized = sanitized
      .replace(/&/g, '&amp;') // Encode ampersands first
      .replace(/</g, '&lt;') // Encode less than
      .replace(/>/g, '&gt;') // Encode greater than
      .replace(/"/g, '&quot;') // Encode double quotes
      .replace(/'/g, '&#x27;') // Encode single quotes
      .replace(/\//g, '&#x2F;'); // Encode forward slash

    // Normalize whitespace and trim
    sanitized = sanitized
      .replace(/\s+/g, ' ')
      .trim();

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

    // Remove HTML and script tags first
    let sanitized = this.sanitizeText(username);

    // Remove dangerous characters for usernames (before HTML encoding)
    sanitized = sanitized
      .replace(/[<>:"/\\|?*]/g, '') // Remove Windows forbidden characters
      .replace(/[^\w\-_.]/g, '') // Keep only alphanumeric, hyphens, underscores, and dots
      .replace(/^[._-]+/, '') // Remove leading dots, underscores, hyphens
      .replace(/[._-]+$/, '') // Remove trailing dots, underscores, hyphens
      .replace(/\.{2,}/g, '.') // Replace multiple consecutive dots with single dot
      .replace(/_{2,}/g, '_') // Replace multiple consecutive underscores with single underscore
      .replace(/-{2,}/g, '-'); // Replace multiple consecutive hyphens with single hyphen

    // Limit length
    if (sanitized.length > 20) {
      sanitized = sanitized.substring(0, 20);
    }

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

    let sanitized = this.sanitizeText(displayName);

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
    let sanitized = this.sanitizeText(email);

    // Remove dangerous characters but keep email format (before HTML encoding)
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
    let sanitized = this.sanitizeText(content);

    // Remove dangerous characters but allow some formatting for tweets (before HTML encoding)
    sanitized = sanitized
      .replace(/[<>:"/\\|?*]/g, '') // Remove dangerous characters
      .replace(/[^\w\s\-_.'(),!?@#$%^&*+=~`{}[\]|;:]/g, '') // Keep alphanumeric, spaces, common punctuation, symbols
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
      /update\s+set/gi,
      /alter\s+table/gi,
      /create\s+table/gi,
      /exec\s*\(/gi,
      /execute\s*\(/gi,
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
} 