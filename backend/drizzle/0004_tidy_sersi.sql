ALTER TABLE "sessionTable" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "userTable" RENAME COLUMN "verifiedAt" TO "verified_at";--> statement-breakpoint
ALTER TABLE "userTable" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "userTable" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "verificationTable" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
DROP INDEX "user_email_idx";