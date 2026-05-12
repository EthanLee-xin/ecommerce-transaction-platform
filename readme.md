# E-commerce Transaction Platform

## Overview

A production full-stack e-commerce transaction platform with a **Next.js + TailwindCSS frontend** and an **Express + MongoDB backend**.

The project focuses on the business-critical path of online commerce: cart, checkout, order creation, payment processing, refund handling, order status tracking, and transaction visibility.

The frontend was rebuilt from a traditional React application into a modern Next.js App Router architecture, with transaction-focused pages for checkout, payment, order status, refund workflows, route protection, and a redesigned TailwindCSS UI.

The backend remains an Express API service responsible for trusted transaction logic, including order creation, Stripe and PayPal integration, refund handling, JWT authentication, payment status updates, and order lifecycle management.

## What this project demonstrates

- Full-stack transaction workflow across Next.js frontend and Express backend
- Checkout, payment, order status, and refund user flows
- Stripe Payment Element and PayPal payment integration
- Order lifecycle management with explicit status transitions
- Payment status and refund status tracking
- Frontend-to-backend API integration through RTK Query
- Protected routes and user order center
- Admin workflows for product, user, order, shipment, and refund management
- TailwindCSS-based UI redesign for transaction-focused pages
- Separation of frontend interaction logic from backend trusted transaction logic

## Architecture

```text
User / Admin
    |
    v
Next.js Frontend
- App Router
- TailwindCSS UI
- RTK Query API layer
- Protected routes
- Checkout / payment / order status pages
    |
    v
Express Backend API
- JWT authentication
- Order services
- Payment services
- Refund services
- Admin APIs
- Stripe / PayPal integration
    |
    v
MongoDB
- Users
- Products
- Orders
- Payment state
- Refund state

Redis
- Idempotency protection
- Runtime coordination
```

## Frontend / Backend Boundary

The frontend is implemented with **Next.js**, **React**, **TypeScript**, and **TailwindCSS**. It handles user interaction, checkout state, payment UI rendering, order status visibility, refund request UI, and admin-facing transaction screens.

The backend remains an **Express API service**. It owns trusted business logic such as order creation, payment intent creation, Stripe / PayPal integration, refund processing, JWT authentication, payment status updates, and order lifecycle state transitions.

The frontend communicates with the backend through REST APIs and RTK Query. Payment verification, refund handling, and order state changes are handled by the backend rather than directly inside the Next.js frontend.

## Core Transaction Workflows

### Checkout Flow

The checkout flow allows users to move from cart state into a draft order. Users can review cart items, complete shipping information, select a payment method, and proceed to payment.

### Payment Flow

The payment flow supports Stripe card payment through Stripe Payment Element and PayPal checkout. Payment method and payment status are stored on the order and displayed in the order detail page.

### Order Status Flow

The order system uses an explicit lifecycle:

```text
PENDING_INFO
READY_FOR_PAYMENT
PAYMENT_PENDING
PAID
PAYMENT_FAILED
CANCELLED
SHIPPED
DELIVERED
```

### Refund Flow

This allows the platform to represent cases such as delivered orders that later become refunded, or paid orders with pending refund requests.

```text
NONE
REFUND_REQUESTED
REFUND_PENDING
REFUNDED
REFUND_FAILED
```

## Technology Stack

### Frontend

- Next.js App Router
- React
- TypeScript / JavaScript
- Redux Toolkit
- RTK Query
- TailwindCSS
- React Icons
- React Toastify
- Stripe React SDK
- PayPal React SDK

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Stripe API
- PayPal API

### Transaction & Payment

- Stripe Payment Element
- PayPal Checkout
- Order lifecycle state machine
- Refund status tracking
- Admin refund workflow

### Dev / Deployment

- Docker / Docker Compose, if currently supported
- Vercel for frontend deployment
- Render / Railway / Fly.io / VPS for backend deployment
- MongoDB Atlas for database


### Storefront

- Product listing page
- Product detail page
- Product carousel
- Product search
- Pagination
- Product rating display
- Optimized product images with `next/image`

### User

- User registration
- User login/logout
- Protected routes
- User profile update
- Separate user order center
- Continue unfinished orders

### Cart & Checkout

- Add to cart
- Update quantity
- Remove item
- Create draft order directly from cart
- Complete shipping information inside order details
- Pay after shipping information is completed

### Order Lifecycle

The order system uses a custom state machine:

```txt
PENDING_INFO
READY_FOR_PAYMENT
PAYMENT_PENDING
PAID
PAYMENT_FAILED
CANCELLED
SHIPPED
DELIVERED
```

Order flow:

```txt
Cart checkout
-> PENDING_INFO

Save shipping address
-> READY_FOR_PAYMENT

Start payment
-> PAYMENT_PENDING

Payment success
-> PAID

Admin marks as shipped
-> SHIPPED

Admin marks as delivered
-> DELIVERED
```

### Payment

- PayPal payment
- Stripe card payment
- Embedded Stripe Payment Element
- Payment method stored on order
- Payment status displayed in order details

### Refund

- Stripe refund support
- Refund status tracking

```txt
NONE
REFUND_REQUESTED
REFUND_PENDING
REFUNDED
REFUND_FAILED
```

- Refund status shown in order summary and order timeline

## Project Structure

```txt
frontend
├── src
│   ├── app
│   │   ├── page.js
│   │   ├── product/[id]/page.js
│   │   ├── cart/page.js
│   │   ├── order/[id]/page.js
│   │   ├── profile/page.js
│   │   ├── profile/orders/page.js
│   │   └── admin
│   ├── components
│   ├── screens
│   ├── slices
│   ├── utils
│   ├── lib
│   └── assets/styles
```

```txt
backend
├── controllers
├── models
├── routes
├── middleware
├── utils
└── server.js
```

## Running Locally

### Start backend

```bash
cd backend
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

### Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

## Payment Testing

### Stripe Test Card

```txt
Card number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any value
```

### PayPal

Use PayPal sandbox buyer and merchant accounts.

## Deployment Notes

Recommended deployment model:

- Frontend: Vercel
- Backend: Render, Railway, Fly.io, or VPS
- Database: MongoDB Atlas
- Image storage: Cloudinary, S3, or persistent backend storage

For production deployment, the following should be configured:

- HTTPS
- Production Stripe and PayPal credentials
- CORS configuration
- Secure cookie / token handling
- Persistent image storage
