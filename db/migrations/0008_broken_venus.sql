-- Create enum types (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calculation_method') THEN
        CREATE TYPE "public"."calculation_method" AS ENUM('meter_readings', 'estimated', 'manual_override');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pump_status') THEN
        CREATE TYPE "public"."pump_status" AS ENUM('active', 'maintenance', 'calibration', 'repair');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estimation_method') THEN
        CREATE TYPE "public"."estimation_method" AS ENUM('transaction_based', 'historical_average', 'manual');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reading_type') THEN
        CREATE TYPE "public"."reading_type" AS ENUM('opening', 'closing');
    END IF;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_pms_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pump_id" uuid NOT NULL,
	"calculation_date" date NOT NULL,
	"opening_reading" numeric(10, 1) NOT NULL,
	"closing_reading" numeric(10, 1) NOT NULL,
	"volume_dispensed" numeric(10, 1) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_revenue" numeric(10, 2) NOT NULL,
	"has_rollover" boolean DEFAULT false NOT NULL,
	"rollover_value" numeric(10, 1),
	"deviation_from_average" numeric(5, 2) NOT NULL,
	"is_estimated" boolean DEFAULT false NOT NULL,
	"calculation_method" "calculation_method" DEFAULT 'meter_readings' NOT NULL,
	"calculated_by" uuid NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pump_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"station_id" uuid NOT NULL,
	"pms_product_id" uuid NOT NULL,
	"pump_number" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"meter_capacity" numeric(10, 1) NOT NULL,
	"install_date" date NOT NULL,
	"last_calibration_date" date,
	"status" "pump_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pump_meter_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pump_id" uuid NOT NULL,
	"reading_date" date NOT NULL,
	"reading_type" "reading_type" NOT NULL,
	"meter_value" numeric(10, 1) NOT NULL,
	"recorded_by" uuid NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"is_estimated" boolean DEFAULT false NOT NULL,
	"estimation_method" "estimation_method",
	"notes" text,
	"is_modified" boolean DEFAULT false NOT NULL,
	"original_value" numeric(10, 1),
	"modified_by" uuid,
	"modified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pms_sales_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"station_id" uuid NOT NULL,
	"record_date" date NOT NULL,
	"total_volume_dispensed" numeric(10, 1) NOT NULL,
	"total_revenue" numeric(10, 2) NOT NULL,
	"average_unit_price" numeric(10, 2) NOT NULL,
	"pump_count" integer NOT NULL,
	"estimated_volume_count" numeric(10, 1) DEFAULT '0' NOT NULL,
	"calculation_details" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "widget_settings" CASCADE;--> statement-breakpoint
-- Add foreign key constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'daily_pms_calculations_pump_id_pump_configurations_id_fk') THEN
        ALTER TABLE "daily_pms_calculations" ADD CONSTRAINT "daily_pms_calculations_pump_id_pump_configurations_id_fk" FOREIGN KEY ("pump_id") REFERENCES "public"."pump_configurations"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'daily_pms_calculations_calculated_by_users_id_fk') THEN
        ALTER TABLE "daily_pms_calculations" ADD CONSTRAINT "daily_pms_calculations_calculated_by_users_id_fk" FOREIGN KEY ("calculated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'daily_pms_calculations_approved_by_users_id_fk') THEN
        ALTER TABLE "daily_pms_calculations" ADD CONSTRAINT "daily_pms_calculations_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pump_configurations_station_id_stations_id_fk') THEN
        ALTER TABLE "pump_configurations" ADD CONSTRAINT "pump_configurations_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pump_configurations_pms_product_id_products_id_fk') THEN
        ALTER TABLE "pump_configurations" ADD CONSTRAINT "pump_configurations_pms_product_id_products_id_fk" FOREIGN KEY ("pms_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pump_meter_readings_pump_id_pump_configurations_id_fk') THEN
        ALTER TABLE "pump_meter_readings" ADD CONSTRAINT "pump_meter_readings_pump_id_pump_configurations_id_fk" FOREIGN KEY ("pump_id") REFERENCES "public"."pump_configurations"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pump_meter_readings_recorded_by_users_id_fk') THEN
        ALTER TABLE "pump_meter_readings" ADD CONSTRAINT "pump_meter_readings_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pump_meter_readings_modified_by_users_id_fk') THEN
        ALTER TABLE "pump_meter_readings" ADD CONSTRAINT "pump_meter_readings_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pms_sales_records_station_id_stations_id_fk') THEN
        ALTER TABLE "pms_sales_records" ADD CONSTRAINT "pms_sales_records_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;