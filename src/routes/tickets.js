const express = require('express');

/**
 * MILESTONE 5a: Ticket routes.
 *
 * Keep routes thin: read from the request, call the service, send the result.
 * You don't need try/catch: Express 5 passes errors thrown in async handlers
 * to the error handler in app.js, which sends the right status code.
 *
 * Endpoints (all paths are relative to /tickets):
 *
 *   POST  /               body: { title, description, requester, priority? }
 *                         -> 201 with the created ticket
 *   GET   /               query: ?status=&priority=&assignee=  (all optional)
 *                         -> 200 with an array of tickets
 *   GET   /:id            -> 200 with the ticket
 *   PATCH /:id/assign     body: { assignee }  -> 200 with the updated ticket
 *   PATCH /:id/status     body: { status }    -> 200 with the updated ticket
 *
 * Tip: in Express 5, req.body is undefined when no JSON body was sent,
 * so use (req.body ?? {}) before reading fields from it.
 *
 * @param {ReturnType<import('../services/ticketService').createTicketService>} service
 */
function createTicketsRouter(service) {
  const router = express.Router();

  // TODO: add the routes listed above.

  return router;
}

module.exports = { createTicketsRouter };
