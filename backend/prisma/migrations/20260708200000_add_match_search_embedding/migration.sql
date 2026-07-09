-- Add normalized search text and embedding vectors for semantic matching.
ALTER TABLE "item" ADD COLUMN "search_text" TEXT;
ALTER TABLE "item" ADD COLUMN "embedding" JSONB;

ALTER TABLE "claim" ADD COLUMN "search_text" TEXT;
ALTER TABLE "claim" ADD COLUMN "embedding" JSONB;
