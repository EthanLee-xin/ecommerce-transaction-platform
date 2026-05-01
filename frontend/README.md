# VIPshop E-commerce Transaction Platform

VIPshop E-commerce Transaction Platform is a production-oriented MERN application focused on the core transaction flow of an e-commerce system: cart, checkout, payment, order fulfillment, inventory coordination, and refund reversal.

This system is intentionally scoped to the business-critical path rather than the full storefront experience. The goal is to present a platform that looks and behaves like a real production transaction service, with clear workflow boundaries, auditable state transitions, and operational visibility.

## Project overview

Most e-commerce demos overemphasize product browsing and underemphasize the parts that matter in production:

- Payment verification
- Order state consistency
- Inventory reservation and deduction
- Refund rollback
- Workflow traceability
- Role-based operational actions

VIPshop E-commerce Transaction Platform is designed to showcase those transaction concerns directly.

## Core capabilities

### Frontend workflow
- Cart management
- Shipping address collection
- Payment method selection
- Order placement and confirmation
- Order detail tracking
- Transaction state timeline

### Backend workflow
- Order creation and validation
- PayPal payment verification
- Inventory reservation, deduction, and restoration
- Fulfillment state transitions
- Refund flow orchestration
- Status history auditing

## Technology stack

### Frontend
- React
- Redux Toolkit
- RTK Query
- React Router
- React Bootstrap
- PayPal React SDK

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- PayPal REST API

## System architecture

### Frontend structure
- `CartScreen`
- `ShippingScreen`
- `PaymentScreen`
- `PlaceOrderScreen`
- `OrderScreen`
- `LoginScreen`
- `RegisterScreen`
- `ProfileScreen`
- Shared UI components such as `Header`, `Footer`, `Loader`, `Message`, and `CheckoutSteps`
- Redux slices for cart, auth, users, and orders

### Backend structure
- `orderController.js` for transaction orchestration
- `userController.js` for authentication and profile management
- `orderModel.js` for order state and history
- Service layer for pricing, payment verification, inventory, refund handling, and workflow coordination

## Transaction model

The order model includes explicit state fields to support a production-style workflow:

- `fulfillmentStatus`
- `inventoryStatus`
- `refundStatus`
- `statusHistory`

These states make the order lifecycle traceable from creation through payment, fulfillment, and refund.

## Service layer responsibilities

### `orderPricingService.js`
Builds order items from the inventory snapshot so pricing is derived from trusted data rather than client-provided values.

### `orderFactoryService.js`
Creates order drafts and keeps order construction logic out of the controller.

### `paymentService.js`
Verifies PayPal payments, checks transaction uniqueness, and prepares payment payloads.

### `inventoryService.js`
Handles inventory snapshot creation, reservation, deduction, and restoration.

### `refundService.js`
Coordinates refund initiation, approval, processing, and rejection.

### `orderStatusService.js`
Writes fulfillment, inventory, refund, and status history records.

### `orderWorkflowService.js`
Orchestrates the end-to-end order lifecycle across creation, payment confirmation, delivery, and refund.

## Business flow

### Order creation
1. User submits cart and shipping information.
2. Server rebuilds order items from inventory snapshot data.
3. Server recalculates all prices.
4. A draft order is created.
5. Initial workflow state is recorded.
6. Inventory is reserved.
7. The order is saved.

### Payment confirmation
1. User completes payment.
2. Server verifies the PayPal transaction.
3. The transaction is checked for idempotency.
4. Payment amount is validated.
5. The order is marked as paid.
6. Inventory is deducted.
7. Fulfillment state advances.
8. Status history is recorded.

### Delivery handling
1. An operator marks the order as delivered.
2. Fulfillment state is updated.
3. Delivery time is stored.
4. Status history is updated.

### Refund reversal
1. An operator initiates a refund.
2. Refund status moves into processing.
3. Inventory is restored.
4. Refund is completed.
5. Fulfillment is cancelled.
6. Payment metadata is cleared.
7. Status history is updated.

## What makes this project production-oriented

- Focused on the transaction core instead of storefront noise
- Clear separation of controller, service, and model responsibilities
- Payment verification and idempotency checks
- Inventory and refund flows modeled as workflow steps
- Status timeline surfaced in the UI for operational visibility
- Auditable state transitions throughout the order lifecycle

## UI highlights

The order detail page is designed to communicate transaction status clearly and professionally.

It shows:

- Shipping information
- Payment method and payment state
- Order items
- Fulfillment status
- Inventory status
- Refund status
- A transaction status timeline
- Order totals
- Payment, delivery, and refund actions when appropriate

## Getting started

### Install dependencies

Install the root dependencies first, then install the frontend dependencies:

```bash
npm install
npm install --prefix frontend
```

### Run locally

Start both the backend and frontend together:

```bash
npm run dev
```

### Test

Run the full test suite with Vitest:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

Open the Vitest UI for interactive test debugging:

```bash
npm run test:ui
```

### Build frontend

```bash
npm run build
```

## Interview-friendly summary

VIPshop E-commerce Transaction Platform demonstrates how to design and implement a business-critical transaction workflow for an e-commerce platform, with emphasis on order state management, inventory coordination, payment verification, refund reversal, and traceable workflow transitions.
