const express = require('express');

/**
 * MILESTONE 5b: Report routes.
 *
 * Endpoints (relative to /reports):
 *
 *   GET /sla-breaches   -> 200 with service.getBreachedTickets()
 *   GET /stats          -> 200 with service.getStats()
 *
 * @param {ReturnType<import('../services/ticketService').createTicketService>} service
 */
function createReportsRouter(service) {
  const router = express.Router();

  // TODO: add the routes listed above.

  return router;
}

module.exports = { createReportsRouter };
