const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateNewTicket } = require('../src/validation/validateTicket');
const { validTicket } = require('./helpers');

// Change to true when you start Milestone 1.
const STARTED = false;

const fieldsOf = (errors) => errors.map((e) => e.field).sort();

describe('Milestone 1: validateNewTicket', { skip: !STARTED && 'Not started' }, () => {
  it('accepts a valid ticket', () => {
    assert.deepEqual(validateNewTicket(validTicket()), []);
  });

  it('accepts a ticket without a priority', () => {
    const input = validTicket();
    delete input.priority;
    assert.deepEqual(validateNewTicket(input), []);
  });

  it('rejects a missing title', () => {
    const input = validTicket();
    delete input.title;
    assert.deepEqual(fieldsOf(validateNewTicket(input)), ['title']);
  });

  it('rejects a title that is too short once spaces are trimmed', () => {
    assert.deepEqual(fieldsOf(validateNewTicket(validTicket({ title: '   ab   ' }))), ['title']);
  });

  it('accepts a 100 character title and rejects 101', () => {
    assert.deepEqual(validateNewTicket(validTicket({ title: 'x'.repeat(100) })), []);
    assert.deepEqual(fieldsOf(validateNewTicket(validTicket({ title: 'x'.repeat(101) }))), ['title']);
  });

  it('rejects a title that is not a string', () => {
    assert.deepEqual(fieldsOf(validateNewTicket(validTicket({ title: 12345 }))), ['title']);
  });

  it('rejects a blank description', () => {
    assert.deepEqual(fieldsOf(validateNewTicket(validTicket({ description: '    ' }))), ['description']);
  });

  it('rejects a description over 2000 characters', () => {
    assert.deepEqual(fieldsOf(validateNewTicket(validTicket({ description: 'x'.repeat(2001) }))), ['description']);
  });

  it('rejects requesters that are not email addresses', () => {
    for (const requester of ['not-an-email', 'a@b', 'aoife @example.com', '@example.com', 42, '']) {
      assert.deepEqual(
        fieldsOf(validateNewTicket(validTicket({ requester }))),
        ['requester'],
        `expected ${JSON.stringify(requester)} to be rejected`,
      );
    }
  });

  it('rejects an unknown priority', () => {
    assert.deepEqual(fieldsOf(validateNewTicket(validTicket({ priority: 'critical' }))), ['priority']);
  });

  it('reports every problem at once', () => {
    assert.deepEqual(fieldsOf(validateNewTicket({})), ['description', 'requester', 'title']);
  });

  it('rejects input that is not an object', () => {
    for (const input of [null, undefined, [], 'text']) {
      assert.deepEqual(fieldsOf(validateNewTicket(input)), ['body'], `input: ${JSON.stringify(input)}`);
    }
  });

  it('gives every error a readable message', () => {
    for (const error of validateNewTicket({ priority: 'nope' })) {
      assert.equal(typeof error.message, 'string');
      assert.ok(error.message.length > 0);
    }
  });
});
