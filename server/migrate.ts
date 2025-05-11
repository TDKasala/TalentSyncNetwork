import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { neon, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is missing');
  process.exit(1);
}

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Configure neon for serverless environments
    neonConfig.fetchConnectionCache = true;
    
    // Create a Postgres client using neon
    const client = neon(process.env.DATABASE_URL!);
    
    // Create a drizzle instance
    const db = drizzle(client);
    
    // Run migrations
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();