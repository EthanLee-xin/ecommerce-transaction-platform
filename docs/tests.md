# Testing Strategy

This document describes how testing is organized in `vipshop-ecommerce` and why the current test suite is structured the way it is.

The project uses testing to support two goals:

- verify business-critical flows such as payment, order state changes, and webhook handling
- make the project look and behave more like a production system rather than a demo

---

## 1. Testing philosophy

The app is centered around transactional correctness. That means the most important tests are not purely visual snapshot tests, but tests that validate:

- order creation
- payment completion
- webhook reconciliation
- state machine transitions
- frontend checkout behavior
- error handling
- idempotent updates

The test suite is built to catch regressions in the business flow first.

---

## 2. Test layers

### Type checking
TypeScript type checking acts as the first quality gate.

It verifies:
- API shapes
- component props
- model and service contracts
- route/controller integration at the type level

### Backend tests
Backend tests focus on payment and order workflow behavior.

They validate:
- Stripe webhook handling
- order status transitions
- duplicate event handling
- business-rule failures

### Frontend tests
Frontend tests focus on checkout and payment selection behavior.

They validate:
- payment method selection
- checkout UI rendering
- localStorage-backed cart state behavior
- integration points with order placement flow

---

## 3. What is covered today

### Backend integration-style coverage
The current backend tests include:

- Stripe webhook success handling
- Stripe webhook duplicate-event handling
- Stripe webhook missing-signature error handling
- order state machine guard rules

These tests are designed to cover the highest-risk transaction paths.

### Frontend coverage
The current frontend tests include:

- payment method options rendering
- saved payment method behavior in the payment screen

These tests help verify that the checkout flow presents the correct provider choices and does not regress in basic navigation or state handling.

---

## 4. Stripe webhook testing strategy

Stripe webhooks are treated as critical infrastructure because they are the final source of truth for payment status.

### What the tests verify
- a `payment_intent.succeeded` event marks the order as paid
- the same event is ignored if it was already processed
- a missing signature produces a normalized error response

### Why this matters
Stripe may retry webhooks, and clients may reconnect or refresh. The tests make sure those realities do not create duplicate payment records or inconsistent order state.

---

## 5. Order state machine testing strategy

The order lifecycle has rules around when transitions are valid.

### Examples of guarded transitions
- payment is allowed only when the order is eligible
- delivery is allowed only after payment
- refund is blocked after completion or cancellation

### Why this matters
The order state machine is one of the most important parts of the business logic. If it becomes too permissive, the system can end up with impossible states such as:
- refunded but never paid
- delivered before payment
- duplicate fulfillment transitions

The tests are there to prevent those cases.

---

## 6. Frontend payment page testing strategy

The payment page is not just a visual screen. It controls which payment provider the user sends into the checkout pipeline.

### What the tests check
- both payment options are rendered
- the selected payment method is preserved in the screen logic
- localStorage-backed state does not break the payment screen in test runs

### Why this matters
Checkout screens are easy to accidentally regress when wiring payment providers. These tests ensure the payment selection flow stays stable while the backend evolves.

---

## 7. Test environment setup

### Frontend test environment
The frontend test environment uses `jsdom` so DOM-based tests can run reliably.

A shared test setup file also provides a stable `localStorage` mock so cart and payment state can be initialized without browser runtime errors.

### Backend test environment
Backend tests run against request handlers and mocked dependencies so that payment and webhook logic can be exercised without calling external Stripe services or a real database.

---

## 8. Test design choices

### Mock external services
External dependencies such as Stripe and the order model are mocked where appropriate.

This keeps tests:
- deterministic
- fast
- independent of third-party availability

### Focus on business behavior
The tests are not trying to prove that Stripe itself works. They only validate that the app:
- calls Stripe in the right way
- stores the right payment metadata
- updates orders correctly
- rejects invalid state changes

### Prefer integration-style assertions for critical flows
For transactional flows, the suite prefers tests that exercise the route or screen in a realistic way rather than isolated unit tests that miss end-to-end behavior.

---

## 9. Current strengths

The current suite already gives good confidence in:
- payment provider selection
- Stripe webhook reconciliation
- duplicate processing defense
- order state safety
- type safety across the frontend and backend

That is especially valuable for a project whose main business value is transactional correctness.

---

## 10. Gaps that could be improved later

If the project were expanded further, the next tests to add would likely be:
- full order creation integration tests
- payment intent creation success and failure tests
- refund workflow tests
- admin delivery action tests
- Redux slice tests for cart and auth behavior

These would raise coverage even further and make the project look even more like a production system with a mature testing culture.

---

## 11. How to explain the testing approach in an interview

A simple interview-ready summary is:

> The test strategy is focused on transactional correctness rather than generic UI coverage. The highest-value tests validate Stripe webhook processing, order state transitions, and checkout behavior because those are the paths most likely to cause real production issues if they regress.

That answer shows that the project’s testing is intentionally tied to business risk.

---

## 12. Summary

The testing strategy in `vipshop-ecommerce` is designed to support confidence in the most important business flows:

- type checks prevent contract drift
- backend tests protect payment and order workflow logic
- frontend tests protect checkout behavior

Together, they help keep the project stable, auditable, and closer to production-grade quality.
