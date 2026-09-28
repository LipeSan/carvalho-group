ALTER TABLE "candidate_profiles" ADD COLUMN "ssn_encrypted" text;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "ssn_last4" text;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "passport_number_encrypted" text;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "passport_number_last4" text;