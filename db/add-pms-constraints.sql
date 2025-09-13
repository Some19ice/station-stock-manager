-- Add unique constraints for PMS tables
ALTER TABLE pump_meter_readings 
ADD CONSTRAINT IF NOT EXISTS unique_reading_per_pump_date_type 
UNIQUE (pump_id, reading_date, reading_type);

ALTER TABLE daily_pms_calculations 
ADD CONSTRAINT IF NOT EXISTS unique_calculation_per_pump_date 
UNIQUE (pump_id, calculation_date);

ALTER TABLE pms_sales_records 
ADD CONSTRAINT IF NOT EXISTS unique_record_per_station_date 
UNIQUE (station_id, record_date);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS pump_readings_lookup_idx 
ON pump_meter_readings (pump_id, reading_date, reading_type);

CREATE INDEX IF NOT EXISTS calculations_lookup_idx 
ON daily_pms_calculations (pump_id, calculation_date);

CREATE INDEX IF NOT EXISTS pms_records_lookup_idx 
ON pms_sales_records (station_id, record_date);
