import type { Express, Request as ExpressRequest, Response } from "express";
import { User } from "@shared/schema";

// Extend the Request type to include user property
interface Request extends ExpressRequest {
  user?: User;
  file?: Express.Multer.File;
}
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { login, register, verifyToken } from "./auth";
import { createPaymentUrl, verifyPaymentNotification } from "./payfast";
import { matchCandidateToJobs, matchJobsToCandidates, createMatchesFromResults, parseResume, generateBBBEEAnalytics } from "./ai";
import { z, ZodError } from "zod";
import { 
  insertUserSchema, 
  insertCandidateProfileSchema, 
  insertCompanyProfileSchema, 
  insertJobSchema,
  insertAtsReferralSchema,
  insertSkillAssessmentSchema,
  insertAssessmentQuestionSchema,
  insertAssessmentAttemptSchema,
  insertSkillBadgeSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  const user = await storage.getUser(payload.userId);
  
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  req.user = user;
  next();
};

// Admin authentication middleware
const authenticateAdmin = async (req: Request, res: Response, next: Function) => {
  await authenticate(req, res, () => {
    // Check if user has admin role (admin role may be "admin" in the future)
    // For now, allow only "recruiter" role to access admin functions
    if (req.user?.role !== "recruiter") {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

// Helper function to format Zod validation errors
const formatZodError = (error: ZodError) => {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
};

// Configure multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), 'uploads'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API routes with /api prefix
  
  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const result = await login(email, password);
    
    if (!result) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const { user, token } = result;
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileComplete: user.profileComplete
      }
    });
  });
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationResult.error.format() 
        });
      }
      
      const { 
        email, password, firstName, lastName, role, 
        whatsappNumber, location, language, consentGiven 
      } = validationResult.data;
      
      const result = await register(
        email, password, firstName, lastName, role as 'candidate' | 'recruiter',
        whatsappNumber, location, language as 'english' | 'afrikaans' | 'zulu',
        consentGiven
      );
      
      if (!result) {
        return res.status(409).json({ message: 'User already exists' });
      }
      
      const { user, token } = result;
      
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileComplete: user.profileComplete
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
  
  app.get('/api/auth/me', authenticate, async (req, res) => {
    const user = req.user;
    
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileComplete: user.profileComplete,
      language: user.language
    });
  });
  
  // Profile routes
  app.post('/api/profiles/candidate', authenticate, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can create candidate profiles' });
    }
    
    try {
      // Check if profile already exists
      const existingProfile = await storage.getCandidateProfile(user.id);
      
      if (existingProfile) {
        return res.status(409).json({ message: 'Profile already exists' });
      }
      
      // Validate request body
      const validationResult = insertCandidateProfileSchema.safeParse({
        ...req.body,
        userId: user.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationResult.error.format() 
        });
      }
      
      const profile = await storage.createCandidateProfile(validationResult.data);
      
      // Update user profile completion status
      await storage.updateUser(user.id, { profileComplete: true });
      
      res.status(201).json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error creating candidate profile' });
    }
  });
  
  app.get('/api/profiles/candidate', authenticate, async (req, res) => {
    const user = req.user;
    
    try {
      const profile = await storage.getCandidateProfile(user.id);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching candidate profile' });
    }
  });
  
  app.put('/api/profiles/candidate', authenticate, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can update candidate profiles' });
    }
    
    try {
      const profile = await storage.getCandidateProfile(user.id);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      const updatedProfile = await storage.updateCandidateProfile(user.id, req.body);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error updating candidate profile' });
    }
  });
  
  app.post('/api/profiles/company', authenticate, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can create company profiles' });
    }
    
    try {
      // Check if profile already exists
      const existingProfile = await storage.getCompanyProfile(user.id);
      
      if (existingProfile) {
        return res.status(409).json({ message: 'Profile already exists' });
      }
      
      // Validate request body
      const validationResult = insertCompanyProfileSchema.safeParse({
        ...req.body,
        userId: user.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationResult.error.format() 
        });
      }
      
      const profile = await storage.createCompanyProfile(validationResult.data);
      
      // Update user profile completion status
      await storage.updateUser(user.id, { profileComplete: true });
      
      res.status(201).json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error creating company profile' });
    }
  });
  
  app.get('/api/profiles/company', authenticate, async (req, res) => {
    const user = req.user;
    
    try {
      const profile = await storage.getCompanyProfile(user.id);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching company profile' });
    }
  });
  
  app.put('/api/profiles/company', authenticate, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can update company profiles' });
    }
    
    try {
      const profile = await storage.getCompanyProfile(user.id);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      const updatedProfile = await storage.updateCompanyProfile(user.id, req.body);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error updating company profile' });
    }
  });
  
  // Job routes
  app.post('/api/jobs', authenticate, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can create jobs' });
    }
    
    try {
      // Check if the recruiter has a company profile
      const companyProfile = await storage.getCompanyProfile(user.id);
      
      if (!companyProfile) {
        return res.status(400).json({ message: 'You must create a company profile first' });
      }
      
      // Validate request body
      const validationResult = insertJobSchema.safeParse({
        ...req.body,
        recruiterId: user.id,
        companyId: companyProfile.id
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationResult.error.format() 
        });
      }
      
      const job = await storage.createJob(validationResult.data);
      
      // Run matching algorithm to find suitable candidates
      const matchResults = await matchJobsToCandidates(job.id);
      
      // Create matches in the database
      if (matchResults.length > 0) {
        await createMatchesFromResults(matchResults);
      }
      
      res.status(201).json(job);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error creating job' });
    }
  });
  
  app.get('/api/jobs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const search = req.query.search as string | undefined;
      
      const jobs = await storage.getJobs({ limit, offset, search });
      
      res.json(jobs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching jobs' });
    }
  });
  
  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid job ID' });
      }
      
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      res.json(job);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching job' });
    }
  });
  
  app.get('/api/recruiter/jobs', authenticate, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can access this endpoint' });
    }
    
    try {
      const jobs = await storage.getJobsByRecruiter(user.id);
      
      res.json(jobs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching recruiter jobs' });
    }
  });
  
  app.put('/api/jobs/:id', authenticate, async (req, res) => {
    const user = req.user;
    const jobId = parseInt(req.params.id);
    
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can update jobs' });
    }
    
    try {
      if (isNaN(jobId)) {
        return res.status(400).json({ message: 'Invalid job ID' });
      }
      
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      if (job.recruiterId !== user.id) {
        return res.status(403).json({ message: 'You can only update your own jobs' });
      }
      
      const updatedJob = await storage.updateJob(jobId, req.body);
      
      res.json(updatedJob);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error updating job' });
    }
  });
  
  // Match routes
  app.get('/api/matches/candidate', authenticate, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can access this endpoint' });
    }
    
    try {
      const matches = await storage.getMatchesByCandidate(user.id);
      
      // Fetch job details for each match
      const matchesWithJobDetails = await Promise.all(
        matches.map(async (match) => {
          const job = await storage.getJob(match.jobId);
          return {
            ...match,
            job: job || { title: 'Unknown Job' }
          };
        })
      );
      
      res.json(matchesWithJobDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching candidate matches' });
    }
  });
  
  app.get('/api/matches/recruiter', authenticate, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can access this endpoint' });
    }
    
    try {
      const matches = await storage.getMatchesByRecruiter(user.id);
      
      // Fetch job and candidate details for each match
      const matchesWithDetails = await Promise.all(
        matches.map(async (match) => {
          const job = await storage.getJob(match.jobId);
          const candidate = await storage.getUser(match.candidateId);
          
          return {
            ...match,
            job: job || { title: 'Unknown Job' },
            candidate: candidate ? {
              id: candidate.id,
              firstName: match.unlockedByRecruiter ? candidate.firstName : 'Anonymous',
              lastName: match.unlockedByRecruiter ? candidate.lastName : 'Candidate'
            } : { id: 0, firstName: 'Unknown', lastName: 'Candidate' }
          };
        })
      );
      
      res.json(matchesWithDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error fetching recruiter matches' });
    }
  });
  
  // Endpoint to get a specific match by ID
  app.get('/api/matches/:id', authenticate, async (req, res) => {
    const matchId = parseInt(req.params.id);
    const user = req.user;
    
    if (isNaN(matchId)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    try {
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Check if the user is authorized to access this match
      if (user.id !== match.candidateId && user.id !== match.recruiterId) {
        return res.status(403).json({ message: 'Not authorized to access this match' });
      }
      
      // Fetch job details to include with the match
      const job = await storage.getJob(match.jobId);
      
      // Fetch user details based on role
      let details = {};
      
      if (user.role === 'candidate') {
        const recruiter = await storage.getUser(match.recruiterId);
        
        // If unlocked, include recruiter details
        if (match.unlockedByCandidate) {
          const company = await storage.getCompanyProfile(match.recruiterId);
          details = {
            recruiter: recruiter ? {
              id: recruiter.id,
              firstName: recruiter.firstName,
              lastName: recruiter.lastName,
              email: recruiter.email,
              whatsappNumber: recruiter.whatsappNumber
            } : null,
            company: company || null
          };
        }
      } else {
        const candidate = await storage.getUser(match.candidateId);
        
        // If unlocked, include candidate details
        if (match.unlockedByRecruiter) {
          const candidateProfile = await storage.getCandidateProfile(match.candidateId);
          details = {
            candidate: candidate ? {
              id: candidate.id,
              firstName: candidate.firstName,
              lastName: candidate.lastName,
              email: candidate.email,
              whatsappNumber: candidate.whatsappNumber
            } : null,
            profile: candidateProfile || null
          };
        }
      }
      
      res.json({
        ...match,
        job: job || { title: 'Unknown Job' },
        ...details
      });
    } catch (error) {
      console.error('Error fetching match:', error);
      res.status(500).json({ message: 'Server error fetching match details' });
    }
  });
  
  app.post('/api/matches/unlock/:id', authenticate, async (req, res) => {
    const user = req.user;
    const matchId = parseInt(req.params.id);
    
    try {
      if (isNaN(matchId)) {
        return res.status(400).json({ message: 'Invalid match ID' });
      }
      
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Check if the user is part of this match
      if (user.id !== match.candidateId && user.id !== match.recruiterId) {
        return res.status(403).json({ message: 'You are not authorized to access this match' });
      }
      
      // Check if the user has already unlocked the match
      if ((user.id === match.candidateId && match.unlockedByCandidate) || 
          (user.id === match.recruiterId && match.unlockedByRecruiter)) {
        return res.status(400).json({ message: 'You have already unlocked this match' });
      }
      
      // Get the user by ID for payment info
      const userObj = await storage.getUser(user.id);
      
      if (!userObj) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Calculate the amount based on user role
      const amount = user.role === 'candidate' ? 50 : 100;
      
      // Generate payment URL
      const { paymentUrl, transactionId } = await createPaymentUrl(
        user.id,
        matchId,
        amount,
        'Match Unlock',
        `Unlock match to view contact details`,
        userObj.email,
        userObj.firstName,
        userObj.lastName,
        `${process.env.APP_URL || 'http://localhost:5000'}/dashboard/payment/success`,
        `${process.env.APP_URL || 'http://localhost:5000'}/dashboard/payment/cancel`
      );
      
      // Include the matchId in the response for client-side storage
      res.json({ paymentUrl, transactionId, matchId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error processing match unlock' });
    }
  });
  
  // Payment routes
  app.post('/api/payments/notify', async (req, res) => {
    try {
      // Process PayFast notification (IPN)
      const pfData = req.body;
      const pfParamString = Object.keys(pfData)
        .filter(key => key !== 'signature')
        .map(key => `${key}=${encodeURIComponent(pfData[key])}`)
        .join('&');
      
      const isValid = await verifyPaymentNotification(pfData, pfParamString);
      
      if (isValid) {
        res.status(200).end();
      } else {
        res.status(400).end();
      }
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  });
  
  // Resume upload
  app.post('/api/resumes/upload', authenticate, upload.single('resume'), async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can upload resumes' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Get the file path
      const filePath = req.file.path;
      
      // In a real application, this would involve:
      // 1. Uploading the file to Supabase Storage
      // 2. Using a PDF parser to extract text
      // 3. Using the AI model to parse the resume contents
      
      // Simulate reading the file and extracting content
      const fileContent = 'Sample resume content with skills like JavaScript, React, Node.js and 5 years of experience. Bachelor of Computer Science from University of Cape Town.';
      
      // Parse the resume using AI
      const parsedResume = await parseResume(fileContent);
      
      // Update the candidate profile with the parsed data
      const candidateProfile = await storage.getCandidateProfile(user.id);
      
      if (!candidateProfile) {
        return res.status(404).json({ message: 'Candidate profile not found' });
      }
      
      // Update the profile with the parsed data
      const updatedProfile = await storage.updateCandidateProfile(user.id, {
        resumeUrl: `/uploads/${req.file.filename}`,
        resumeParsed: parsedResume,
        skills: parsedResume.skills,
        yearsOfExperience: parsedResume.yearsOfExperience || candidateProfile.yearsOfExperience,
        education: parsedResume.education || candidateProfile.education
      });
      
      // Clean up the temporary file
      fs.unlinkSync(filePath);
      
      res.json({
        message: 'Resume uploaded and parsed successfully',
        parsedData: parsedResume,
        profile: updatedProfile
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error uploading resume' });
    }
  });
  
  // ATS Referrals routes
  app.post('/api/ats-referrals', authenticate, async (req, res) => {
    const user = req.user;
    
    try {
      const validatedData = insertAtsReferralSchema.parse(req.body);
      
      // Check if the user is authorized to create a referral for this match
      const match = await storage.getMatch(validatedData.matchId);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Check if this user can create a referral for this match
      if (match.candidateId !== validatedData.userId && match.recruiterId !== validatedData.userId) {
        return res.status(403).json({ message: 'Not authorized to create referral for this match' });
      }
      
      // Check if a referral already exists for this match
      const existingReferral = await storage.getAtsReferralByMatchId(validatedData.matchId);
      
      if (existingReferral) {
        // Update existing referral
        const updatedReferral = await storage.updateAtsReferral(existingReferral.id, {
          action: validatedData.action,
          timestamp: new Date(),
          reminderSent: false,
          reminderTimestamp: null
        });
        
        return res.json(updatedReferral);
      }
      
      // Create new referral
      const newReferral = await storage.createAtsReferral(validatedData);
      
      res.status(201).json(newReferral);
    } catch (error) {
      console.error('Error creating ATS referral:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid referral data', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Server error creating ATS referral' });
    }
  });
  
  app.get('/api/ats-referrals/user/:userId', authenticate, async (req, res) => {
    const user = req.user;
    const userId = parseInt(req.params.userId);
    
    // Make sure users can only access their own referrals
    if (user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to access these referrals' });
    }
    
    try {
      const referrals = await storage.getAtsReferralsByUser(userId);
      res.json(referrals);
    } catch (error) {
      console.error('Error fetching ATS referrals:', error);
      res.status(500).json({ message: 'Server error fetching ATS referrals' });
    }
  });
  
  app.get('/api/ats-referrals/match/:matchId', authenticate, async (req, res) => {
    const matchId = parseInt(req.params.matchId);
    const user = req.user;
    
    try {
      // Check if the user is authorized to access this match
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      if (match.candidateId !== user.id && match.recruiterId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this match' });
      }
      
      const referral = await storage.getAtsReferralByMatchId(matchId);
      
      if (!referral) {
        return res.status(404).json({ message: 'No ATS referral found for this match' });
      }
      
      res.json(referral);
    } catch (error) {
      console.error('Error fetching ATS referral for match:', error);
      res.status(500).json({ message: 'Server error fetching ATS referral' });
    }
  });
  
  // API endpoint to process reminders for skipped ATS referrals
  app.get('/api/ats-referrals/process-reminders', async (req, res) => {
    // This endpoint should be secured in production with an API key or similar
    // For now, we'll leave it open for testing purposes
    
    try {
      // Get all pending reminders
      const pendingReminders = await storage.getPendingAtsReminders();
      
      if (pendingReminders.length === 0) {
        return res.json({ message: 'No pending reminders found', count: 0 });
      }
      
      // Array to track processed reminders
      const processed = [];
      
      // Process each reminder
      for (const referral of pendingReminders) {
        try {
          // In a real app, you would send a WhatsApp message here
          // For now, we'll just mark it as sent
          
          // Get user details for the reminder
          const user = await storage.getUser(referral.userId);
          const match = await storage.getMatch(referral.matchId);
          
          if (!user || !match) {
            console.error(`User or match not found for referral ${referral.id}`);
            continue;
          }
          
          console.log(`Sending WhatsApp reminder to user ${user.id} about match ${match.id}`);
          
          // Example WhatsApp integration code (commented out):
          /*
          const whatsappMessage = `Hi ${user.firstName}, we noticed you skipped the CV optimization for your recent job match. 
          Optimizing your CV can increase your chances by 70%! Visit https://atsboost.co.za/?ref=talentsyncza&matchId=${match.id} to optimize now.`;
          
          // Call WhatsApp API here
          */
          
          // Update the referral to mark the reminder as sent
          const updatedReferral = await storage.updateAtsReferral(referral.id, {
            reminderSent: true,
            reminderTimestamp: new Date()
          });
          
          processed.push(updatedReferral);
        } catch (error) {
          console.error(`Error processing reminder for referral ${referral.id}:`, error);
        }
      }
      
      res.json({ 
        message: `Processed ${processed.length} reminders`, 
        count: processed.length,
        processed 
      });
    } catch (error) {
      console.error('Error processing ATS reminders:', error);
      res.status(500).json({ message: 'Server error processing reminders' });
    }
  });
  
  // Analytics routes
  app.get('/api/analytics/bbbee', authenticate, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can access this endpoint' });
    }
    
    try {
      const companyProfile = await storage.getCompanyProfile(user.id);
      
      if (!companyProfile) {
        return res.status(404).json({ message: 'Company profile not found' });
      }
      
      const analytics = await generateBBBEEAnalytics(companyProfile.id);
      
      res.json(analytics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error generating analytics' });
    }
  });
  
  // Skills Assessment Routes
  // Get all active skill assessments
  app.get('/api/skill-assessments', async (req, res) => {
    try {
      const assessments = await storage.getActiveSkillAssessments();
      res.json(assessments);
    } catch (error) {
      console.error('Error fetching skill assessments:', error);
      res.status(500).json({ error: 'Failed to fetch skill assessments' });
    }
  });

  // Get a specific skill assessment
  app.get('/api/skill-assessments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid assessment ID' });
      }

      const assessment = await storage.getSkillAssessment(id);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      res.json(assessment);
    } catch (error) {
      console.error('Error fetching skill assessment:', error);
      res.status(500).json({ error: 'Failed to fetch skill assessment' });
    }
  });

  // Get assessments by skill
  app.get('/api/skill-assessments/by-skill/:skill', async (req, res) => {
    try {
      const skill = req.params.skill;
      const assessments = await storage.getSkillAssessmentsBySkill(skill);
      res.json(assessments);
    } catch (error) {
      console.error('Error fetching skill assessments by skill:', error);
      res.status(500).json({ error: 'Failed to fetch skill assessments' });
    }
  });

  // Create a new skill assessment (admin only)
  app.post('/api/skill-assessments', authenticateAdmin, async (req, res) => {
    try {
      const assessmentData = insertSkillAssessmentSchema.parse(req.body);
      const assessment = await storage.createSkillAssessment(assessmentData);
      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: formatZodError(error) });
      }
      console.error('Error creating skill assessment:', error);
      res.status(500).json({ error: 'Failed to create skill assessment' });
    }
  });

  // Update skill assessment (admin only)
  app.patch('/api/skill-assessments/:id', authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid assessment ID' });
      }

      const assessment = await storage.getSkillAssessment(id);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      const updatedAssessment = await storage.updateSkillAssessment(id, req.body);
      res.json(updatedAssessment);
    } catch (error) {
      console.error('Error updating skill assessment:', error);
      res.status(500).json({ error: 'Failed to update skill assessment' });
    }
  });

  // Get assessment questions
  app.get('/api/skill-assessments/:id/questions', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid assessment ID' });
      }

      const assessment = await storage.getSkillAssessment(id);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      const questions = await storage.getAssessmentQuestions(id);
      
      // For security, don't send correct answers to client unless admin
      if (!req.user?.isAdmin) {
        const questionsWithoutAnswers = questions.map(q => {
          const { correctAnswer, ...questionWithoutAnswer } = q;
          return questionWithoutAnswer;
        });
        return res.json(questionsWithoutAnswers);
      }
      
      res.json(questions);
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
      res.status(500).json({ error: 'Failed to fetch assessment questions' });
    }
  });

  // Create assessment question (admin only)
  app.post('/api/skill-assessments/:id/questions', authenticateAdmin, async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      if (isNaN(assessmentId)) {
        return res.status(400).json({ error: 'Invalid assessment ID' });
      }

      const assessment = await storage.getSkillAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      const questionData = insertAssessmentQuestionSchema.parse({
        ...req.body,
        assessmentId
      });
      
      const question = await storage.createAssessmentQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: formatZodError(error) });
      }
      console.error('Error creating assessment question:', error);
      res.status(500).json({ error: 'Failed to create assessment question' });
    }
  });

  // Update assessment question (admin only)
  app.patch('/api/assessment-questions/:id', authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }

      const updatedQuestion = await storage.updateAssessmentQuestion(id, req.body);
      if (!updatedQuestion) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.json(updatedQuestion);
    } catch (error) {
      console.error('Error updating assessment question:', error);
      res.status(500).json({ error: 'Failed to update assessment question' });
    }
  });

  // Delete assessment question (admin only)
  app.delete('/api/assessment-questions/:id', authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }

      const success = await storage.deleteAssessmentQuestion(id);
      if (!success) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting assessment question:', error);
      res.status(500).json({ error: 'Failed to delete assessment question' });
    }
  });

  // Start an assessment attempt
  app.post('/api/skill-assessments/:id/attempt', authenticate, async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      if (isNaN(assessmentId)) {
        return res.status(400).json({ error: 'Invalid assessment ID' });
      }

      const assessment = await storage.getSkillAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      // Create attempt
      const attempt = await storage.createAssessmentAttempt({
        userId: req.user!.id,
        assessmentId,
        score: null,
        completedAt: null,
        passed: null,
        answers: null,
        timeSpent: null
      });
      
      res.status(201).json(attempt);
    } catch (error) {
      console.error('Error starting assessment attempt:', error);
      res.status(500).json({ error: 'Failed to start assessment attempt' });
    }
  });

  // Submit assessment attempt
  app.post('/api/assessment-attempts/:id/submit', authenticate, async (req, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      if (isNaN(attemptId)) {
        return res.status(400).json({ error: 'Invalid attempt ID' });
      }

      const attempt = await storage.getAssessmentAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
      }

      // Verify attempt belongs to authenticated user
      if (attempt.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to submit this attempt' });
      }

      // Get assessment info
      const assessment = await storage.getSkillAssessment(attempt.assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      // Get questions for this assessment
      const questions = await storage.getAssessmentQuestions(attempt.assessmentId);
      
      // Validate submission format
      const { answers, timeSpent } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Invalid answers format' });
      }

      // Calculate score
      let score = 0;
      const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
      
      // Process answers
      for (const answer of answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (question && answer.answer === question.correctAnswer) {
          score += question.points;
        }
      }
      
      // Calculate percentage
      const percentage = Math.round((score / maxScore) * 100);
      
      // Check if passed
      const passed = percentage >= assessment.passingScore;
      
      // Update attempt with results
      const updatedAttempt = await storage.updateAssessmentAttempt(attemptId, {
        score: percentage,
        completedAt: new Date(),
        passed,
        answers: answers,
        timeSpent,
        verified: true,
        badgeAwarded: passed
      });
      
      // If passed, create a skill badge
      if (passed) {
        await storage.createSkillBadge({
          userId: req.user!.id,
          skill: assessment.skill,
          level: assessment.difficulty,
          attemptId,
          expiresAt: null // Badges don't expire by default
        });
      }
      
      res.json({
        attempt: updatedAttempt,
        score: percentage,
        passed,
        badgeAwarded: passed
      });
    } catch (error) {
      console.error('Error submitting assessment attempt:', error);
      res.status(500).json({ error: 'Failed to submit assessment attempt' });
    }
  });

  // Get user's assessment attempts
  app.get('/api/user/assessment-attempts', authenticate, async (req, res) => {
    try {
      const attempts = await storage.getUserAssessmentAttempts(req.user!.id);
      res.json(attempts);
    } catch (error) {
      console.error('Error fetching user assessment attempts:', error);
      res.status(500).json({ error: 'Failed to fetch assessment attempts' });
    }
  });

  // Get user's skill badges
  app.get('/api/user/skill-badges', authenticate, async (req, res) => {
    try {
      const badges = await storage.getUserSkillBadges(req.user!.id);
      res.json(badges);
    } catch (error) {
      console.error('Error fetching user skill badges:', error);
      res.status(500).json({ error: 'Failed to fetch skill badges' });
    }
  });
  
  // Add catch-all route for API endpoints
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });
  
  // Run matching algorithm periodically (e.g., daily)
  // This would typically be a cron job in a production environment
  const runMatchingAlgorithm = async () => {
    try {
      console.log('Running matching algorithm...');
      
      // Get all candidates (first 100 users)
      for (let i = 1; i <= 100; i++) {
        const user = await storage.getUser(i);
        
        if (user && user.role === 'candidate') {
          const matches = await matchCandidateToJobs(user.id);
          
          if (matches.length > 0) {
            await createMatchesFromResults(matches);
          }
        }
      }
      
      console.log('Matching algorithm completed');
    } catch (error) {
      console.error('Error running matching algorithm:', error);
    }
  };
  
  // Run the matching algorithm once on server start
  setTimeout(runMatchingAlgorithm, 5000);
  
  const httpServer = createServer(app);
  
  // Set up WebSocket server on a different path from Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send a welcome message
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to TalentSyncZA WebSocket server' }));
    
    // Listen for messages from client
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
            
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  return httpServer;
}
