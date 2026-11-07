/**
 * Stores tickets in memory. Used by the tests, and by the server when no
 * DATABASE_URL is set.
 *
 * Every repository (this one and the PostgreSQL one you'll write) has the same
 * four async methods, so the service doesn't care which one it's given:
 *
 *   insert(fields)       -> the saved ticket, with a new numeric id
 *   findById(id)         -> the ticket, or null
 *   findAll()            -> every ticket, ordered by id
 *   update(id, changes)  -> the updated ticket, or null if the id doesn't exist
 *
 * A ticket looks like:
 * {
 *   id: 1,
 *   title: 'Laptop will not boot',
 *   description: '...',
 *   requester: 'aoife@example.com',
 *   priority: 'high',
 *   status: 'open',
 *   assignee: null,
 *   createdAt: '2026-11-07T09:00:00.000Z',   // ISO strings for all dates
 *   updatedAt: '2026-11-07T09:00:00.000Z',
 *   resolvedAt: null,
 *   slaDueAt: '2026-11-07T17:00:00.000Z'
 * }
 */
function createInMemoryTicketRepository() {
  const tickets = new Map();
  let nextId = 1;

  const copy = (t) => (t ? { ...t } : null);

  return {
    async insert(fields) {
      const ticket = { ...fields, id: nextId++ };
      tickets.set(ticket.id, ticket);
      return copy(ticket);
    },

    async findById(id) {
      return copy(tickets.get(Number(id)));
    },

    async findAll() {
      return [...tickets.values()].sort((a, b) => a.id - b.id).map(copy);
    },

    async update(id, changes) {
      const existing = tickets.get(Number(id));
      if (!existing) return null;
      const updated = { ...existing, ...changes, id: existing.id };
      tickets.set(existing.id, updated);
      return copy(updated);
    },
  };
}

module.exports = { createInMemoryTicketRepository };
