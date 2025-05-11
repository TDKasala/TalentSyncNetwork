# TalentSyncZA: Supabase & Vercel Deployment Guide

This guide will walk you through connecting your TalentSyncZA application to Supabase and deploying it to Vercel.

## Step 1: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
   - Click "New Project"
   - Enter "TalentSyncZA" as your project name
   - Set a secure database password (save this for later)
   - Choose the region closest to your target users (e.g., South Africa)
   - Click "Create new project"

2. **Get Your Connection String**
   - Once your project is created, go to Project Settings
   - Navigate to "Database" tab
   - Scroll down to "Connection string" section
   - Select "URI" format
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with the database password you set earlier

3. **Update Your .env File**
   - Open the `.env` file in your project
   - Replace `your_supabase_connection_string_here` with your actual connection string

## Step 2: Initialize Your Database

1. **Run Database Migrations**
   ```bash
   # Generate and apply migrations
   ./migrate-db.sh
   
   # Seed the database with initial data
   ./seed-db.sh
   ```

2. **Verify Database Setup**
   - Go to Supabase Dashboard
   - Navigate to your TalentSyncZA project
   - Select "Table Editor" from the left sidebar
   - Verify that all your tables are created and populated

## Step 3: Configure for Local Development

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Verify Supabase Connection**
   - Check the console output for any database connection errors
   - Visit your app in the browser to ensure it's working with Supabase

## Step 4: Deploy to Vercel

1. **Create a Vercel Account & Project**
   - Go to [Vercel](https://vercel.com) and sign up or log in
   - Create a new project and connect it to your GitHub repository
   - Set project name to "talentsyncza"

2. **Configure Environment Variables**
   - In Vercel project settings, navigate to "Environment Variables"
   - Add the following variables:
     - `DATABASE_URL`: Your Supabase connection string
     - `JWT_SECRET`: A secure random string for JWT authentication
     - `PAYFAST_MERCHANT_ID`: Your PayFast merchant ID
     - `PAYFAST_MERCHANT_KEY`: Your PayFast merchant key
     - `PAYFAST_PASSPHRASE`: Your PayFast passphrase

3. **Deploy Settings**
   - Framework Preset: Select "Other"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Vercel will provide you with a deployment URL (e.g., talentsyncza.vercel.app)

## Step 5: Post-Deployment Verification

1. **Test Your Deployed Application**
   - Visit your Vercel deployment URL
   - Verify all features are working correctly with Supabase

2. **Set Up Custom Domain (Optional)**
   - In Vercel project settings, navigate to "Domains"
   - Add your custom domain and follow the verification steps

## Troubleshooting Common Issues

### Database Connection Errors
- Verify your DATABASE_URL is correctly formatted
- Check that your IP is allowed in Supabase's database settings
- Enable "Trusted Sources" in Supabase if you're getting connection errors

### Migration Failures
- Check that your schema in `shared/schema.ts` is correct
- Look for any incompatibilities between your schema and PostgreSQL
- Run `npx drizzle-kit generate` manually to debug migration issues

### Deployment Failures
- Check Vercel build logs for errors
- Verify all environment variables are set correctly
- Ensure your package.json scripts are correctly configured

## Maintenance

- **Updating Database Schema**
  1. Update `shared/schema.ts` with your changes
  2. Run `./migrate-db.sh` to apply changes
  3. Redeploy to Vercel

- **Adding Seed Data**
  1. Update `server/seedData.ts` with new seed data
  2. Run `./seed-db.sh` to apply changes