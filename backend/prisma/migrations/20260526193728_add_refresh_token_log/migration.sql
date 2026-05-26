-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('student', 'security', 'admin');

-- CreateEnum
CREATE TYPE "item_status" AS ENUM ('pending_report', 'stored', 'claimed', 'expired', 'disposed');

-- CreateEnum
CREATE TYPE "claim_status" AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'picked_up');

-- CreateEnum
CREATE TYPE "found_report_status" AS ENUM ('submitted', 'processed', 'linked_to_item');

-- CreateEnum
CREATE TYPE "match_status" AS ENUM ('suggested', 'confirmed', 'rejected', 'dismissed');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('claim_status_update', 'match_found', 'item_expiring', 'report_confirmation');

-- CreateEnum
CREATE TYPE "email_delivery_status" AS ENUM ('not_sent', 'sent', 'delivered', 'failed');

-- CreateTable
CREATE TABLE "campus" (
    "campus_id" UUID NOT NULL,
    "campus_name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255),
    "retention_days" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "campus_pkey" PRIMARY KEY ("campus_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" UUID NOT NULL,
    "campus_id" UUID,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "student_number" BIGINT,
    "employee_id" VARCHAR(12),
    "phone" VARCHAR(10),
    "email_notification_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "report_link" (
    "link_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "generated_by" UUID NOT NULL,
    "campus_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_link_pkey" PRIMARY KEY ("link_id")
);

-- CreateTable
CREATE TABLE "found_item_report" (
    "report_id" UUID NOT NULL,
    "report_link_id" UUID NOT NULL,
    "finder_id" UUID NOT NULL,
    "item_description" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "location_found" VARCHAR(100) NOT NULL,
    "date_found" DATE NOT NULL,
    "time_found" TIME,
    "additional_notes" TEXT,
    "status" "found_report_status" NOT NULL DEFAULT 'submitted',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "found_item_report_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "item" (
    "item_id" UUID NOT NULL,
    "campus_id" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description_public" VARCHAR(255),
    "description_internal" TEXT,
    "color" VARCHAR(30),
    "brand" VARCHAR(50),
    "location_found" VARCHAR(255),
    "date_found" DATE NOT NULL,
    "status" "item_status" NOT NULL DEFAULT 'pending_report',
    "found_item_report_id" UUID,
    "registered_by" UUID NOT NULL,
    "retention_expiry_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "claim" (
    "claim_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "item_id" UUID,
    "category" VARCHAR(50) NOT NULL,
    "campus_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "date_lost" DATE,
    "location_lost" VARCHAR(255),
    "status" "claim_status" NOT NULL DEFAULT 'submitted',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "picked_up_at" TIMESTAMP(3),
    "verified_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_pkey" PRIMARY KEY ("claim_id")
);

-- CreateTable
CREATE TABLE "item_image" (
    "image_id" UUID NOT NULL,
    "item_id" UUID,
    "claim_id" UUID,
    "image_url" VARCHAR(500) NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "file_type" VARCHAR(10) NOT NULL,
    "file_size_kb" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_image_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "match_suggestion" (
    "match_id" UUID NOT NULL,
    "claim_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "match_score" DECIMAL(5,2) NOT NULL,
    "match_criteria" TEXT,
    "status" "match_status" NOT NULL DEFAULT 'suggested',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_suggestion_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "notification_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "email_sent_at" TIMESTAMP(3),
    "email_delivery_status" "email_delivery_status" NOT NULL DEFAULT 'not_sent',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "refresh_token_log" (
    "log_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "log_id" UUID NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "details" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campus_campus_name_key" ON "campus"("campus_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_student_number_key" ON "user"("student_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_employee_id_key" ON "user"("employee_id");

-- CreateIndex
CREATE INDEX "user_campus_id_idx" ON "user"("campus_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_link_token_key" ON "report_link"("token");

-- CreateIndex
CREATE INDEX "item_campus_id_idx" ON "item"("campus_id");

-- CreateIndex
CREATE INDEX "item_category_idx" ON "item"("category");

-- CreateIndex
CREATE INDEX "item_status_idx" ON "item"("status");

-- CreateIndex
CREATE INDEX "item_date_found_idx" ON "item"("date_found");

-- CreateIndex
CREATE INDEX "item_retention_expiry_date_idx" ON "item"("retention_expiry_date");

-- CreateIndex
CREATE INDEX "claim_student_id_idx" ON "claim"("student_id");

-- CreateIndex
CREATE INDEX "claim_item_id_idx" ON "claim"("item_id");

-- CreateIndex
CREATE INDEX "claim_campus_id_idx" ON "claim"("campus_id");

-- CreateIndex
CREATE INDEX "claim_status_idx" ON "claim"("status");

-- CreateIndex
CREATE INDEX "claim_reviewed_by_idx" ON "claim"("reviewed_by");

-- CreateIndex
CREATE UNIQUE INDEX "match_suggestion_claim_id_item_id_key" ON "match_suggestion"("claim_id", "item_id");

-- CreateIndex
CREATE INDEX "notification_recipient_id_idx" ON "notification"("recipient_id");

-- CreateIndex
CREATE INDEX "notification_recipient_id_is_read_idx" ON "notification"("recipient_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_log_token_hash_key" ON "refresh_token_log"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_log_user_id_idx" ON "refresh_token_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log"("actor_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campus"("campus_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_link" ADD CONSTRAINT "report_link_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_link" ADD CONSTRAINT "report_link_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campus"("campus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_item_report" ADD CONSTRAINT "found_item_report_report_link_id_fkey" FOREIGN KEY ("report_link_id") REFERENCES "report_link"("link_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_item_report" ADD CONSTRAINT "found_item_report_finder_id_fkey" FOREIGN KEY ("finder_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campus"("campus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_found_item_report_id_fkey" FOREIGN KEY ("found_item_report_id") REFERENCES "found_item_report"("report_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campus"("campus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_image" ADD CONSTRAINT "item_image_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_image" ADD CONSTRAINT "item_image_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claim"("claim_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_image" ADD CONSTRAINT "item_image_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_suggestion" ADD CONSTRAINT "match_suggestion_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claim"("claim_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_suggestion" ADD CONSTRAINT "match_suggestion_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_suggestion" ADD CONSTRAINT "match_suggestion_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token_log" ADD CONSTRAINT "refresh_token_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
