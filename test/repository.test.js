const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { createInMemoryTicketRepository } = require('../src/repositories/inMemoryTicketRepository');

// Change to true when you start Milestone 6. These tests also need a running
// database and DATABASE_URL set: see "Running with PostgreSQL" in the README.
const STARTED = false;

const sample = (overrides = {}) => ({
  title: 'Printer offline',
  description: 'Second floor printer shows offline.',
  requester: 'aoife@example.com',
  priority: 'medium',
  status: 'open',
  assignee: null,
  createdAt: '2026-11-07T09:00:00.000Z',
  updatedAt: '2026-11-07T09:00:00.000Z',
  resolvedAt: null,
  slaDueAt: '2026-11-08T09:00:00.000Z',
  ...overrides,
});

/**
 * The same checks run against both repositories, so the PostgreSQL version
 * must behave exactly like the in-memory one.
 */
function repositoryContract(getRepository) {
  it('insert returns the ticket with a new id', async () => {
    const repo = getRepository();
    const a = await repo.insert(sample());
    const b = await repo.insert(sample({ title: 'Second' }));
    assert.equal(typeof a.id, 'number');
    assert.ok(b.id > a.id);
    assert.deepEqual(a, { ...sample(), id: a.id });
  });

  it('findById returns the ticket with dates as ISO strings', async () => {
    const repo = getRepository();
    const { id } = await repo.insert(sample({ resolvedAt: '2026-11-07T10:30:00.000Z', status: 'resolved' }));
    assert.deepEqual(
      await repo.findById(id),
      { ...sample({ resolvedAt: '2026-11-07T10:30:00.000Z', status: 'resolved' }), id },
    );
  });

  it('findById returns null for unknown or invalid ids', async () => {
    const repo = getRepository();
    assert.equal(await repo.findById(999), null);
    assert.equal(await repo.findById('abc'), null);
  });

  it('findAll returns every ticket ordered by id', async () => {
    const repo = getRepository();
    await repo.insert(sample({ title: 'One' }));
    await repo.insert(sample({ title: 'Two' }));
    await repo.insert(sample({ title: 'Three' }));
    assert.deepEqual((await repo.findAll()).map((t) => t.title), ['One', 'Two', 'Three']);
  });

  it('update changes only the fields given', async () => {
    const repo = getRepository();
    const { id } = await repo.insert(sample());
    const updated = await repo.update(id, {
      status: 'in_progress',
      assignee: 'niamh',
      updatedAt: '2026-11-07T11:00:00.000Z',
    });
    assert.deepEqual(updated, {
      ...sample(),
      id,
      status: 'in_progress',
      assignee: 'niamh',
      updatedAt: '2026-11-07T11:00:00.000Z',
    });
    assert.deepEqual(await repo.findById(id), updated);
  });

  it('update can set a field back to null', async () => {
    const repo = getRepository();
    const { id } = await repo.insert(sample({ status: 'resolved', resolvedAt: '2026-11-07T10:00:00.000Z' }));
    const updated = await repo.update(id, { status: 'in_progress', resolvedAt: null });
    assert.equal(updated.resolvedAt, null);
  });

  it('update returns null for an unknown id', async () => {
    const repo = getRepository();
    assert.equal(await repo.update(999, { status: 'closed' }), null);
  });
}

describe('In-memory repository (provided)', () => {
  let repo;
  beforeEach(() => {
    repo = createInMemoryTicketRepository();
  });
  repositoryContract(() => repo);
});

const dbSkip = !STARTED ? 'Not started' : !process.env.DATABASE_URL ? 'DATABASE_URL not set' : false;

describe('Milestone 6: PostgreSQL repository', { skip: dbSkip }, () => {
  let pool;
  let repo;

  before(async () => {
    const { Pool } = require('pg');
    const { createPostgresTicketRepository } = require('../src/repositories/postgresTicketRepository');
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    repo = createPostgresTicketRepository(pool);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE tickets RESTART IDENTITY');
  });

  after(async () => {
    await pool.end();
  });

  repositoryContract(() => repo);
});
