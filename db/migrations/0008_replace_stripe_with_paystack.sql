ALTER TABLE "customers" DROP CONSTRAINT "customers_stripe_customer_id_unique";--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "customers_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "paystack_customer_code" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "paystack_subscription_code" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "paystack_authorization_code" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "paystack_last_payment" timestamp;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_paystack_customer_code_unique" UNIQUE("paystack_customer_code");--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_paystack_subscription_code_unique" UNIQUE("paystack_subscription_code");
