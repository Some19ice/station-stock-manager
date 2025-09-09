import { pgTable, serial, jsonb, index, uuid, text } from 'drizzle-orm/pg-core';
import { stations } from './stations';

// Theme settings for each station
export interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
}

export const themeSettings = pgTable('theme_settings', {
  id: serial('id').primaryKey(),
  stationId: uuid('station_id').notNull().references(() => stations.id),
  settings: jsonb('settings').$type<ThemeSettings>().notNull(),
}, (table) => {
  return {
    stationIdIdx: index('station_id_idx').on(table.stationId),
    settingsIdx: index('settings_idx').using('gin', table.settings),
  };
});