CREATE INDEX IF NOT EXISTS "calculations_lookup_idx" ON "daily_pms_calculations" USING btree ("pump_id","calculation_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pump_readings_lookup_idx" ON "pump_meter_readings" USING btree ("pump_id","reading_date","reading_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pms_records_lookup_idx" ON "pms_sales_records" USING btree ("station_id","record_date");--> statement-breakpoint
-- Add unique constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_calculation_per_pump_date') THEN
        ALTER TABLE "daily_pms_calculations" ADD CONSTRAINT "unique_calculation_per_pump_date" UNIQUE("pump_id","calculation_date");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_reading_per_pump_date_type') THEN
        ALTER TABLE "pump_meter_readings" ADD CONSTRAINT "unique_reading_per_pump_date_type" UNIQUE("pump_id","reading_date","reading_type");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_record_per_station_date') THEN
        ALTER TABLE "pms_sales_records" ADD CONSTRAINT "unique_record_per_station_date" UNIQUE("station_id","record_date");
    END IF;
END $$;