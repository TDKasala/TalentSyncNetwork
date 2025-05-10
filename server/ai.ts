import { storage } from './storage';
import { CandidateProfile, Job, User } from '@shared/schema';

interface SkillMatch {
  score: number;
  matchedSkills: string[];
  totalSkills: number;
}

interface LocationMatch {
  score: number;
  distance: number | null;
}

interface ExperienceMatch {
  score: number;
  years: number | null;
}

interface MatchResult {
  jobId: number;
  candidateId: number;
  recruiterId: number;
  overallScore: number;
  skillsScore: number;
  locationScore: number;
  experienceScore: number;
  matchedSkills: string[];
}

// In a production environment, this would be replaced with actual NLP processing
// using Hugging Face's BERT or similar models for sophisticated matching
export async function matchCandidateToJobs(candidateId: number): Promise<MatchResult[]> {
  // Get candidate profile
  const candidate = await storage.getUser(candidateId);
  if (!candidate || candidate.role !== 'candidate') {
    return [];
  }
  
  const candidateProfile = await storage.getCandidateProfile(candidateId);
  if (!candidateProfile) {
    return [];
  }
  
  // Get all active jobs
  const allJobs = await storage.getJobs({ limit: 100 });
  
  // Calculate match scores
  const matchResults: MatchResult[] = [];
  
  for (const job of allJobs) {
    // Check if a match already exists
    const existingMatches = await storage.getMatchesByCandidate(candidateId);
    if (existingMatches.some(match => match.jobId === job.id)) {
      continue;
    }
    
    // Calculate match scores
    const skillsMatch = calculateSkillsMatch(candidateProfile, job);
    const locationMatch = calculateLocationMatch(candidateProfile, job);
    const experienceMatch = calculateExperienceMatch(candidateProfile, job);
    
    // Weight the scores (80% skills, 10% location, 10% experience)
    const overallScore = Math.round(
      (skillsMatch.score * 0.8) + 
      (locationMatch.score * 0.1) + 
      (experienceMatch.score * 0.1)
    );
    
    // Only include matches with a score above a certain threshold (e.g., 60%)
    if (overallScore >= 60) {
      matchResults.push({
        jobId: job.id,
        candidateId,
        recruiterId: job.recruiterId,
        overallScore,
        skillsScore: skillsMatch.score,
        locationScore: locationMatch.score,
        experienceScore: experienceMatch.score,
        matchedSkills: skillsMatch.matchedSkills
      });
    }
  }
  
  // Sort by score (highest first)
  return matchResults.sort((a, b) => b.overallScore - a.overallScore);
}

// Match jobs to a candidate
export async function matchJobsToCandidates(jobId: number): Promise<MatchResult[]> {
  // Get job details
  const job = await storage.getJob(jobId);
  if (!job) {
    return [];
  }
  
  // Get all candidates
  const allUsers = await getAllCandidates();
  
  // Calculate match scores
  const matchResults: MatchResult[] = [];
  
  for (const candidate of allUsers) {
    // Get candidate profile
    const candidateProfile = await storage.getCandidateProfile(candidate.id);
    if (!candidateProfile) {
      continue;
    }
    
    // Check if a match already exists
    const existingMatches = await storage.getMatchesByCandidate(candidate.id);
    if (existingMatches.some(match => match.jobId === job.id)) {
      continue;
    }
    
    // Calculate match scores
    const skillsMatch = calculateSkillsMatch(candidateProfile, job);
    const locationMatch = calculateLocationMatch(candidateProfile, job);
    const experienceMatch = calculateExperienceMatch(candidateProfile, job);
    
    // Weight the scores (80% skills, 10% location, 10% experience)
    const overallScore = Math.round(
      (skillsMatch.score * 0.8) + 
      (locationMatch.score * 0.1) + 
      (experienceMatch.score * 0.1)
    );
    
    // Only include matches with a score above a certain threshold (e.g., 60%)
    if (overallScore >= 60) {
      matchResults.push({
        jobId,
        candidateId: candidate.id,
        recruiterId: job.recruiterId,
        overallScore,
        skillsScore: skillsMatch.score,
        locationScore: locationMatch.score,
        experienceScore: experienceMatch.score,
        matchedSkills: skillsMatch.matchedSkills
      });
    }
  }
  
  // Sort by score (highest first)
  return matchResults.sort((a, b) => b.overallScore - a.overallScore);
}

// Helper function to calculate skills match
function calculateSkillsMatch(candidateProfile: CandidateProfile, job: Job): SkillMatch {
  if (!candidateProfile.skills || !job.skills || candidateProfile.skills.length === 0 || job.skills.length === 0) {
    return { score: 0, matchedSkills: [], totalSkills: 0 };
  }
  
  // Normalize skills (lowercase, trim)
  const candidateSkills = candidateProfile.skills.map(skill => skill.toLowerCase().trim());
  const jobSkills = job.skills.map(skill => skill.toLowerCase().trim());
  
  // Find matching skills
  const matchedSkills = candidateSkills.filter(skill => 
    jobSkills.some(jobSkill => jobSkill === skill || jobSkill.includes(skill) || skill.includes(jobSkill))
  );
  
  // Calculate score based on the percentage of job skills matched
  const score = Math.round((matchedSkills.length / jobSkills.length) * 100);
  
  return {
    score,
    matchedSkills,
    totalSkills: jobSkills.length
  };
}

// Helper function to calculate location match
function calculateLocationMatch(candidateProfile: CandidateProfile, job: Job): LocationMatch {
  if (!candidateProfile.userId || !job.location) {
    return { score: 0, distance: null };
  }
  
  // In a real system, we'd use geocoding and distance calculation
  // For this implementation, simple string matching will suffice
  
  // Check if locations are exactly the same
  if (candidateProfile.location === job.location) {
    return { score: 100, distance: 0 };
  }
  
  // Check for partial matches (e.g., "Cape Town" and "Cape Town, South Africa")
  if (candidateProfile.location && 
     (candidateProfile.location.includes(job.location) || job.location.includes(candidateProfile.location))) {
    return { score: 80, distance: null };
  }
  
  // Check if the job is remote
  if (job.remoteOk) {
    return { score: 70, distance: null };
  }
  
  // No match
  return { score: 0, distance: null };
}

// Helper function to calculate experience match
function calculateExperienceMatch(candidateProfile: CandidateProfile, job: Job): ExperienceMatch {
  if (candidateProfile.yearsOfExperience === undefined || candidateProfile.yearsOfExperience === null) {
    return { score: 50, years: null }; // Neutral score if no experience data
  }
  
  // In a real system, we would parse the job description to extract required experience
  // For this implementation, we'll use a simple heuristic based on candidate experience
  
  const years = candidateProfile.yearsOfExperience;
  
  if (years < 1) {
    return { score: 20, years };
  } else if (years < 3) {
    return { score: 60, years };
  } else if (years < 5) {
    return { score: 80, years };
  } else {
    return { score: 100, years };
  }
}

// Helper function to get all candidate users
async function getAllCandidates(): Promise<User[]> {
  // In a production environment, this would query the database directly
  // For the in-memory implementation, we need to get all users and filter
  
  // Note: This is a placeholder - in a real app, we'd use proper DB queries
  const users: User[] = [];
  
  // Loop through user IDs
  for (let i = 1; i <= 100; i++) {
    const user = await storage.getUser(i);
    if (user && user.role === 'candidate') {
      users.push(user);
    }
  }
  
  return users;
}

// Create matches in the database based on matching algorithm results
export async function createMatchesFromResults(matchResults: MatchResult[]): Promise<void> {
  for (const result of matchResults) {
    await storage.createMatch({
      jobId: result.jobId,
      candidateId: result.candidateId,
      recruiterId: result.recruiterId,
      score: result.overallScore,
      unlockedByCandidate: false,
      unlockedByRecruiter: false
    });
  }
}

// Parse resume (simulate AI resume parsing)
export async function parseResume(resumeText: string): Promise<{
  skills: string[];
  yearsOfExperience: number | null;
  education: string | null;
}> {
  // This is a placeholder for the actual AI resume parsing
  // In a real implementation, this would use Hugging Face models
  
  // Extract skills based on a predetermined list
  const commonSkills = [
    'javascript', 'typescript', 'react', 'angular', 'vue', 'node.js', 'python',
    'java', 'c#', 'c++', 'php', 'ruby', 'go', 'sql', 'nosql', 'mongodb',
    'postgresql', 'mysql', 'aws', 'azure', 'gcp', 'devops', 'docker',
    'kubernetes', 'git', 'agile', 'scrum', 'project management', 'marketing',
    'sales', 'finance', 'accounting', 'hr', 'recruitment', 'customer service'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );
  
  // Extract years of experience using a simple regex pattern
  let yearsOfExperience = null;
  const expMatch = resumeText.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of)?\s*experience/i);
  if (expMatch && expMatch[1]) {
    yearsOfExperience = parseInt(expMatch[1], 10);
  }
  
  // Extract education (simplified)
  let education = null;
  if (resumeText.includes('Bachelor') || resumeText.includes('B.Sc') || resumeText.includes('BA')) {
    education = 'Bachelor\'s Degree';
  } else if (resumeText.includes('Master') || resumeText.includes('M.Sc') || resumeText.includes('MA')) {
    education = 'Master\'s Degree';
  } else if (resumeText.includes('PhD') || resumeText.includes('Doctorate')) {
    education = 'PhD';
  } else if (resumeText.includes('Diploma') || resumeText.includes('Certificate')) {
    education = 'Diploma/Certificate';
  }
  
  return {
    skills: foundSkills,
    yearsOfExperience,
    education
  };
}

// Generate B-BBEE analytics for a company
export async function generateBBBEEAnalytics(companyId: number): Promise<{
  totalCandidates: number;
  demographicBreakdown: {
    black: number;
    white: number;
    coloured: number;
    indian: number;
    asian: number;
    other: number;
    preferNotToSay: number;
  };
  genderBreakdown: {
    male: number;
    female: number;
    nonBinary: number;
    other: number;
    preferNotToSay: number;
  };
  disabilityPercentage: number;
}> {
  // In a real system, this would query the database for actual analytics
  // This is a placeholder implementation
  
  return {
    totalCandidates: 125,
    demographicBreakdown: {
      black: 65,
      white: 25,
      coloured: 15,
      indian: 10,
      asian: 5,
      other: 3,
      preferNotToSay: 2
    },
    genderBreakdown: {
      male: 60,
      female: 55,
      nonBinary: 3,
      other: 2,
      preferNotToSay: 5
    },
    disabilityPercentage: 4
  };
}
