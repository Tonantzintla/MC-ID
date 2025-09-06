CREATE TABLE "users" (
	"mcid" char(32) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_mcid_unique" UNIQUE("mcid")
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"cuid" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"name" varchar(128) NOT NULL,
	"website" varchar(512) NOT NULL,
	"description" varchar(512),
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apps_secret_unique" UNIQUE("secret")
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" char(6) NOT NULL,
	"expiration" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_user_id_users_mcid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("mcid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_user_id_users_mcid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("mcid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_app_id_apps_cuid_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("cuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "app_user_idx" ON "verification_codes" USING btree ("app_id","user_id");