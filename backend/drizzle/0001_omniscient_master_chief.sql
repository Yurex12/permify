CREATE TABLE "sessionTable" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"userAgent" text,
	"ipAddress" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "userTable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(225) NOT NULL,
	"email" varchar(225) NOT NULL,
	"password" varchar(225) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userTable_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "category" CASCADE;--> statement-breakpoint
DROP TABLE "postCategory" CASCADE;--> statement-breakpoint
DROP TABLE "post" CASCADE;--> statement-breakpoint
DROP TABLE "userPreferencesTable" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
ALTER TABLE "sessionTable" ADD CONSTRAINT "sessionTable_userId_userTable_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "userId_idx" ON "sessionTable" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "userTable" USING btree ("email");--> statement-breakpoint
DROP TYPE "public"."userRole";