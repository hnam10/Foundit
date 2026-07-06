-- CreateTable
CREATE TABLE "photo_upload_session" (
    "session_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "created_by" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_upload_session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "photo_session_image" (
    "image_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(10) NOT NULL,
    "file_size_kb" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_session_image_pkey" PRIMARY KEY ("image_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_upload_session_token_key" ON "photo_upload_session"("token");

-- CreateIndex
CREATE INDEX "photo_upload_session_created_by_idx" ON "photo_upload_session"("created_by");

-- CreateIndex
CREATE INDEX "photo_session_image_session_id_idx" ON "photo_session_image"("session_id");

-- AddForeignKey
ALTER TABLE "photo_upload_session" ADD CONSTRAINT "photo_upload_session_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_session_image" ADD CONSTRAINT "photo_session_image_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "photo_upload_session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;
