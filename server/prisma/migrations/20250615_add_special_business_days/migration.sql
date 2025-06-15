-- Alter Table to add specialBusinessDays column and convert businessHours to JSONB
ALTER TABLE "Store"
ADD COLUMN IF NOT EXISTS "specialBusinessDays" JSONB;

-- Convert existing businessHours TEXT column to JSONB if needed
ALTER TABLE "Store"
ALTER COLUMN "businessHours" TYPE JSONB USING
  CASE
    WHEN "businessHours" IS NULL OR "businessHours" = '' THEN '[]'::jsonb
    ELSE "businessHours"::jsonb
  END; 