-- Create theme_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "theme_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_id" uuid NOT NULL,
	"settings" jsonb NOT NULL
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'theme_settings_station_id_stations_id_fk'
    ) THEN
        ALTER TABLE "theme_settings"
        ADD CONSTRAINT "theme_settings_station_id_stations_id_fk"
        FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id")
        ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "station_id_idx" ON "theme_settings"("station_id");
CREATE INDEX IF NOT EXISTS "settings_idx" ON "theme_settings" USING gin ("settings");
