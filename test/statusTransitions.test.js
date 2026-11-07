const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { canTransition } = require('../src/services/statusTransitions');
const { STATUSES } = require('../src/constants');

// Change to true when you start Milestone 2.
const STARTED = false;

const ALLOWED = new Set([
  'open->in_progress',
  'open->closed',
  'in_progress->open',
  'in_progress->resolved',
  'resolved->in_progress',
  'resolved->closed',
]);

describe('Milestone 2: canTransition', { skip: !STARTED && 'Not started' }, () => {
  it('allows exactly the moves in the status diagram', () => {
    for (const from of STATUSES) {
      for (const to of STATUSES) {
        const key = `${from}->${to}`;
        assert.equal(canTransition(from, to), ALLOWED.has(key), key);
      }
    }
  });

  it('treats closed as final', () => {
    for (const to of STATUSES) {
      assert.equal(canTransition('closed', to), false);
    }
  });

  it('rejects unknown statuses', () => {
    assert.equal(canTransition('open', 'pending'), false);
    assert.equal(canTransition('pending', 'open'), false);
    assert.equal(canTransition(undefined, 'open'), false);
  });
});
