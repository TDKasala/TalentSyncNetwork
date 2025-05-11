# TalentSyncZA

TalentSyncZA is an AI-driven recruitment platform for South Africa connecting job seekers and recruiters through private, skills-based matching with POPIA and B-BBEE compliance.

## Features

- AI-powered job matching algorithms
- Skills assessment and verification with badge rewards
- B-BBEE compliance reporting
- POPIA-compliant data handling
- PayFast payment integration
- Multi-language support for South African languages
- Resume optimization through ATSBoost.co.za

### Skills Assessment Feature

The Skills Assessment system allows candidates to verify their skills through interactive assessments:

- Take skill-specific assessments with multiple-choice questions
- Earn skill badges upon successful completion
- Display earned badges on candidate profiles
- Track assessment history and performance
- Admin panel for creating and managing assessments

#### UI/UX Features

The Skills Assessment interface includes:

- Responsive design for mobile, tablet, and desktop
- Interactive question navigation
- Visual progress tracking
- Animated success/failure states
- Detailed result screens with performance metrics
- Badge showcase with animations

## Tech Stack

- Frontend: React, TailwindCSS, shadcn/ui
- Backend: Node.js, Express
- Database: PostgreSQL (via Supabase)
- ORM: Drizzle ORM
- Authentication: JWT
- Form Handling: React Hook Form, Zod
- State Management: TanStack Query

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (or Supabase account)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and update with your credentials
4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## License

MIT