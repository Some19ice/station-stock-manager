# Data Model: Theme Management

**Branch**: `001-add-theme-management` | **Date**: 2025-09-09 | **Spec**: [./spec.md](./spec.md)

## 1. `themeSettings` Table

This table stores the theme settings for each station.

### Schema
```typescript
import { pgTable, serial, text, jsonb, index } from 'drizzle-orm/pg-core';
import { stations } from './stations'; // Assuming you have a stations table

export interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
}

export const themeSettings = pgTable('theme_settings', {
  id: serial('id').primaryKey(),
  stationId: text('station_id').notNull().references(() => stations.id),
  settings: jsonb('settings').$type<ThemeSettings>().notNull(),
}, (table) => {
  return {
    stationIdIdx: index('station_id_idx').on(table.stationId),
    settingsIdx: index('settings_idx').using('gin', table.settings),
  };
});
```

### Fields
- `id`: A unique identifier for the theme setting record.
- `stationId`: A foreign key referencing the `id` of the station in the `stations` table.
- `settings`: A `jsonb` column to store the theme settings object.
  - `mode`: The theme mode ('light' or 'dark').
  - `primaryColor`: The primary color for the theme (e.g., a hex code).

### Indexes
- `stationIdIdx`: A standard index on the `stationId` column for fast lookups by station.
- `settingsIdx`: A GIN index on the `settings` column to allow for efficient querying of the JSON data.
