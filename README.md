# Helpdesk ticket API

![Tests](https://github.com/RakibsCraft/helpdesk-ticket-api/actions/workflows/tests.yml/badge.svg)

A REST API for an IT helpdesk. Users raise tickets, agents pick them up and work them through to resolution, and team leads see which tickets have missed their SLA.

I worked in technical support at Tesco Mobile and Infosys BPM, raising and tracking tickets in Zendesk against SLA and quality targets. This project builds the backend side of that workflow.

**Stack:** Node.js, Express 5, PostgreSQL, node:test, GitHub Actions

## Features

- Create tickets with input validation that reports every problem at once
- A status lifecycle with enforced rules: `open`, `in_progress`, `resolved`, `closed`
- SLA deadlines by priority (urgent 4h, high 8h, medium 24h, low 72h), with live status: `on_track`, `at_risk`, `breached`, `met`
- A triage queue sorted by priority, then age
- Filtering by status, priority and assignee
- Reports on SLA breaches and ticket counts
- Swappable storage: in-memory for development and tests, PostgreSQL for real use

## Progress

| Milestone | File | Tests | Status |
|---|---|---|---|
| 1. Input validation | `src/validation/validateTicket.js` | `test/validation.test.js` | Not started |
| 2. Status rules | `src/services/statusTransitions.js` | `test/statusTransitions.test.js` | Not started |
| 3. SLA calculation | `src/services/sla.js` | `test/sla.test.js` | Not started |
| 4. Ticket service | `src/services/ticketService.js` | `test/ticketService.test.js` | Not started |
| 5. HTTP routes | `src/routes/tickets.js`, `src/routes/reports.js` | `test/api.test.js` | Not started |
| 6. PostgreSQL storage | `src/repositories/postgresTicketRepository.js` | `test/repository.test.js` | Not started |

## API

| Method | Path | Body | Success |
|---|---|---|---|
| `POST` | `/tickets` | `{ title, description, requester, priority? }` | `201` with the ticket |
| `GET` | `/tickets?status=&priority=&assignee=` | | `200` with a list |
| `GET` | `/tickets/:id` | | `200` with the ticket |
| `PATCH` | `/tickets/:id/assign` | `{ assignee }` | `200` with the ticket |
| `PATCH` | `/tickets/:id/status` | `{ status }` | `200` with the ticket |
| `GET` | `/reports/sla-breaches` | | `200` with overdue tickets |
| `GET` | `/reports/stats` | | `200` with counts |
| `GET` | `/health` | | `200` |

Errors use standard status codes: `400` for invalid input (with an `errors` list naming each field), `404` for unknown tickets, and `409` for actions the ticket's state doesn't allow, such as resolving a ticket nobody has started.

Example ticket:

```json
{
  "id": 1,
  "title": "Laptop will not boot",
  "description": "Black screen after last night's update.",
  "requester": "aoife@example.com",
  "priority": "high",
  "status": "in_progress",
  "assignee": "niamh",
  "createdAt": "2026-11-07T09:00:00.000Z",
  "updatedAt": "2026-11-07T09:20:00.000Z",
  "resolvedAt": null,
  "slaDueAt": "2026-11-07T17:00:00.000Z",
  "slaStatus": "on_track"
}
```

## Project structure

```
src/
  app.js                  Express app setup and error handling
  server.js               Starts the server
  constants.js            Priorities, statuses, SLA hours
  errors.js               ValidationError, NotFoundError, ConflictError
  validation/             Input validation
  services/               Business rules: status, SLA, ticket service
  routes/                 HTTP endpoints
  repositories/           Storage: in-memory and PostgreSQL
db/schema.sql             PostgreSQL table definition
test/                     Tests for each layer
```

The layers only talk in one direction: routes call the service, the service calls the repository. The service gets its repository and clock passed in, so tests can use in-memory storage and a fixed time.

## Running it

You need Node.js 22 or later.

```bash
npm install
npm start          # http://localhost:3000, in-memory storage
npm run dev        # same, restarts when files change
npm test           # run the tests
```

Try it with curl:

```bash
curl -X POST http://localhost:3000/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"VPN keeps dropping","description":"Disconnects every 10 minutes.","requester":"ciaran@example.com","priority":"high"}'

curl http://localhost:3000/tickets
```

## Running with PostgreSQL

1. Start a database. With Docker: `docker compose up -d`. This creates the `tickets` table for you.
2. Copy `.env.example` to `.env` and uncomment the `DATABASE_URL` line.
3. `npm start` now stores tickets in PostgreSQL, and `npm run test:db` runs the database tests.

Without Docker, install PostgreSQL, create a database, run `db/schema.sql` against it, and point `DATABASE_URL` at it.

## Testing

Tests use Node's built-in test runner, so there's no extra test framework to install. Each milestone's test file has a `STARTED` switch at the top; tests for milestones not yet started are skipped. GitHub Actions runs every test, including the PostgreSQL ones against a real database, on each push.
