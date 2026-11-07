const express = require('express');
const { ValidationError, NotFoundError, ConflictError } = require('./errors');
const { createTicketService } = require('./services/ticketService');
const { createTicketsRouter } = require('./routes/tickets');
const { createReportsRouter } = require('./routes/reports');

const systemClock = { now: () => new Date() };

/**
 * Builds the Express app. The repository and clock are passed in so tests can
 * use an in-memory store and a fixed time.
 */
function createApp({ repository, clock = systemClock }) {
  const app = express();
  app.use(express.json());

  const service = createTicketService({ repository, clock });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/tickets', createTicketsRouter(service));
  app.use('/reports', createReportsRouter(service));

  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Turns errors thrown by the service into HTTP responses.
  // Express 5 forwards errors from async route handlers here automatically.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
      return res.status(400).json({ errors: err.errors });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof ConflictError) {
      return res.status(409).json({ error: err.message });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ errors: [{ field: 'body', message: 'Body must be valid JSON' }] });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
