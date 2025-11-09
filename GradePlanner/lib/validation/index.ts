// lib/validation/index.ts - Validation utilities

/**
 * Validate Canvas URL format
 */
export function validateCanvasUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  try {
    const parsed = new URL(url);
    // Must be HTTPS and contain 'instructure.com' (Canvas domain)
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname.includes("instructure.com") ||
        parsed.hostname.includes("canvas"))
    );
  } catch {
    return false;
  }
}

/**
 * Validate Canvas access token format
 */
export function validateToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;

  // Canvas tokens are typically alphanumeric with ~ separator
  // Format: {user_id}~{random_string}
  const tokenPattern = /^\d+~[A-Za-z0-9]+$/;
  return tokenPattern.test(token) && token.length > 10;
}

/**
 * Validate category data
 */
export interface Category {
  name: string;
  weight: number;
  items?: any[];
}

export function validateCategory(category: Category): string[] {
  const errors: string[] = [];

  if (!category.name || category.name.trim().length === 0) {
    errors.push("Category name is required");
  }

  if (category.name && category.name.length > 100) {
    errors.push("Category name is too long (max 100 characters)");
  }

  if (typeof category.weight !== "number") {
    errors.push("Category weight must be a number");
  } else {
    if (category.weight < 0) {
      errors.push("Category weight cannot be negative");
    }
    if (category.weight > 100) {
      errors.push("Category weight cannot exceed 100%");
    }
  }

  return errors;
}

/**
 * Validate assignment data
 */
export interface Assignment {
  name: string;
  score: number | null;
  maxScore: number;
}

export function validateAssignment(assignment: Assignment): string[] {
  const errors: string[] = [];

  if (!assignment.name || assignment.name.trim().length === 0) {
    errors.push("Assignment name is required");
  }

  if (typeof assignment.maxScore !== "number" || assignment.maxScore <= 0) {
    errors.push("Maximum score must be a positive number");
  }

  if (assignment.score !== null) {
    if (typeof assignment.score !== "number") {
      errors.push("Score must be a number");
    } else {
      if (assignment.score < 0) {
        errors.push("Score cannot be negative");
      }
      if (assignment.score > 100) {
        errors.push("Score cannot exceed 100%");
      }
    }
  }

  return errors;
}

/**
 * Validate total weights equal 100%
 */
export function validateTotalWeight(categories: Category[]): {
  valid: boolean;
  total: number;
  error?: string;
} {
  const total = categories.reduce((sum, cat) => sum + cat.weight, 0);
  const valid = Math.abs(total - 100) < 0.01; // Allow small floating point errors

  return {
    valid,
    total,
    error: valid
      ? undefined
      : `Total weight is ${total.toFixed(1)}%, must equal 100%`,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
