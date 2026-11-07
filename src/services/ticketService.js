const { PRIORITIES, STATUSES, PRIORITY_RANK } = require('../constants');
const { ValidationError, NotFoundError, ConflictError } = require('../errors');
const { validateNewTicket } = require('../validation/validateTicket');
const { canTransition } = require('./statusTransitions');
const { calculateSlaDueAt, getSlaStatus } = require('./sla');

/**
 * MILESTONE 4: The ticket service.
 *
 * This is where the business rules live. It uses the repository to store
 * tickets and the clock for the current time (call clock.now() and never
 * new Date() directly, so tests can control time).
 *
 * Every ticket this service RETURNS must include an extra `slaStatus` field,
 * worked out with getSlaStatus(ticket, clock.now()). Don't store slaStatus,
 * because it changes as time passes.
 *
 * Throw ValidationError, NotFoundError or ConflictError (from ../errors) when
 * something is wrong. app.js turns these into 400, 404 and 409 responses.
 *
 * @param {{repository: object, clock: {now: () => Date}}} deps
 */
function createTicketService({ repository, clock }) {
  return {
    /**
     * Create a ticket from a request body.
     * - Validate with validateNewTicket. If there are errors, throw ValidationError(errors).
     * - Trim title and description, lowercase and trim requester.
     * - priority defaults to 'medium'.
     * - status 'open', assignee null, resolvedAt null.
     * - createdAt and updatedAt are now, slaDueAt from calculateSlaDueAt. Store all dates as ISO strings.
     */
    async createTicket(input) {
      throw new Error('Not implemented: createTicket');
    },

    /** Return one ticket, or throw NotFoundError if the id doesn't exist. */
    async getTicket(id) {
      throw new Error('Not implemented: getTicket');
    },

    /**
     * Return tickets matching every filter given. filters may contain
     * status, priority and assignee; any of them can be missing.
     * - An unknown status or priority value -> ValidationError with field 'status' or 'priority'.
     * - Sort as a triage queue: most urgent priority first (see PRIORITY_RANK),
     *   then oldest createdAt first.
     */
    async listTickets(filters = {}) {
      throw new Error('Not implemented: listTickets');
    },

    /**
     * Assign a ticket to a person.
     * - assignee must be a non-empty string after trimming -> otherwise ValidationError (field 'assignee').
     * - Ticket must exist -> otherwise NotFoundError.
     * - Closed tickets can't be assigned -> ConflictError.
     * - If the ticket is 'open', assigning it also moves it to 'in_progress'.
     * - Update updatedAt.
     */
    async assignTicket(id, assignee) {
      throw new Error('Not implemented: assignTicket');
    },

    /**
     * Change a ticket's status.
     * - status must be one of STATUSES -> otherwise ValidationError (field 'status').
     * - Ticket must exist -> otherwise NotFoundError.
     * - The move must be allowed by canTransition -> otherwise ConflictError.
     * - Moving to 'resolved' sets resolvedAt to now.
     * - Moving from 'resolved' back to 'in_progress' (reopening) clears resolvedAt to null.
     * - Update updatedAt.
     */
    async updateStatus(id, status) {
      throw new Error('Not implemented: updateStatus');
    },

    /**
     * Return tickets that are still open or in progress AND have breached
     * their SLA, soonest slaDueAt first. These are the tickets a team lead
     * needs to chase.
     */
    async getBreachedTickets() {
      throw new Error('Not implemented: getBreachedTickets');
    },

    /**
     * Return a summary:
     * {
     *   total: 7,
     *   byStatus:   { open: 2, in_progress: 3, resolved: 1, closed: 1 },
     *   byPriority: { low: 1, medium: 4, high: 1, urgent: 1 },
     *   breached: 2     // same count as getBreachedTickets()
     * }
     * Every status and priority key must be present, even when its count is 0.
     */
    async getStats() {
      throw new Error('Not implemented: getStats');
    },
  };
}

module.exports = { createTicketService };
