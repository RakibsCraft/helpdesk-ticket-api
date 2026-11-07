// Errors the service layer throws. The error handler in app.js turns each one
// into the right HTTP status code, so your routes don't have to.

class ValidationError extends Error {
  /** @param {{field: string, message: string}[]} errors */
  constructor(errors) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}

module.exports = { ValidationError, NotFoundError, ConflictError };
