CREATE TYPE "public"."audit_action_type" AS ENUM('user_create', 'user_update', 'user_deactivate', 'role_assign', 'report_generate', 'report_export', 'supplier_create', 'supplier_update', 'customer_create', 'customer_update', 'permission_check_fail');--> statement-breakpoint
CREATE TYPE "public"."audit_resource_type" AS ENUM('user', 'report', 'supplier', 'customer', 'permission');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'director';--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action_type" "audit_action_type" NOT NULL,
	"resource_type" "audit_resource_type" NOT NULL,
	"resource_id" uuid,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"station_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;