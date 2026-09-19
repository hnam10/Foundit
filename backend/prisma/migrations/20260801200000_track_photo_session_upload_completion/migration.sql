ALTER TABLE "photo_session_image"
ADD COLUMN "uploaded_at" TIMESTAMP(3);

-- Rows created before this migration were already exposed as uploaded images.
UPDATE "photo_session_image"
SET "uploaded_at" = "created_at";

CREATE INDEX "photo_session_image_uploaded_at_created_at_idx"
ON "photo_session_image"("uploaded_at", "created_at");
