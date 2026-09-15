-- Preserve activity history when a user is deleted.
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_fkey";
ALTER TABLE "activity_logs" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
