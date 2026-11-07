/**
 * MILESTONE 6: Store tickets in PostgreSQL.
 *
 * Implement the same four methods as inMemoryTicketRepository.js, using SQL
 * against the `tickets` table in db/schema.sql.
 *
 *   insert(fields)       -> the saved ticket, with its new id
 *   findById(id)         -> the ticket, or null
 *   findAll()            -> every ticket, ordered by id
 *   update(id, changes)  -> the updated ticket, or null if the id doesn't exist
 *
 * Things to get right:
 *   - Always use parameterised queries ($1, $2, ...). Never build SQL by
 *     joining strings with user input: that's how SQL injection happens.
 *   - The table uses snake_case columns (created_at); the app uses camelCase
 *     (createdAt). Write one helper that converts a database row to a ticket.
 *   - Return dates as ISO strings (row.created_at.toISOString()), and keep
 *     null as null for resolved_at.
 *   - findById with an id that isn't a number should return null, not crash.
 *   - update only receives the fields that changed, e.g. { status, updatedAt }.
 *     Only allow known columns to be updated.
 *
 * Run `npm run test:db` with a database running (see the README) to check your work.
 *
 * @param {import('pg').Pool} pool
 */
function createPostgresTicketRepository(pool) {
  return {
    async insert(fields) {
      throw new Error('Not implemented: insert');
    },

    async findById(id) {
      throw new Error('Not implemented: findById');
    },

    async findAll() {
      throw new Error('Not implemented: findAll');
    },

    async update(id, changes) {
      throw new Error('Not implemented: update');
    },
  };
}

module.exports = { createPostgresTicketRepository };
