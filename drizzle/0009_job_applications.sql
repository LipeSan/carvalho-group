CREATE TYPE "public"."application_status" AS ENUM('new', 'reviewing', 'rejected', 'hired');--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" integer NOT NULL,
	"candidate_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_applications_job_candidate_unique" UNIQUE("job_id","candidate_id")
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_applications_candidate_id_idx" ON "job_applications" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "job_applications_created_at_idx" ON "job_applications" USING btree ("created_at");