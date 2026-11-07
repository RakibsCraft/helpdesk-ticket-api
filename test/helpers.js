const { createApp } = require('../src/app');
const { createInMemoryTicketRepository } = require('../src/repositories/inMemoryTicketRepository');
const { createTicketService } = require('../src/services/ticketService');

const START = '2026-11-07T09:00:00.000Z';

/** A clock the tests control, so SLA results don't depend on when tests run. */
function fixedClock(iso = START) {
  let current = new Date(iso);
  return {
    now: () => new Date(current),
    set(isoString) {
      current = new Date(isoString);
    },
    advanceHours(hours) {
      current = new Date(current.getTime() + hours * 60 * 60 * 1000);
    },
  };
}

function makeService() {
  const clock = fixedClock();
  const repository = createInMemoryTicketRepository();
  const service = createTicketService({ repository, clock });
  return { service, repository, clock };
}

function validTicket(overrides = {}) {
  return {
    title: 'Laptop will not boot',
    description: 'Black screen after last night\'s update.',
    requester: 'aoife@example.com',
    priority: 'high',
    ...overrides,
  };
}

/** Starts the real app on a random free port and returns a small HTTP client. */
async function startTestServer() {
  const clock = fixedClock();
  const app = createApp({ repository: createInMemoryTicketRepository(), clock });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function request(method, path, body) {
    const options = { method, headers: {} };
    if (body !== undefined) {
      options.headers['content-type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const res = await fetch(baseUrl + path, options);
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined };
  }

  return {
    clock,
    request,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

module.exports = { START, fixedClock, makeService, validTicket, startTestServer };
