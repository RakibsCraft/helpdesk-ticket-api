const { PRIORITIES } = require('../constants');

/**
 * MILESTONE 1: Validate a new ticket.
 *
 * Check the raw request body for a new ticket and return a list of problems.
 * Return an empty array if the input is valid.
 *
 * Each problem is an object: { field: 'title', message: 'Title is required' }.
 * The tests only check the `field` values, so write messages a person
 * using the API would understand.
 *
 * Rules:
 *   - input itself must be an object (not null, not an array). If it isn't,
 *     return a single error with field 'body'.
 *   - title:       required string, 3 to 100 characters after trimming spaces
 *   - description: required string, 1 to 2000 characters after trimming
 *   - requester:   required string that looks like an email address
 *                  (something@something.something, no spaces)
 *   - priority:    optional. If present, must be one of PRIORITIES.
 *
 * Report every problem at once, not only the first one.
 *
 * @param {unknown} input
 * @returns {{field: string, message: string}[]}
 */
function validateNewTicket(input) {
  throw new Error('Not implemented: validateNewTicket');
}

module.exports = { validateNewTicket };
