const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateSlaDueAt, getSlaStatus } = require('../src/services/sla');

// Change to true when you start Milestone 3.
const STARTED = false;

const at = (iso) => new Date(iso);

describe('Milestone 3: calculateSlaDueAt', { skip: !STARTED && 'Not started' }, () => {
  const created = at('2026-11-07T09:00:00.000Z');

  it('returns a Date', () => {
    assert.ok(calculateSlaDueAt('high', created) instanceof Date);
  });

  it('uses the hours for each priority', () => {
    assert.equal(calculateSlaDueAt('urgent', created).toISOString(), '2026-11-07T13:00:00.000Z');
    assert.equal(calculateSlaDueAt('high', created).toISOString(), '2026-11-07T17:00:00.000Z');
    assert.equal(calculateSlaDueAt('medium', created).toISOString(), '2026-11-08T09:00:00.000Z');
    assert.equal(calculateSlaDueAt('low', created).toISOString(), '2026-11-10T09:00:00.000Z');
  });

  it('does not change the createdAt date passed in', () => {
    const input = at('2026-11-07T09:00:00.000Z');
    calculateSlaDueAt('low', input);
    assert.equal(input.toISOString(), '2026-11-07T09:00:00.000Z');
  });
});

describe('Milestone 3: getSlaStatus', { skip: !STARTED && 'Not started' }, () => {
  // High priority: 8 hour window from 09:00 to 17:00. 25% of it is 2 hours.
  const ticket = (overrides = {}) => ({
    status: 'open',
    createdAt: '2026-11-07T09:00:00.000Z',
    slaDueAt: '2026-11-07T17:00:00.000Z',
    resolvedAt: null,
    ...overrides,
  });

  it('is on_track with plenty of time left', () => {
    assert.equal(getSlaStatus(ticket(), at('2026-11-07T10:00:00.000Z')), 'on_track');
  });

  it('is still on_track with exactly 25% of the window left', () => {
    assert.equal(getSlaStatus(ticket(), at('2026-11-07T15:00:00.000Z')), 'on_track');
  });

  it('is at_risk with less than 25% left', () => {
    assert.equal(getSlaStatus(ticket(), at('2026-11-07T15:30:00.000Z')), 'at_risk');
  });

  it('is at_risk at the exact deadline, and breached one second after', () => {
    assert.equal(getSlaStatus(ticket(), at('2026-11-07T17:00:00.000Z')), 'at_risk');
    assert.equal(getSlaStatus(ticket(), at('2026-11-07T17:00:01.000Z')), 'breached');
  });

  it('applies the same rules to in_progress tickets', () => {
    const t = ticket({ status: 'in_progress' });
    assert.equal(getSlaStatus(t, at('2026-11-07T10:00:00.000Z')), 'on_track');
    assert.equal(getSlaStatus(t, at('2026-11-07T18:00:00.000Z')), 'breached');
  });

  it('is met when resolved on or before the deadline', () => {
    const later = at('2026-11-09T00:00:00.000Z');
    assert.equal(getSlaStatus(ticket({ status: 'resolved', resolvedAt: '2026-11-07T16:59:00.000Z' }), later), 'met');
    assert.equal(getSlaStatus(ticket({ status: 'resolved', resolvedAt: '2026-11-07T17:00:00.000Z' }), later), 'met');
  });

  it('is breached when resolved after the deadline', () => {
    const t = ticket({ status: 'resolved', resolvedAt: '2026-11-07T18:00:00.000Z' });
    assert.equal(getSlaStatus(t, at('2026-11-07T18:00:00.000Z')), 'breached');
  });

  it('uses resolvedAt for tickets resolved and then closed', () => {
    const t = ticket({ status: 'closed', resolvedAt: '2026-11-07T12:00:00.000Z' });
    assert.equal(getSlaStatus(t, at('2026-11-20T00:00:00.000Z')), 'met');
  });

  it('is not_applicable for tickets closed without being resolved', () => {
    const t = ticket({ status: 'closed', resolvedAt: null });
    assert.equal(getSlaStatus(t, at('2026-11-20T00:00:00.000Z')), 'not_applicable');
  });
});
