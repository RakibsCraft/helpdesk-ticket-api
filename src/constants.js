// Shared values used across the app. You shouldn't need to change these.

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

// How many hours the team has to resolve a ticket, by priority.
const SLA_HOURS = {
  urgent: 4,
  high: 8,
  medium: 24,
  low: 72,
};

// Used to sort the triage queue: lower number = more important.
const PRIORITY_RANK = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

module.exports = { PRIORITIES, STATUSES, SLA_HOURS, PRIORITY_RANK };
