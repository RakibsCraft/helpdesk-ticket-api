/**
 * MILESTONE 2: Ticket status rules.
 *
 * A ticket moves through these statuses:
 *
 *              +-------------------------------+
 *              |                               v
 *   open <--> in_progress --> resolved --> closed
 *    |                    <--  (reopen)
 *    +--> closed  (spam or duplicates can be closed straight away)
 *
 * Allowed moves:
 *   open        -> in_progress, closed
 *   in_progress -> open, resolved
 *   resolved    -> in_progress (reopened), closed
 *   closed      -> nothing. Closed is final.
 *
 * Moving a ticket to the status it already has is NOT allowed.
 * Unknown statuses are never allowed.
 *
 * @param {string} from
 * @param {string} to
 * @returns {boolean}
 */
function canTransition(from, to) {
  throw new Error('Not implemented: canTransition');
}

module.exports = { canTransition };
