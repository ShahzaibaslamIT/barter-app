import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import type { UserType } from "@prisma/client";

// Ensure JWT_SECRET is always a string
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

// The payload you put in JWTs
export interface TokenUser {
  id: string | number;
  email: string;
  name: string;
  user_type: UserType; // enum from Prisma
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: TokenUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      user_type: user.user_type,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): TokenUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenUser;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export function getUserFromRequest(request: NextRequest): TokenUser | null {
  const token = getTokenFromRequest(request);
  return token ? verifyToken(token) : null;
}
