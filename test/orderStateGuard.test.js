import { describe, expect, it } from 'vitest';

const canTransition = (state, action) => {
  if (action === 'deliver') {
    return state.isPaid && !state.isDelivered && state.fulfillmentStatus !== 'cancelled';
  }
  if (action === 'refund') {
    return state.isPaid && state.fulfillmentStatus !== 'completed';
  }
  if (action === 'pay') {
    return !state.isPaid && state.fulfillmentStatus !== 'cancelled';
  }
  return false;
};

describe('order state machine', () => {
  it('allows payment before completion', () => {
    expect(
      canTransition({ isPaid: false, isDelivered: false, fulfillmentStatus: 'pending' }, 'pay')
    ).toBe(true);
  });

  it('rejects payment on cancelled orders', () => {
    expect(
      canTransition({ isPaid: false, isDelivered: false, fulfillmentStatus: 'cancelled' }, 'pay')
    ).toBe(false);
  });

  it('allows delivery only after payment', () => {
    expect(
      canTransition({ isPaid: true, isDelivered: false, fulfillmentStatus: 'allocated' }, 'deliver')
    ).toBe(true);
  });

  it('rejects delivery after cancellation', () => {
    expect(
      canTransition({ isPaid: true, isDelivered: false, fulfillmentStatus: 'cancelled' }, 'deliver')
    ).toBe(false);
  });

  it('allows refund only for eligible orders', () => {
    expect(
      canTransition({ isPaid: true, isDelivered: false, fulfillmentStatus: 'allocated' }, 'refund')
    ).toBe(true);
  });

  it('rejects refund after completed fulfillment', () => {
    expect(
      canTransition({ isPaid: true, isDelivered: true, fulfillmentStatus: 'completed' }, 'refund')
    ).toBe(false);
  });
});
