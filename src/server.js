const { createApp } = require('./app');
const { createInMemoryTicketRepository } = require('./repositories/inMemoryTicketRepository');

const PORT = process.env.PORT || 3000;

function createRepository() {
  if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    const { createPostgresTicketRepository } = require('./repositories/postgresTicketRepository');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    console.log('Using PostgreSQL');
    return createPostgresTicketRepository(pool);
  }
  console.log('DATABASE_URL not set, using in-memory storage (data is lost on restart)');
  return createInMemoryTicketRepository();
}

const app = createApp({ repository: createRepository() });

app.listen(PORT, () => {
  console.log(`Helpdesk API listening on http://localhost:${PORT}`);
});
