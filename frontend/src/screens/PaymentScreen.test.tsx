// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

vi.mock('../components/FormContainer', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../components/CheckoutSteps', () => ({
  default: () => <div>Checkout Steps</div>,
}));

const renderScreen = async (paymentMethod = 'Stripe') => {
  const PaymentScreen = (await import('./PaymentScreen')).default;
  const store = configureStore({
    reducer: {
      cart: () => ({ shippingAddress: { address: '88 Road' }, paymentMethod }),
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <PaymentScreen />
      </MemoryRouter>
    </Provider>
  );
};

describe('PaymentScreen', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('shows both payment options', async () => {
    await renderScreen('Stripe');

    expect(screen.getByLabelText(/PayPal/i)).toBeTruthy();
    expect(screen.getByLabelText(/Stripe Card/i)).toBeTruthy();
  });

  it('renders the saved payment method option', async () => {
    await renderScreen('PayPal');

    expect(screen.getByLabelText(/PayPal/i)).toBeTruthy();
  });
});
