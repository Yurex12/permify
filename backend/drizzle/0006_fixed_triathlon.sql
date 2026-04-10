CREATE TABLE "PasswordResetTable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" char(6) NOT NULL,
	"userId" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessionTable" RENAME COLUMN "user_Agent" TO "user_agent";--> statement-breakpoint
ALTER TABLE "PasswordResetTable" ADD CONSTRAINT "PasswordResetTable_userId_userTable_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "password_reset_user_id_idx" ON "PasswordResetTable" USING btree ("userId");