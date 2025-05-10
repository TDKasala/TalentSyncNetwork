import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export async function validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}

export async function generateToken(user: User): Promise<string> {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const user = await storage.getUserByEmail(email);
  
  if (!user) {
    return null;
  }

  const isPasswordValid = await validatePassword(password, user.passwordHash);
  
  if (!isPasswordValid) {
    return null;
  }

  // Update last login time
  await storage.updateUser(user.id, { lastLogin: new Date() });
  
  // Generate JWT token
  const token = await generateToken(user);
  
  return { user, token };
}

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'candidate' | 'recruiter',
  whatsappNumber?: string,
  location?: string,
  language: 'english' | 'afrikaans' | 'zulu' = 'english',
  consentGiven: boolean = false
): Promise<{ user: User; token: string } | null> {
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    return null;
  }

  // Create new user
  const user = await storage.createUser({
    email,
    password,
    firstName,
    lastName,
    role,
    whatsappNumber,
    location,
    language,
    consentGiven
  });

  // Generate JWT token
  const token = await generateToken(user);
  
  return { user, token };
}
