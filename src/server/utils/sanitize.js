/**
 * Sanitization utilities to prevent injection attacks
 * and ensure user inputs are safe for database queries
 */

/**
 * Sanitize a string input by trimming and validating
 * @param {string} input - The input string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string|null} - Sanitized string or null if invalid
 */
const sanitizeString = (input, maxLength = 1000) => {
  if (typeof input !== 'string') {
    return null;
  }
  
  // Trim whitespace
  const trimmed = input.trim();
  
  // Check length
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return null;
  }
  
  // Return sanitized string
  return trimmed;
};

/**
 * Sanitize username - alphanumeric and underscores only
 * @param {string} username - Username to sanitize
 * @returns {string|null} - Sanitized username or null if invalid
 */
const sanitizeUsername = (username) => {
  if (typeof username !== 'string') {
    return null;
  }
  
  const trimmed = username.trim();
  
  // Validate format: only letters, numbers, and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return null;
  }
  
  // Validate length
  if (trimmed.length < 3 || trimmed.length > 30) {
    return null;
  }
  
  return trimmed;
};

/**
 * Sanitize and validate email address
 * @param {string} email - Email to sanitize
 * @returns {string|null} - Sanitized email or null if invalid
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return null;
  }
  
  const trimmed = email.trim().toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  
  // Check length (RFC 5321 limit is 320 characters)
  if (trimmed.length > 320) {
    return null;
  }
  
  return trimmed;
};

module.exports = {
  sanitizeString,
  sanitizeUsername,
  sanitizeEmail,
};

