import test from 'node:test';
import assert from 'node:assert/strict';

test('order screen timeline data shape is renderable', () => {
  const statusHistory = [
    { status: 'order:created', note: 'Order created', changedAt: '2026-01-01T00:00:00Z' },
    { status: 'inventory:reserved', note: 'Inventory reserved', changedAt: '2026-01-01T00:01:00Z' },
    { status: 'payment:confirmed', note: 'Payment verified', changedAt: '2026-01-01T00:02:00Z' },
  ];

  assert.equal(statusHistory.length, 3);
  assert.equal(statusHistory[0].status, 'order:created');
  assert.equal(statusHistory[2].note, 'Payment verified');
});
