ALTER TABLE "candidate_profiles" ADD COLUMN "resume_pathname" text;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "resume_file_name" text;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "resume_size" integer;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "resume_uploaded_at" timestamp with time zone;