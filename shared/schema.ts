import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, uniqueIndex, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define enums for various tables
export const userRoleEnum = pgEnum("user_role", ["candidate", "recruiter"]);
export const matchStatusEnum = pgEnum("match_status", ["pending", "unlocked", "rejected"]);
export const jobTypeEnum = pgEnum("job_type", ["full-time", "part-time", "contract", "remote"]);
export const racialGroupEnum = pgEnum("racial_group", ["black", "white", "coloured", "indian", "asian", "other", "prefer_not_to_say"]);
export const genderEnum = pgEnum("gender", ["male", "female", "non_binary", "other", "prefer_not_to_say"]);
export const languageEnum = pgEnum("language", ["english", "afrikaans", "zulu"]);
export const bbbeeEnum = pgEnum("bbbee_level", ["1", "2", "3", "4", "5", "6", "7", "8", "non_compliant"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: userRoleEnum("role").notNull(),
  profileComplete: boolean("profile_complete").default(false).notNull(),
  language: languageEnum("language").default("english").notNull(),
  whatsappNumber: text("whatsapp_number"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  consentGiven: boolean("consent_given").default(false).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  lastLogin: timestamp("last_login"),
});

// Candidate profiles
export const candidateProfiles = pgTable("candidate_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  skills: text("skills").array(),
  yearsOfExperience: integer("years_of_experience"),
  education: text("education"),
  portfolioLinks: text("portfolio_links").array(),
  resumeUrl: text("resume_url"),
  resumeParsed: json("resume_parsed"),
  racialGroup: racialGroupEnum("racial_group"),
  gender: genderEnum("gender"),
  disabilityStatus: boolean("disability_status").default(false),
  salary: integer("salary_expectation"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Company/recruiter profiles
export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  description: text("description"),
  website: text("website"),
  logo: text("logo_url"),
  bbbeeLevel: bbbeeEnum("bbbee_level"),
  companySize: text("company_size"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  recruiterId: integer("recruiter_id").references(() => users.id).notNull(),
  companyId: integer("company_id").references(() => companyProfiles.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  type: jobTypeEnum("type").notNull(),
  salary: text("salary"),
  skills: text("skills").array().notNull(),
  bbbeePreferred: boolean("bbbee_preferred").default(false),
  remoteOk: boolean("remote_ok").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  expiresAt: timestamp("expires_at"),
});

// Matches table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  candidateId: integer("candidate_id").references(() => users.id).notNull(),
  recruiterId: integer("recruiter_id").references(() => users.id).notNull(),
  status: matchStatusEnum("status").default("pending").notNull(),
  score: integer("score").notNull(),
  unlockedByCandidate: boolean("unlocked_by_candidate").default(false),
  unlockedByRecruiter: boolean("unlocked_by_recruiter").default(false),
  candidateNotes: text("candidate_notes"),
  recruiterNotes: text("recruiter_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  matchId: integer("match_id").references(() => matches.id),
  amount: integer("amount").notNull(),
  currency: text("currency").default("ZAR").notNull(),
  status: text("status").notNull(),
  paymentProvider: text("payment_provider").default("payfast"),
  paymentId: text("payment_id"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Consents table for POPIA
export const consents = pgTable("consents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  text: text("text").notNull(),
  givenAt: timestamp("given_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Create Zod schemas for inserts
export const insertUserSchema = createInsertSchema(users).omit({ id: true, passwordHash: true, createdAt: true, lastLogin: true })
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const insertCandidateProfileSchema = createInsertSchema(candidateProfiles).omit({ id: true, createdAt: true, updatedAt: true, resumeParsed: true });
export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConsentSchema = createInsertSchema(consents).omit({ id: true, givenAt: true });

// Define types based on the schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type InsertCandidateProfile = z.infer<typeof insertCandidateProfileSchema>;
export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Consent = typeof consents.$inferSelect;
export type InsertConsent = z.infer<typeof insertConsentSchema>;
