-- Performance indexes for common query patterns
-- Safe to run multiple times (IF NOT EXISTS on all statements)

-- =============================================================================
-- LISTING TABLE INDEXES
-- =============================================================================

-- Filter by active status (most queries filter on is_active = true)
CREATE INDEX IF NOT EXISTS "idx_listing_is_active"
  ON "Listing" ("is_active");

-- Filter by listing type (item vs service)
CREATE INDEX IF NOT EXISTS "idx_listing_type"
  ON "Listing" ("type");

-- Filter by category
CREATE INDEX IF NOT EXISTS "idx_listing_category"
  ON "Listing" ("category");

-- Filter by city name (city-based discovery)
CREATE INDEX IF NOT EXISTS "idx_listing_city_name"
  ON "Listing" ("city_name");

-- Composite index for the most common filter combo: active + type
CREATE INDEX IF NOT EXISTS "idx_listing_active_type"
  ON "Listing" ("is_active", "type");

-- Descending index on created_at for newest-first ordering
CREATE INDEX IF NOT EXISTS "idx_listing_created_at"
  ON "Listing" ("created_at" DESC);

-- =============================================================================
-- USER TABLE INDEXES
-- =============================================================================

-- Index on phone for login / OTP lookup queries
CREATE INDEX IF NOT EXISTS "idx_user_phone"
  ON "User" ("phone");
