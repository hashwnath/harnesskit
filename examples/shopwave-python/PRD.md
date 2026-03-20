# ShopWave — Product Requirements Document

## Overview

ShopWave is an e-commerce platform with AI-powered product recommendations, built as a modular Python monolith using FastAPI. It handles catalog management, order processing, payments (Stripe), and delivers personalized shopping experiences.

## Problem Statement

Mid-market retailers need an e-commerce backend that:
- Provides AI-powered recommendations without a separate ML infrastructure team
- Handles flash sales (10x normal traffic) without downtime
- Integrates with Stripe for payments and supports multiple currencies
- Offers a clean REST API for any frontend (web, mobile, POS)

## Architecture

### System Components

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   FastAPI     │────▶│  PostgreSQL   │     │    Redis      │
│   (API)       │     │  (Primary DB) │     │  (Cache +     │
│               │────▶│              │     │   Sessions)   │
└──────┬────────┘     └──────────────┘     └──────┬───────┘
       │                                           │
       ▼                                           ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Celery      │────▶│  Stripe API   │     │  S3 / Minio   │
│  (Workers)    │     │  (Payments)   │     │  (Images)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Layer Structure

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| **API** | `src/api/` | FastAPI routers, request/response schemas |
| **Services** | `src/services/` | Business logic, orchestration |
| **Repositories** | `src/repositories/` | SQLAlchemy queries, data access |
| **Models** | `src/models/` | SQLAlchemy ORM models, Pydantic schemas |
| **Tasks** | `src/tasks/` | Celery async tasks (emails, payments, recommendations) |
| **Config** | `src/config/` | Settings, feature flags, environment |
| **Providers** | `src/providers/` | External integrations (Stripe, S3, email) |

### Dependency Rules

- API → Services → Repositories → Models
- Tasks → Services (async versions of the same business logic)
- Providers are injected into Services (dependency injection)
- Models are leaf nodes
- API MUST NOT import from Repositories directly

## Core Features

### P0 — MVP

1. **Product Catalog**
   - CRUD with categories, tags, variants (size/color)
   - Full-text search with PostgreSQL tsvector
   - Image upload to S3 with thumbnail generation
   - Inventory tracking with stock alerts

2. **Shopping Cart**
   - Redis-backed cart (guest + authenticated)
   - Cart expiry after 7 days of inactivity
   - Apply coupon codes, quantity limits

3. **Order Processing**
   - Cart → Order conversion with inventory reservation
   - Order states: pending → paid → shipped → delivered → (returned)
   - Order history with pagination

4. **Payments (Stripe)**
   - Stripe Checkout Sessions for card payments
   - Webhook handling for payment confirmation
   - Refund support (full and partial)
   - Multi-currency (USD, EUR, GBP)

5. **User Accounts**
   - Registration, login (JWT)
   - Address book (shipping + billing)
   - Order history, wishlist

### P1 — Post-MVP

6. **AI Recommendations**
   - "Customers also bought" (collaborative filtering)
   - "Similar products" (content-based)
   - Personalized homepage feed
   - Celery task for nightly model retraining

7. **Admin Dashboard API**
   - Sales analytics, revenue reports
   - Inventory management
   - Customer segments

## Non-Functional Requirements

- **Flash sale handling**: Auto-scale to 10x traffic, Redis-based rate limiting
- **Payment security**: PCI DSS compliant (via Stripe), no card data stored
- **Latency**: p95 < 300ms for catalog reads, < 500ms for checkout
- **Availability**: 99.95% for checkout flow
- **Data**: GDPR compliant, user data exportable/deletable

## Data Classification

| Data Type | Classification | Notes |
|-----------|---------------|-------|
| Payment tokens | **Secret** | Stripe handles, never stored locally |
| User PII (name, email, address) | **Confidential** | Encrypted at rest, GDPR subject |
| Order data | **Internal** | Encrypted at rest |
| Product catalog | **Public** | Cached aggressively |
| Recommendation models | **Internal** | Retrained nightly |

## Success Metrics

- Checkout conversion rate > 3%
- Recommendation click-through rate > 8%
- p95 API latency < 300ms
- Zero payment data breaches
- 90% test coverage on Services + Repositories
