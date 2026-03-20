# Execution Plan: MVP Product Catalog

## Goal

Implement the Product Catalog domain end-to-end — models, repositories, services, API routes, and tests — as the first buildable vertical slice of ShopWave.

## Context

- Spec / Issue: [PRD — P0 Feature 1: Product Catalog](/PRD.md)
- Related plans: None (this is the first execution plan)

## Steps

- [ ] **Step 1: Define SQLAlchemy models** — Create `Product`, `Category`, `Tag`, `ProductVariant` (size/color), and `ProductImage` models in `src/models/`. Include inventory `stock_count` field with stock alert threshold. Add `tsvector` column on Product for full-text search.
- [ ] **Step 2: Create Alembic migration** — Generate initial migration for the catalog tables. Verify migration runs cleanly up and down.
- [ ] **Step 3: Define Pydantic schemas** — Create request/response schemas in `src/models/` (or `src/api/schemas/`): `ProductCreate`, `ProductUpdate`, `ProductResponse`, `ProductListResponse` with pagination, `CategoryCreate`, `CategoryResponse`, `VariantCreate`, `VariantResponse`.
- [ ] **Step 4: Implement repositories** — Create `ProductRepository` and `CategoryRepository` in `src/repositories/`. Methods: `create`, `get_by_id`, `list` (with pagination + filters), `update`, `delete`, `search_fulltext` (using tsvector), `update_stock`, `get_low_stock` (stock alerts).
- [ ] **Step 5: Implement services** — Create `CatalogService` in `src/services/`. Orchestrates: product CRUD, category management, variant management, full-text search, inventory tracking with stock alert logic, image upload coordination (delegates to S3 provider).
- [ ] **Step 6: Implement S3 provider for images** — Create `S3Provider` in `src/providers/` for image upload and thumbnail generation. Support configurable bucket and endpoint (S3 or Minio).
- [ ] **Step 7: Implement API routes** — Create catalog router in `src/api/`. Endpoints: `GET /products` (list + search + filter), `GET /products/{id}`, `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}`, `POST /products/{id}/images`, `GET /categories`, `POST /categories`. Apply pagination on list endpoints.
- [ ] **Step 8: Write repository tests** — Unit tests for all repository methods. Use test database with fixtures. Target: 90%+ coverage on `src/repositories/catalog*`.
- [ ] **Step 9: Write service tests** — Unit tests for CatalogService with mocked repositories and providers. Test business logic: stock alerts, search ranking, variant management. Target: 90%+ coverage on `src/services/catalog*`.
- [ ] **Step 10: Write API integration tests** — Test all catalog endpoints via FastAPI TestClient. Verify request validation, response shapes, pagination, error codes.
- [ ] **Step 11: Verify full-text search** — Integration test confirming tsvector search returns relevant results, handles partial matches, and respects category filters.
- [ ] **Step 12: Update QUALITY_SCORE.md** — Move Catalog domain from F/F/C/B to target grades reflecting implementation quality.

## Acceptance Criteria

- [ ] All catalog CRUD endpoints functional and returning correct response schemas
- [ ] Full-text search works with PostgreSQL tsvector (tested with sample data)
- [ ] Image upload to S3/Minio works with thumbnail generation
- [ ] Inventory tracking with stock alerts triggers when below threshold
- [ ] Product variants (size/color) can be created and queried
- [ ] All tests pass with >= 90% coverage on catalog Services and Repositories
- [ ] `harnesskit enforce` passes — no architecture violations (API does not import Repositories)
- [ ] QUALITY_SCORE.md updated

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-20 | Start with Catalog as first vertical slice | Catalog has no external dependencies (no Stripe, no Redis carts) — cleanest domain to validate the full layer stack |
| 2026-03-20 | Use PostgreSQL tsvector for search instead of Elasticsearch | PRD specifies tsvector; avoids adding another infrastructure dependency for MVP |
| 2026-03-20 | Support both S3 and Minio via provider abstraction | Allows local development with Minio, production with S3, same code path |
