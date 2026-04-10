ALTER TABLE "sessionTable" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "sessionTable" RENAME COLUMN "userAgent" TO "user_Agent";--> statement-breakpoint
ALTER TABLE "sessionTable" RENAME COLUMN "ipAddress" TO "ip_address";--> statement-breakpoint
ALTER TABLE "sessionTable" DROP CONSTRAINT "sessionTable_userId_userTable_id_fk";
--> statement-breakpoint
DROP INDEX "userId_idx";--> statement-breakpoint
ALTER TABLE "sessionTable" ADD CONSTRAINT "sessionTable_user_id_userTable_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."userTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_user_Id_idx" ON "sessionTable" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_user_id_idx" ON "verificationTable" USING btree ("userId");