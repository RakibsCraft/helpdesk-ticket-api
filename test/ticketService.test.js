const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { ValidationError, NotFoundError, ConflictError } = require('../src/errors');
const { makeService, validTicket, START } = require('./helpers');

// Change to true when you start Milestone 4.
const STARTED = false;

const fieldsOf = (err) => err.errors.map((e) => e.field).sort();

describe('Milestone 4: createTicket', { skip: !STARTED && 'Not started' }, () => {
  it('saves a new ticket with defaults filled in', async () => {
    const { service } = makeService();
    const ticket = await service.createTicket({
      title: '  VPN keeps dropping  ',
      description: '  Disconnects every 10 minutes.  ',
      requester: '  Ciaran@Example.COM ',
    });
    assert.deepEqual(ticket, {
      id: 1,
      title: 'VPN keeps dropping',
      description: 'Disconnects every 10 minutes.',
      requester: 'ciaran@example.com',
      priority: 'medium',
      status: 'open',
      assignee: null,
      createdAt: START,
      updatedAt: START,
      resolvedAt: null,
      slaDueAt: '2026-11-08T09:00:00.000Z',
      slaStatus: 'on_track',
    });
  });

  it('gives each ticket a new id', async () => {
    const { service } = makeService();
    const a = await service.createTicket(validTicket());
    const b = await service.createTicket(validTicket());
    assert.notEqual(a.id, b.id);
  });

  it('throws ValidationError with every problem for bad input', async () => {
    const { service } = makeService();
    await assert.rejects(service.createTicket({ title: 'x' }), (err) => {
      assert.ok(err instanceof ValidationError);
      assert.deepEqual(fieldsOf(err), ['description', 'requester', 'title']);
      return true;
    });
  });

  it('does not store slaStatus, because it changes over time', async () => {
    const { service, repository } = makeService();
    const { id } = await service.createTicket(validTicket());
    const stored = await repository.findById(id);
    assert.equal('slaStatus' in stored, false);
  });
});

describe('Milestone 4: getTicket', { skip: !STARTED && 'Not started' }, () => {
  it('returns the ticket with its current slaStatus', async () => {
    const { service, clock } = makeService();
    const { id } = await service.createTicket(validTicket({ priority: 'high' }));
    clock.advanceHours(9);
    const ticket = await service.getTicket(id);
    assert.equal(ticket.id, id);
    assert.equal(ticket.slaStatus, 'breached');
  });

  it('throws NotFoundError for an unknown id', async () => {
    const { service } = makeService();
    await assert.rejects(service.getTicket(999), NotFoundError);
    await assert.rejects(service.getTicket('abc'), NotFoundError);
  });
});

describe('Milestone 4: listTickets', { skip: !STARTED && 'Not started' }, () => {
  async function seed() {
    const ctx = makeService();
    const { service, clock } = ctx;
    await service.createTicket(validTicket({ title: 'Low one', priority: 'low' }));
    clock.advanceHours(1);
    await service.createTicket(validTicket({ title: 'Urgent older', priority: 'urgent' }));
    clock.advanceHours(1);
    await service.createTicket(validTicket({ title: 'Medium one', priority: 'medium' }));
    clock.advanceHours(1);
    await service.createTicket(validTicket({ title: 'Urgent newer', priority: 'urgent' }));
    return ctx;
  }

  it('sorts as a triage queue: priority first, then oldest first', async () => {
    const { service } = await seed();
    const titles = (await service.listTickets()).map((t) => t.title);
    assert.deepEqual(titles, ['Urgent older', 'Urgent newer', 'Medium one', 'Low one']);
  });

  it('includes slaStatus on every ticket', async () => {
    const { service } = await seed();
    for (const t of await service.listTickets()) assert.ok(t.slaStatus);
  });

  it('filters by priority', async () => {
    const { service } = await seed();
    const titles = (await service.listTickets({ priority: 'urgent' })).map((t) => t.title);
    assert.deepEqual(titles, ['Urgent older', 'Urgent newer']);
  });

  it('filters by status and assignee together', async () => {
    const { service } = await seed();
    await service.assignTicket(1, 'niamh');
    await service.assignTicket(2, 'niamh');
    await service.assignTicket(3, 'sean');
    await service.updateStatus(2, 'resolved');
    const result = await service.listTickets({ status: 'in_progress', assignee: 'niamh' });
    assert.deepEqual(result.map((t) => t.id), [1]);
  });

  it('returns an empty array when nothing matches', async () => {
    const { service } = await seed();
    assert.deepEqual(await service.listTickets({ status: 'closed' }), []);
  });

  it('rejects unknown filter values', async () => {
    const { service } = await seed();
    await assert.rejects(service.listTickets({ status: 'pending' }), (err) => {
      assert.ok(err instanceof ValidationError);
      assert.deepEqual(fieldsOf(err), ['status']);
      return true;
    });
    await assert.rejects(service.listTickets({ priority: 'critical' }), ValidationError);
  });
});

describe('Milestone 4: assignTicket', { skip: !STARTED && 'Not started' }, () => {
  it('assigns an open ticket and moves it to in_progress', async () => {
    const { service, clock } = makeService();
    const { id } = await service.createTicket(validTicket());
    clock.advanceHours(1);
    const t = await service.assignTicket(id, '  niamh  ');
    assert.equal(t.assignee, 'niamh');
    assert.equal(t.status, 'in_progress');
    assert.equal(t.updatedAt, '2026-11-07T10:00:00.000Z');
    assert.equal(t.createdAt, START);
  });

  it('can reassign a ticket that is already in progress', async () => {
    const { service } = makeService();
    const { id } = await service.createTicket(validTicket());
    await service.assignTicket(id, 'niamh');
    const t = await service.assignTicket(id, 'sean');
    assert.equal(t.assignee, 'sean');
    assert.equal(t.status, 'in_progress');
  });

  it('does not change the status of a resolved ticket', async () => {
    const { service } = makeService();
    const { id } = await service.createTicket(validTicket());
    await service.assignTicket(id, 'niamh');
    await service.updateStatus(id, 'resolved');
    const t = await service.assignTicket(id, 'sean');
    assert.equal(t.status, 'resolved');
  });

  it('rejects a blank assignee', async () => {
    const { service } = makeService();
    const { id } = await service.createTicket(validTicket());
    for (const assignee of ['', '   ', undefined, 5]) {
      await assert.rejects(service.assignTicket(id, assignee), ValidationError);
    }
  });

  it('throws NotFoundError for an unknown ticket', async () => {
    const { service } = makeService();
    await assert.rejects(service.assignTicket(999, 'niamh'), NotFoundError);
  });

  it('throws ConflictError for a closed ticket', async () => {
    const { service } = makeService();
    const { id } = await service.createTicket(validTicket());
    await service.updateStatus(id, 'closed');
    await assert.rejects(service.assignTicket(id, 'niamh'), ConflictError);
  });
});

describe('Milestone 4: updateStatus', { skip: !STARTED && 'Not started' }, () => {
  it('sets resolvedAt when a ticket is resolved', async () => {
    const { service, clock } = makeService();
    const { id } = await service.createTicket(validTicket({ priority: 'high' }));
    await service.updateStatus(id, 'in_progress');
    clock.advanceHours(3);
    const t = await service.updateStatus(id, 'resolved');
    assert.equal(t.status, 'resolved');
    assert.equal(t.resolvedAt, '2026-11-07T12:00:00.000Z');
    assert.equal(t.updatedAt, '2026-11-07T12:00:00.000Z');
    assert.equal(t.slaStatus, 'met');
  });

  it('clears resolvedAt when a resolved ticket is reopened', async () => {
    const { service } = makeService();
    const { id } = await service.createTicket(validTicket());
    await service.updateStatus(id, 'in_progress');
    await service.updateStatus(id, 'resolved');
    const t = await service.updateStatus(id, 'in_progress');
    assert.equal(t.status, 'in_progress');
    assert.equal(t.resolvedAt, null);
  });

  it('keeps resolvedAt when a resolved ticket is closed', async () => {
    const { service } = makeService();
    const { id } = await service.createTicket(validTicket());
    await service.updateStatus(id, 'in_progress');
    const resolved = await service.updateStatus(id, 'resolved');
    const closed = await service.updateStatus(id, 'closed');
    assert.equal(closed.resolvedAt, resolved.resolvedAt);
  });

  it('throws ValidationError for an unknown status', async () => {
    const { service } = makeService();
    const { id } = await service.createTicket(validTicket());
    await assert.rejects(service.updateStatus(id, 'done'), ValidationError);
  });

  it('throws ConflictError for a move the rules do not allow', async () => {
    const { service } = makeService();
    const { id } = await service.createTicket(validTicket());
    await assert.rejects(service.updateStatus(id, 'resolved'), ConflictError);
    await service.updateStatus(id, 'closed');
    await assert.rejects(service.updateStatus(id, 'open'), ConflictError);
  });

  it('throws NotFoundError for an unknown ticket', async () => {
    const { service } = makeService();
    await assert.rejects(service.updateStatus(999, 'closed'), NotFoundError);
  });
});

describe('Milestone 4: getBreachedTickets and getStats', { skip: !STARTED && 'Not started' }, () => {
  async function seed() {
    const ctx = makeService();
    const { service, clock } = ctx;
    await service.createTicket(validTicket({ title: 'High', priority: 'high' })); // due 17:00
    await service.createTicket(validTicket({ title: 'Urgent', priority: 'urgent' })); // due 13:00
    await service.createTicket(validTicket({ title: 'Low', priority: 'low' })); // due in 3 days
    await service.createTicket(validTicket({ title: 'Urgent fixed late', priority: 'urgent' }));
    await service.updateStatus(4, 'in_progress');
    clock.advanceHours(5);
    await service.updateStatus(4, 'resolved'); // resolved at 14:00, after its 13:00 deadline
    await service.createTicket(validTicket({ title: 'Spam', priority: 'medium' }));
    await service.updateStatus(5, 'closed');
    clock.set('2026-11-07T19:00:00.000Z');
    return ctx;
  }

  it('lists open and in-progress tickets past their deadline, soonest deadline first', async () => {
    const { service } = await seed();
    const titles = (await service.getBreachedTickets()).map((t) => t.title);
    assert.deepEqual(titles, ['Urgent', 'High']);
  });

  it('returns an empty array when nothing is breached', async () => {
    const { service } = makeService();
    await service.createTicket(validTicket());
    assert.deepEqual(await service.getBreachedTickets(), []);
  });

  it('summarises tickets by status and priority', async () => {
    const { service } = await seed();
    assert.deepEqual(await service.getStats(), {
      total: 5,
      byStatus: { open: 3, in_progress: 0, resolved: 1, closed: 1 },
      byPriority: { low: 1, medium: 1, high: 1, urgent: 2 },
      breached: 2,
    });
  });

  it('includes every key with zero counts when there are no tickets', async () => {
    const { service } = makeService();
    assert.deepEqual(await service.getStats(), {
      total: 0,
      byStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      breached: 0,
    });
  });
});
