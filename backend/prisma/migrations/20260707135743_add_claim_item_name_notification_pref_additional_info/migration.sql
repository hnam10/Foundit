-- CreateEnum
CREATE TYPE "claim_notification_preference" AS ENUM ('email', 'phone', 'email_and_phone');

-- AlterTable
ALTER TABLE "claim" ADD COLUMN     "additional_info" TEXT,
ADD COLUMN     "item_name" VARCHAR(100),
ADD COLUMN     "notification_preference" "claim_notification_preference" NOT NULL DEFAULT 'email';
