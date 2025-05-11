#!/bin/bash

# Ensure environment variables are loaded
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create it with your DATABASE_URL"
  exit 1
fi

# Run the seed script
echo "Seeding database with initial data..."
NODE_ENV=production tsx server/seedData.ts

echo "Database seeding completed!"