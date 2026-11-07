const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, validTicket } = require('./helpers');

// Change to true when you start Milestone 5.
const STARTED = false;

describe('Milestone 5: HTTP API', { skip: !STARTED && 'Not started' }, () => {
  let api;

  beforeEach(async () => {
    api = await startTestServer();
  });

  afterEach(async () => {
    await api.close();
  });

  describe('POST /tickets', () => {
    it('creates a ticket and returns 201', async () => {
      const res = await api.request('POST', '/tickets', validTicket());
      assert.equal(res.status, 201);
      assert.equal(res.body.id, 1);
      assert.equal(res.body.status, 'open');
      assert.equal(res.body.slaStatus, 'on_track');
    });

    it('returns 400 with the list of problems for bad input', async () => {
      const res = await api.request('POST', '/tickets', { title: 'x', requester: 'nope' });
      assert.equal(res.status, 400);
      assert.deepEqual(res.body.errors.map((e) => e.field).sort(), ['description', 'requester', 'title']);
    });

    it('returns 400 when no body is sent', async () => {
      const res = await api.request('POST', '/tickets');
      assert.equal(res.status, 400);
    });
  });

  describe('GET /tickets', () => {
    it('lists tickets', async () => {
      await api.request('POST', '/tickets', validTicket({ priority: 'low' }));
      await api.request('POST', '/tickets', validTicket({ priority: 'urgent' }));
      const res = await api.request('GET', '/tickets');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.map((t) => t.priority), ['urgent', 'low']);
    });

    it('filters with query parameters', async () => {
      await api.request('POST', '/tickets', validTicket({ priority: 'low' }));
      await api.request('POST', '/tickets', validTicket({ priority: 'urgent' }));
      await api.request('PATCH', '/tickets/1/assign', { assignee: 'niamh' });
      const res = await api.request('GET', '/tickets?status=in_progress&assignee=niamh');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.map((t) => t.id), [1]);
    });

    it('returns 400 for an unknown filter value', async () => {
      const res = await api.request('GET', '/tickets?status=pending');
      assert.equal(res.status, 400);
    });
  });

  describe('GET /tickets/:id', () => {
    it('returns the ticket', async () => {
      await api.request('POST', '/tickets', validTicket());
      const res = await api.request('GET', '/tickets/1');
      assert.equal(res.status, 200);
      assert.equal(res.body.id, 1);
    });

    it('returns 404 for an unknown or invalid id', async () => {
      for (const path of ['/tickets/999', '/tickets/abc']) {
        const res = await api.request('GET', path);
        assert.equal(res.status, 404);
        // The 404 must come from your route, not from a missing route.
        assert.notEqual(res.body.error, 'Route not found', `${path} has no route yet`);
      }
    });
  });

  describe('PATCH /tickets/:id/assign', () => {
    it('assigns the ticket', async () => {
      await api.request('POST', '/tickets', validTicket());
      const res = await api.request('PATCH', '/tickets/1/assign', { assignee: 'niamh' });
      assert.equal(res.status, 200);
      assert.equal(res.body.assignee, 'niamh');
      assert.equal(res.body.status, 'in_progress');
    });

    it('returns 400 without an assignee', async () => {
      await api.request('POST', '/tickets', validTicket());
      const res = await api.request('PATCH', '/tickets/1/assign', {});
      assert.equal(res.status, 400);
    });

    it('returns 404 for an unknown ticket', async () => {
      const res = await api.request('PATCH', '/tickets/999/assign', { assignee: 'niamh' });
      assert.equal(res.status, 404);
      assert.notEqual(res.body.error, 'Route not found', 'PATCH /tickets/:id/assign has no route yet');
    });

    it('returns 409 for a closed ticket', async () => {
      await api.request('POST', '/tickets', validTicket());
      await api.request('PATCH', '/tickets/1/status', { status: 'closed' });
      const res = await api.request('PATCH', '/tickets/1/assign', { assignee: 'niamh' });
      assert.equal(res.status, 409);
    });
  });

  describe('PATCH /tickets/:id/status', () => {
    it('moves the ticket through its lifecycle', async () => {
      await api.request('POST', '/tickets', validTicket());
      assert.equal((await api.request('PATCH', '/tickets/1/status', { status: 'in_progress' })).status, 200);
      const res = await api.request('PATCH', '/tickets/1/status', { status: 'resolved' });
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'resolved');
      assert.ok(res.body.resolvedAt);
    });

    it('returns 400 for an unknown status and 409 for a move that is not allowed', async () => {
      await api.request('POST', '/tickets', validTicket());
      assert.equal((await api.request('PATCH', '/tickets/1/status', { status: 'done' })).status, 400);
      assert.equal((await api.request('PATCH', '/tickets/1/status', { status: 'resolved' })).status, 409);
    });
  });

  describe('reports', () => {
    it('GET /reports/sla-breaches lists overdue tickets', async () => {
      await api.request('POST', '/tickets', validTicket({ priority: 'urgent' }));
      await api.request('POST', '/tickets', validTicket({ priority: 'low' }));
      api.clock.advanceHours(5);
      const res = await api.request('GET', '/reports/sla-breaches');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body.map((t) => t.id), [1]);
    });

    it('GET /reports/stats returns the summary', async () => {
      await api.request('POST', '/tickets', validTicket({ priority: 'urgent' }));
      const res = await api.request('GET', '/reports/stats');
      assert.equal(res.status, 200);
      assert.equal(res.body.total, 1);
      assert.equal(res.body.byPriority.urgent, 1);
      assert.equal(res.body.byStatus.open, 1);
    });
  });
});
