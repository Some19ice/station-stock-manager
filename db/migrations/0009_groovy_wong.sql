CREATE INDEX "calculations_lookup_idx" ON "daily_pms_calculations" USING btree ("pump_id","calculation_date");--> statement-breakpoint
CREATE INDEX "pump_readings_lookup_idx" ON "pump_meter_readings" USING btree ("pump_id","reading_date","reading_type");--> statement-breakpoint
CREATE INDEX "pms_records_lookup_idx" ON "pms_sales_records" USING btree ("station_id","record_date");--> statement-breakpoint
ALTER TABLE "daily_pms_calculations" ADD CONSTRAINT "unique_calculation_per_pump_date" UNIQUE("pump_id","calculation_date");--> statement-breakpoint
ALTER TABLE "pump_meter_readings" ADD CONSTRAINT "unique_reading_per_pump_date_type" UNIQUE("pump_id","reading_date","reading_type");--> statement-breakpoint
ALTER TABLE "pms_sales_records" ADD CONSTRAINT "unique_record_per_station_date" UNIQUE("station_id","record_date");