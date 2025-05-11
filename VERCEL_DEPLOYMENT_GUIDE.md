# Deploying TalentSyncZA to Vercel

This guide walks you through the steps to deploy your TalentSyncZA application to Vercel.

## Prerequisites

- A Vercel account (create one at [vercel.com](https://vercel.com))
- Git repository with your code (GitHub, GitLab, or Bitbucket)
- Your database connection string (from Supabase or similar PostgreSQL provider)

## Deployment Steps

### 1. Connect Your Repository to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your repository from GitHub, GitLab, or Bitbucket
4. Select the TalentSyncZA repository

### 2. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

- `DATABASE_URL`: Your PostgreSQL connection string
- Any other secret keys your application uses (JWT_SECRET, etc.)

### 3. Configure Build Settings

These settings should be automatically detected, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Deploy

Click "Deploy" and wait for the build process to complete. Vercel will provide you with a deployment URL when finished.

### 5. Custom Domain (Optional)

1. In your Vercel project, navigate to "Settings" > "Domains"
2. Add your custom domain and follow the verification steps

## Troubleshooting

If you encounter issues:

- Check that all environment variables are correctly set
- Verify that your database is accessible from Vercel's servers
- Review build logs for specific errors

## Important Notes

- The application uses a PostgreSQL database which should be accessible from Vercel
- Make sure your database connection string uses the correct format for Vercel deployment
- The Vercel deployment will use the files defined in `vercel.json` for routing and build configuration