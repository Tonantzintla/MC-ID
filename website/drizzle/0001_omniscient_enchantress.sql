CREATE TYPE "public"."report_reason" AS ENUM('malicious', 'misleading', 'spam', 'privacy_violation', 'impersonation', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'under_review', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TABLE "oauth_client_report" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"client_id" text NOT NULL,
	"reason" "report_reason" NOT NULL,
	"description" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"resolved_at" timestamp,
	"resolved_by_id" text,
	"resolution_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oauth_client_report" ADD CONSTRAINT "oauth_client_report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_client_report" ADD CONSTRAINT "oauth_client_report_client_id_oauth_client_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."oauth_client"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_client_report" ADD CONSTRAINT "oauth_client_report_resolved_by_id_user_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "report_reporter_idx" ON "oauth_client_report" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "report_client_idx" ON "oauth_client_report" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "report_status_idx" ON "oauth_client_report" USING btree ("status");