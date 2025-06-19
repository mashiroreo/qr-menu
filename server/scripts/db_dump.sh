#!/usr/bin/env bash
set -e

# Create dumps directory if not exists
mkdir -p dumps

# Export schema diff (for Prisma/SQLite). Adjust command for your DB engine if needed.
TIMESTAMP=$(date +"%Y%m%d_%H%M")
FILE="dumps/${TIMESTAMP}_schema.sql"

npx prisma db pull > /dev/null
npx prisma migrate diff --script > "$FILE"

echo "Prisma schema dump saved to $FILE" 