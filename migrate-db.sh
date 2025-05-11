#!/bin/bash

# Generate migrations
echo "Generating migrations..."
npx drizzle-kit generate:pg

# Apply migrations
echo "Applying migrations..."
npx tsx server/migrate.ts

echo "Migration process completed!"