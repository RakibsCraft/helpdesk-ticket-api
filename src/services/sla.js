const { SLA_HOURS } = require('../constants');

/**
 * MILESTONE 3: SLA (service level agreement) rules.
 *
 * Every ticket must be resolved within a number of hours that depends on its
 * priority (see SLA_HOURS in constants.js: urgent 4, high 8, medium 24, low 72).
 */

/**
 * Returns the deadline for a ticket created at `createdAt`.
 *
 * Example: priority 'high', createdAt 2026-11-07T09:00:00Z -> 2026-11-07T17:00:00Z
 *
 * @param {string} priority
 * @param {Date} createdAt
 * @returns {Date}
 */
function calculateSlaDueAt(priority, createdAt) {
  throw new Error('Not implemented: calculateSlaDueAt');
}

/**
 * Works out where a ticket stands against its SLA at time `now`.
 *
 * Return one of:
 *   'met'            - resolved on or before slaDueAt
 *   'breached'       - resolved after slaDueAt, OR still open/in progress and
 *                      now is after slaDueAt
 *   'at_risk'        - still open/in progress, not yet breached, but less than
 *                      25% of the SLA window is left
 *   'on_track'       - still open/in progress with 25% or more of the window left
 *   'not_applicable' - closed without ever being resolved (resolvedAt is null)
 *
 * Use resolvedAt (not status) to decide whether a ticket was resolved: a ticket
 * that was resolved and then closed still has resolvedAt set.
 *
 * Dates on the ticket are ISO strings, so convert them with new Date(...).
 *
 * @param {{status: string, createdAt: string, slaDueAt: string, resolvedAt: string|null}} ticket
 * @param {Date} now
 * @returns {'met'|'breached'|'at_risk'|'on_track'|'not_applicable'}
 */
function getSlaStatus(ticket, now) {
  throw new Error('Not implemented: getSlaStatus');
}

module.exports = { calculateSlaDueAt, getSlaStatus };
