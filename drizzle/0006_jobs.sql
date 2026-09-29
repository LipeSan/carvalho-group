CREATE TYPE "public"."contract_type" AS ENUM('fullTime', 'partTime', 'contract', 'temporary', 'internship');--> statement-breakpoint
CREATE TYPE "public"."job_category" AS ENUM('plasterer', 'cleaningHelper', 'attendant', 'cook', 'cashier', 'construction', 'painter', 'bartender');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TYPE "public"."pay_period" AS ENUM('hour', 'year');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('onsite', 'hybrid', 'remote');--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"category" "job_category" NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"work_mode" "work_mode" DEFAULT 'onsite' NOT NULL,
	"contract_type" "contract_type" NOT NULL,
	"pay_min" numeric(10, 2),
	"pay_max" numeric(10, 2),
	"pay_period" "pay_period" DEFAULT 'hour' NOT NULL,
	"pay_note" text,
	"description" text NOT NULL,
	"responsibilities" text[] DEFAULT '{}' NOT NULL,
	"requirements" text[] DEFAULT '{}' NOT NULL,
	"benefits" text[] DEFAULT '{}' NOT NULL,
	"schedule" text,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jobs_status_published_at_idx" ON "jobs" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "jobs_category_idx" ON "jobs" USING btree ("category");