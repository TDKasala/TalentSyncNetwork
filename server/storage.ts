import { 
  users, User, InsertUser, candidateProfiles, CandidateProfile, InsertCandidateProfile,
  companyProfiles, CompanyProfile, InsertCompanyProfile, jobs, Job, InsertJob,
  matches, Match, InsertMatch, transactions, Transaction, InsertTransaction,
  consents, Consent, InsertConsent, atsReferrals, AtsReferral, InsertAtsReferral
} from "@shared/schema";
import { eq, and, inArray, like, desc, sql, or } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';
import bcrypt from 'bcryptjs';
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// Extend interface with necessary CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "confirmPassword"> & { password: string }): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Candidate methods
  getCandidateProfile(userId: number): Promise<CandidateProfile | undefined>;
  createCandidateProfile(profile: InsertCandidateProfile): Promise<CandidateProfile>;
  updateCandidateProfile(userId: number, profileData: Partial<CandidateProfile>): Promise<CandidateProfile | undefined>;
  
  // Company methods
  getCompanyProfile(userId: number): Promise<CompanyProfile | undefined>;
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  updateCompanyProfile(userId: number, profileData: Partial<CompanyProfile>): Promise<CompanyProfile | undefined>;
  
  // Job methods
  getJob(id: number): Promise<Job | undefined>;
  getJobs(params?: { limit?: number; offset?: number; search?: string }): Promise<Job[]>;
  getJobsByRecruiter(recruiterId: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined>;
  
  // Match methods
  getMatch(id: number): Promise<Match | undefined>;
  getMatchesByCandidate(candidateId: number): Promise<Match[]>;
  getMatchesByRecruiter(recruiterId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, matchData: Partial<Match>): Promise<Match | undefined>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  
  // Consent methods
  createConsent(consent: InsertConsent): Promise<Consent>;
  getConsentsByUser(userId: number): Promise<Consent[]>;
  
  // ATS Referral methods
  createAtsReferral(referral: InsertAtsReferral): Promise<AtsReferral>;
  getAtsReferralsByUser(userId: number): Promise<AtsReferral[]>;
  getAtsReferralByMatchId(matchId: number): Promise<AtsReferral | undefined>;
  updateAtsReferral(id: number, data: Partial<AtsReferral>): Promise<AtsReferral | undefined>;
  getPendingAtsReminders(): Promise<AtsReferral[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private candidateProfiles: Map<number, CandidateProfile>;
  private companyProfiles: Map<number, CompanyProfile>;
  private jobs: Map<number, Job>;
  private matches: Map<number, Match>;
  private transactions: Map<number, Transaction>;
  private consents: Map<number, Consent>;
  private atsReferrals: Map<number, AtsReferral>;
  private currentUserId: number;
  private currentProfileId: number;
  private currentJobId: number;
  private currentMatchId: number;
  private currentTransactionId: number;
  private currentConsentId: number;
  private currentAtsReferralId: number;

  constructor() {
    this.users = new Map();
    this.candidateProfiles = new Map();
    this.companyProfiles = new Map();
    this.jobs = new Map();
    this.matches = new Map();
    this.transactions = new Map();
    this.consents = new Map();
    this.atsReferrals = new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentJobId = 1;
    this.currentMatchId = 1;
    this.currentTransactionId = 1;
    this.currentConsentId = 1;
    this.currentAtsReferralId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: Omit<InsertUser, "confirmPassword"> & { password: string }): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const user: User = {
      id,
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      profileComplete: false,
      language: userData.language || "english",
      whatsappNumber: userData.whatsappNumber,
      location: userData.location,
      createdAt: now,
      consentGiven: userData.consentGiven,
      emailVerified: false,
      lastLogin: null,
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Candidate methods
  async getCandidateProfile(userId: number): Promise<CandidateProfile | undefined> {
    return Array.from(this.candidateProfiles.values()).find(profile => profile.userId === userId);
  }

  async createCandidateProfile(profile: InsertCandidateProfile): Promise<CandidateProfile> {
    const id = this.currentProfileId++;
    const now = new Date();
    
    const candidateProfile: CandidateProfile = {
      ...profile,
      id,
      createdAt: now,
      updatedAt: now,
      resumeParsed: null
    };
    
    this.candidateProfiles.set(id, candidateProfile);
    return candidateProfile;
  }

  async updateCandidateProfile(userId: number, profileData: Partial<CandidateProfile>): Promise<CandidateProfile | undefined> {
    const profile = Array.from(this.candidateProfiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updatedProfile = { 
      ...profile, 
      ...profileData,
      updatedAt: new Date()
    };
    
    this.candidateProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Company methods
  async getCompanyProfile(userId: number): Promise<CompanyProfile | undefined> {
    return Array.from(this.companyProfiles.values()).find(profile => profile.userId === userId);
  }

  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const id = this.currentProfileId++;
    const now = new Date();
    
    const companyProfile: CompanyProfile = {
      ...profile,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.companyProfiles.set(id, companyProfile);
    return companyProfile;
  }

  async updateCompanyProfile(userId: number, profileData: Partial<CompanyProfile>): Promise<CompanyProfile | undefined> {
    const profile = Array.from(this.companyProfiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updatedProfile = { 
      ...profile, 
      ...profileData,
      updatedAt: new Date()
    };
    
    this.companyProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobs(params: { limit?: number; offset?: number; search?: string } = {}): Promise<Job[]> {
    let result = Array.from(this.jobs.values());
    
    // Apply search filter if provided
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchLower) || 
        job.description.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by creation date (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply pagination
    if (params.offset !== undefined && params.limit !== undefined) {
      result = result.slice(params.offset, params.offset + params.limit);
    } else if (params.limit !== undefined) {
      result = result.slice(0, params.limit);
    }
    
    return result;
  }

  async getJobsByRecruiter(recruiterId: number): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.recruiterId === recruiterId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const now = new Date();
    
    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const job: Job = {
      ...jobData,
      id,
      createdAt: now,
      updatedAt: now,
      expiresAt
    };
    
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { 
      ...job, 
      ...jobData,
      updatedAt: new Date()
    };
    
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  // Match methods
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchesByCandidate(candidateId: number): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter(match => match.candidateId === candidateId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMatchesByRecruiter(recruiterId: number): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter(match => match.recruiterId === recruiterId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createMatch(matchData: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const now = new Date();
    
    const match: Match = {
      ...matchData,
      id,
      status: matchData.status || 'pending',
      createdAt: now,
      updatedAt: now
    };
    
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: number, matchData: Partial<Match>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { 
      ...match, 
      ...matchData,
      updatedAt: new Date()
    };
    
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  // Transaction methods
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    
    const transaction: Transaction = {
      ...transactionData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { 
      ...transaction, 
      ...transactionData,
      updatedAt: new Date()
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Consent methods
  async createConsent(consentData: InsertConsent): Promise<Consent> {
    const id = this.currentConsentId++;
    const now = new Date();
    
    const consent: Consent = {
      ...consentData,
      id,
      givenAt: now
    };
    
    this.consents.set(id, consent);
    return consent;
  }

  async getConsentsByUser(userId: number): Promise<Consent[]> {
    return Array.from(this.consents.values())
      .filter(consent => consent.userId === userId)
      .sort((a, b) => new Date(b.givenAt).getTime() - new Date(a.givenAt).getTime());
  }

  // ATS Referral methods
  async createAtsReferral(referral: InsertAtsReferral): Promise<AtsReferral> {
    const id = this.currentAtsReferralId++;
    const newReferral: AtsReferral = {
      id,
      ...referral,
      timestamp: new Date(),
      reminderSent: false,
      reminderTimestamp: null
    };
    
    this.atsReferrals.set(id, newReferral);
    return newReferral;
  }
  
  async getAtsReferralsByUser(userId: number): Promise<AtsReferral[]> {
    return Array.from(this.atsReferrals.values())
      .filter(referral => referral.userId === userId);
  }
  
  async getAtsReferralByMatchId(matchId: number): Promise<AtsReferral | undefined> {
    return Array.from(this.atsReferrals.values())
      .find(referral => referral.matchId === matchId);
  }
  
  async updateAtsReferral(id: number, data: Partial<AtsReferral>): Promise<AtsReferral | undefined> {
    const referral = this.atsReferrals.get(id);
    
    if (!referral) {
      return undefined;
    }
    
    const updatedReferral = { ...referral, ...data };
    this.atsReferrals.set(id, updatedReferral);
    
    return updatedReferral;
  }
  
  async getPendingAtsReminders(): Promise<AtsReferral[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return Array.from(this.atsReferrals.values())
      .filter(referral => 
        referral.action === 'skip' && 
        !referral.reminderSent && 
        referral.timestamp < oneDayAgo
      );
  }
}

// Create a database version for production use
export class DatabaseStorage implements IStorage {
  private db: PostgresJsDatabase;

  constructor(connectionString: string) {
    // Create a Postgres client
    const client = postgres(connectionString);
    // Create a Drizzle ORM instance
    this.db = drizzle(client);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: Omit<InsertUser, "confirmPassword"> & { password: string }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const result = await this.db.insert(users).values({
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      language: userData.language || "english",
      whatsappNumber: userData.whatsappNumber,
      location: userData.location,
      consentGiven: userData.consentGiven
    }).returning();
    
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await this.db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  // Candidate methods
  async getCandidateProfile(userId: number): Promise<CandidateProfile | undefined> {
    const result = await this.db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId))
      .limit(1);
    
    return result[0];
  }

  async createCandidateProfile(profile: InsertCandidateProfile): Promise<CandidateProfile> {
    const result = await this.db
      .insert(candidateProfiles)
      .values(profile)
      .returning();
    
    return result[0];
  }

  async updateCandidateProfile(userId: number, profileData: Partial<CandidateProfile>): Promise<CandidateProfile | undefined> {
    const profile = await this.getCandidateProfile(userId);
    if (!profile) return undefined;
    
    const result = await this.db
      .update(candidateProfiles)
      .set({
        ...profileData,
        updatedAt: new Date()
      })
      .where(eq(candidateProfiles.id, profile.id))
      .returning();
    
    return result[0];
  }

  // Company methods
  async getCompanyProfile(userId: number): Promise<CompanyProfile | undefined> {
    const result = await this.db
      .select()
      .from(companyProfiles)
      .where(eq(companyProfiles.userId, userId))
      .limit(1);
    
    return result[0];
  }

  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const result = await this.db
      .insert(companyProfiles)
      .values(profile)
      .returning();
    
    return result[0];
  }

  async updateCompanyProfile(userId: number, profileData: Partial<CompanyProfile>): Promise<CompanyProfile | undefined> {
    const profile = await this.getCompanyProfile(userId);
    if (!profile) return undefined;
    
    const result = await this.db
      .update(companyProfiles)
      .set({
        ...profileData,
        updatedAt: new Date()
      })
      .where(eq(companyProfiles.id, profile.id))
      .returning();
    
    return result[0];
  }

  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    const result = await this.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);
    
    return result[0];
  }

  async getJobs(params: { limit?: number; offset?: number; search?: string } = {}): Promise<Job[]> {
    let query = this.db.select().from(jobs).where(eq(jobs.active, true));
    
    // Apply search filter if provided
    if (params.search) {
      query = query.where(
        or(
          like(jobs.title, `%${params.search}%`),
          like(jobs.description, `%${params.search}%`),
          like(jobs.location, `%${params.search}%`)
        )
      );
    }
    
    // Apply sorting (newest first)
    query = query.orderBy(desc(jobs.createdAt));
    
    // Apply pagination
    if (params.limit !== undefined) {
      query = query.limit(params.limit);
      
      if (params.offset !== undefined) {
        query = query.offset(params.offset);
      }
    }
    
    return await query;
  }

  async getJobsByRecruiter(recruiterId: number): Promise<Job[]> {
    return await this.db
      .select()
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId))
      .orderBy(desc(jobs.createdAt));
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const result = await this.db
      .insert(jobs)
      .values({
        ...jobData,
        expiresAt
      })
      .returning();
    
    return result[0];
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const result = await this.db
      .update(jobs)
      .set({
        ...jobData,
        updatedAt: new Date()
      })
      .where(eq(jobs.id, id))
      .returning();
    
    return result[0];
  }

  // Match methods
  async getMatch(id: number): Promise<Match | undefined> {
    const result = await this.db
      .select()
      .from(matches)
      .where(eq(matches.id, id))
      .limit(1);
    
    return result[0];
  }

  async getMatchesByCandidate(candidateId: number): Promise<Match[]> {
    return await this.db
      .select()
      .from(matches)
      .where(eq(matches.candidateId, candidateId))
      .orderBy(desc(matches.createdAt));
  }

  async getMatchesByRecruiter(recruiterId: number): Promise<Match[]> {
    return await this.db
      .select()
      .from(matches)
      .where(eq(matches.recruiterId, recruiterId))
      .orderBy(desc(matches.createdAt));
  }

  async createMatch(matchData: InsertMatch): Promise<Match> {
    const result = await this.db
      .insert(matches)
      .values({
        ...matchData,
        status: matchData.status || 'pending'
      })
      .returning();
    
    return result[0];
  }

  async updateMatch(id: number, matchData: Partial<Match>): Promise<Match | undefined> {
    const result = await this.db
      .update(matches)
      .set({
        ...matchData,
        updatedAt: new Date()
      })
      .where(eq(matches.id, id))
      .returning();
    
    return result[0];
  }

  // Transaction methods
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const result = await this.db
      .insert(transactions)
      .values(transactionData)
      .returning();
    
    return result[0];
  }

  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const result = await this.db
      .update(transactions)
      .set({
        ...transactionData,
        updatedAt: new Date()
      })
      .where(eq(transactions.id, id))
      .returning();
    
    return result[0];
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Consent methods
  async createConsent(consentData: InsertConsent): Promise<Consent> {
    const result = await this.db
      .insert(consents)
      .values(consentData)
      .returning();
    
    return result[0];
  }

  async getConsentsByUser(userId: number): Promise<Consent[]> {
    return await this.db
      .select()
      .from(consents)
      .where(eq(consents.userId, userId))
      .orderBy(desc(consents.givenAt));
  }

  // ATS Referral methods
  async createAtsReferral(referral: InsertAtsReferral): Promise<AtsReferral> {
    const result = await this.db
      .insert(atsReferrals)
      .values(referral)
      .returning();
    
    return result[0];
  }
  
  async getAtsReferralsByUser(userId: number): Promise<AtsReferral[]> {
    return await this.db
      .select()
      .from(atsReferrals)
      .where(eq(atsReferrals.userId, userId))
      .orderBy(desc(atsReferrals.timestamp));
  }
  
  async getAtsReferralByMatchId(matchId: number): Promise<AtsReferral | undefined> {
    const result = await this.db
      .select()
      .from(atsReferrals)
      .where(eq(atsReferrals.matchId, matchId))
      .limit(1);
    
    return result[0];
  }
  
  async updateAtsReferral(id: number, data: Partial<AtsReferral>): Promise<AtsReferral | undefined> {
    const result = await this.db
      .update(atsReferrals)
      .set(data)
      .where(eq(atsReferrals.id, id))
      .returning();
    
    return result[0];
  }
  
  async getPendingAtsReminders(): Promise<AtsReferral[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return await this.db
      .select()
      .from(atsReferrals)
      .where(
        and(
          eq(atsReferrals.action, 'skip'),
          eq(atsReferrals.reminderSent, false),
          sql`${atsReferrals.timestamp} < ${oneDayAgo}`
        )
      );
  }
}

// Initialize storage based on environment
let storage: IStorage;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  storage = new DatabaseStorage(process.env.DATABASE_URL);
} else {
  storage = new MemStorage();
}

export { storage };
