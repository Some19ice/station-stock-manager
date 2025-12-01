-- Performance Indexes Migration
-- Created: 2025-11-30
-- Purpose: Add missing indexes to improve query performance

-- Users table indexes (for staff reports and dashboard queries)
CREATE INDEX IF NOT EXISTS users_station_id_idx ON users(station_id);
CREATE INDEX IF NOT EXISTS users_station_role_idx ON users(station_id, role);
CREATE INDEX IF NOT EXISTS users_clerk_user_id_idx ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS users_station_active_idx ON users(station_id, is_active);

-- Products table indexes (for inventory and sales queries)
CREATE INDEX IF NOT EXISTS products_station_id_idx ON products(station_id);
CREATE INDEX IF NOT EXISTS products_station_type_idx ON products(station_id, type);
CREATE INDEX IF NOT EXISTS products_station_active_idx ON products(station_id, is_active);
CREATE INDEX IF NOT EXISTS products_type_active_idx ON products(type, is_active);

-- Transaction items indexes (for joins in reports)
CREATE INDEX IF NOT EXISTS transaction_items_transaction_id_idx ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS transaction_items_product_id_idx ON transaction_items(product_id);
CREATE INDEX IF NOT EXISTS transaction_items_transaction_product_idx ON transaction_items(transaction_id, product_id);

-- Transactions user_id index (CRITICAL for staff reports)
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS transactions_station_user_date_idx ON transactions(station_id, user_id, transaction_date DESC);

-- Stock movements indexes
CREATE INDEX IF NOT EXISTS stock_movements_product_id_idx ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS stock_movements_station_date_idx ON stock_movements(station_id, movement_date DESC);

-- Pump configurations indexes
CREATE INDEX IF NOT EXISTS pump_configurations_station_id_idx ON pump_configurations(station_id);
CREATE INDEX IF NOT EXISTS pump_configurations_station_status_idx ON pump_configurations(station_id, status);

-- Comment: These indexes will significantly improve:
-- 1. Staff performance reports (transactions by user_id)
-- 2. Dashboard metrics (products by station/type)
-- 3. Inventory queries (products by station)
-- 4. Transaction joins (transaction_items relationships)
-- 5. User lookups (by station and role)

