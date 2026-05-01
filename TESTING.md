# Testing Governance

This repository uses Vitest for both frontend and backend-focused test coverage.

## Testing layers

### 1. Domain workflow tests
These tests cover core transaction flows and business rules:

- Order creation
- Payment verification
- Payment idempotency
- Inventory reserve/deduct/restore
- Refund workflow
- Status history writing
- Illegal state transitions

### 2. API-level tests
These tests validate route behavior and response contracts:

- Success responses
- Error responses
- Unauthorized / forbidden access
- Conflict handling for duplicate requests
- Validation and not-found errors

### 3. Component tests
These tests validate transaction UI rendering and interaction behavior:

- Order status timeline
- Payment button visibility
- Refund button visibility
- Delivery button visibility
- Error message mapping

## Test organization

### Frontend
Keep component tests next to the component or screen they verify.

Example:

- `frontend/src/screens/OrderScreen.jsx`
- `frontend/src/screens/OrderScreen.test.jsx`

### Backend
Keep workflow and API tests in the top-level `test/` directory.

Example:

- `test/orderWorkflow.test.js`
- `test/orderController.api.test.js`
- `test/orderStateGuard.test.js`

## Conventions

- Prefer testing the business workflow over UI snapshots.
- Prefer descriptive assertions over implementation detail assertions.
- Mock external services such as PayPal, Redis, and MongoDB where appropriate.
- Keep tests deterministic and idempotent.
- Focus on transaction safety, failure handling, and state integrity.

## Commands

```bash
npm test
npm run test:watch
npm run test:ui
```

## Acceptance criteria for Stage 2

The test suite should cover:

- Happy-path transaction flows
- Negative paths and illegal transitions
- API response contracts
- UI visibility rules for transaction actions
- Error mapping for known business codes
