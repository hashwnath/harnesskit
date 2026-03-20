# Product Spec: ShopWave MVP Features

> Priority: P0
> Status: Specified
> Last updated: 2026-03-20

---

## Overview

The ShopWave MVP delivers a complete e-commerce backend: product catalog, shopping cart, order processing, Stripe payments, and user accounts. It targets mid-market retailers who need a clean REST API for web, mobile, and POS frontends.

## User Roles

| Role | Description |
|------|-------------|
| **Shopper** | Browses products, manages cart, places orders |
| **Authenticated Shopper** | Shopper with an account — has order history, address book, wishlist |
| **Admin** | Manages catalog, views orders, handles refunds |

---

## Feature 1: Product Catalog

### User Stories

- **As a shopper**, I want to browse products by category so that I can find items I'm interested in.
- **As a shopper**, I want to search products by keyword so that I can quickly find a specific item.
- **As a shopper**, I want to see product variants (size, color) so that I can select the exact item I need.
- **As a shopper**, I want to see product images and thumbnails so that I can evaluate items visually.
- **As an admin**, I want to create, update, and delete products so that I can manage the catalog.
- **As an admin**, I want to organize products into categories and tags so that shoppers can browse effectively.
- **As an admin**, I want to receive stock alerts when inventory is low so that I can reorder in time.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List products with pagination, filtering, full-text search |
| GET | `/products/{id}` | Get product detail including variants and images |
| POST | `/products` | Create a new product (admin) |
| PUT | `/products/{id}` | Update a product (admin) |
| DELETE | `/products/{id}` | Delete a product (admin) |
| POST | `/products/{id}/images` | Upload product image with thumbnail generation |
| GET | `/categories` | List all categories |
| POST | `/categories` | Create a category (admin) |

### Technical Notes

- Full-text search uses PostgreSQL `tsvector` — no external search engine needed
- Images stored in S3/Minio with auto-generated thumbnails
- Inventory tracked per-variant with configurable stock alert threshold

---

## Feature 2: Shopping Cart

### User Stories

- **As a shopper**, I want to add items to my cart without logging in so that I can browse freely.
- **As a shopper**, I want my cart to persist for 7 days so that I can return to complete my purchase.
- **As an authenticated shopper**, I want my cart to follow me across devices so that I don't lose items.
- **As a shopper**, I want to apply a coupon code to my cart so that I can get a discount.
- **As a shopper**, I want to see quantity limits so that I understand purchasing restrictions.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cart` | Get current cart contents |
| POST | `/cart/items` | Add item to cart |
| PUT | `/cart/items/{id}` | Update item quantity |
| DELETE | `/cart/items/{id}` | Remove item from cart |
| POST | `/cart/coupon` | Apply coupon code |

### Technical Notes

- Cart stored in Redis (fast reads/writes, natural TTL for 7-day expiry)
- Guest carts keyed by session token; authenticated carts keyed by user ID
- Cart merges guest → authenticated on login

---

## Feature 3: Order Processing

### User Stories

- **As a shopper**, I want to convert my cart into an order so that I can complete my purchase.
- **As a shopper**, I want to see my order status so that I know when to expect delivery.
- **As an authenticated shopper**, I want to view my order history so that I can track past purchases.
- **As an admin**, I want to update order status (shipped, delivered) so that customers are informed.

### Order State Machine

```
pending → paid → shipped → delivered
                              ↓
                          returned
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/orders` | Create order from current cart (reserves inventory) |
| GET | `/orders` | List orders for authenticated user (paginated) |
| GET | `/orders/{id}` | Get order detail |
| PUT | `/orders/{id}/status` | Update order status (admin) |

### Technical Notes

- Cart-to-order conversion atomically reserves inventory (`SELECT FOR UPDATE`)
- Order history supports cursor-based pagination
- Inventory reservation released if payment not received within timeout

---

## Feature 4: Payments (Stripe)

### User Stories

- **As a shopper**, I want to pay by credit card so that I can complete my purchase securely.
- **As a shopper**, I want to pay in my local currency (USD, EUR, GBP) so that I see familiar pricing.
- **As a shopper**, I want to receive payment confirmation so that I know my order went through.
- **As an admin**, I want to issue full or partial refunds so that I can handle returns and disputes.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/payments/checkout` | Create Stripe Checkout Session for an order |
| POST | `/payments/webhook` | Stripe webhook handler for payment events |
| POST | `/payments/refund` | Issue a full or partial refund (admin) |

### Technical Notes

- ShopWave never handles raw card data — Stripe Checkout Sessions manage card collection
- Webhook signatures verified before processing any payment event
- Idempotency keys used for all Stripe API calls to prevent double-charges
- Multi-currency (USD, EUR, GBP) configured per-product or per-storefront

---

## Feature 5: User Accounts

### User Stories

- **As a visitor**, I want to register an account so that I can track orders and save addresses.
- **As a user**, I want to log in with email and password so that I can access my account.
- **As a user**, I want to manage my address book so that checkout is faster.
- **As a user**, I want to maintain a wishlist so that I can save products for later.
- **As a user**, I want to export my personal data so that I can exercise my GDPR rights.
- **As a user**, I want to delete my account so that my data is removed.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Authenticate and receive JWT |
| GET | `/users/me` | Get current user profile |
| GET | `/users/me/addresses` | List saved addresses |
| POST | `/users/me/addresses` | Add a new address |
| GET | `/users/me/wishlist` | Get wishlist |
| POST | `/users/me/wishlist` | Add product to wishlist |
| GET | `/users/me/data-export` | Export all personal data (GDPR) |
| DELETE | `/users/me` | Delete account and personal data (GDPR) |

### Technical Notes

- JWT-based auth with short-lived access tokens
- Passwords hashed with bcrypt
- Address book supports separate shipping and billing addresses
- GDPR export returns all user PII, orders, and wishlist as JSON

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Checkout conversion rate | > 3% |
| p95 API latency (catalog reads) | < 300ms |
| p95 API latency (checkout) | < 500ms |
| Checkout availability | 99.95% |
| Test coverage (Services + Repositories) | 90% |
| Payment data breaches | Zero |

## Non-Functional Requirements

- **Flash sale handling**: System must sustain 10x normal traffic using Redis caching and rate limiting
- **GDPR compliance**: User data exportable and deletable on request
- **PCI compliance**: Achieved via Stripe — no card data stored or processed locally
