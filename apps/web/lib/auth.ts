// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import type { NextRequest } from "next/server";
// import type { UserType } from "@prisma/client";

// // Ensure JWT_SECRET is always a string
// const JWT_SECRET = process.env.JWT_SECRET as string;
// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET is not set in environment variables");
// }

// // The payload you put in JWTs
// export interface TokenUser {
//   user_id: string | number;
//   email: string;
//   name: string;
//   user_type: UserType; // enum from Prisma
// }

// export async function hashPassword(password: string): Promise<string> {
//   return bcrypt.hash(password, 12);
// }

// export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
//   return bcrypt.compare(password, hashedPassword);
// }

// export function generateToken(user: TokenUser): string {
//   return jwt.sign(
//     {
//       user_id: user.user_id, // ✅ always store as user_id
//       email: user.email,
//       name: user.name,
//       user_type: user.user_type,
//     },
//     JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// }

// export function verifyToken(token: string): TokenUser | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as any;

//     // ✅ Normalize: support both "id" and "user_id"
//     return {
//       user_id: decoded.user_id ?? decoded.id,
//       email: decoded.email,
//       name: decoded.name,
//       user_type: decoded.user_type,
//     } as TokenUser;
//   } catch {
//     return null;
//   }
// }

// export function getTokenFromRequest(request: NextRequest): string | null {
//   const authHeader = request.headers.get("authorization");
//   if (authHeader?.startsWith("Bearer ")) {
//     return authHeader.slice(7);
//   }
//   return null;
// }

// export function getUserFromRequest(request: NextRequest): TokenUser | null {
//   const token = getTokenFromRequest(request);
//   return token ? verifyToken(token) : null;
// }

// import jwt from "jsonwebtoken"
// import bcrypt from "bcryptjs"
// import type { NextRequest } from "next/server"
// import type { UserType } from "@prisma/client"
// import { getServerSession } from "next-auth"
// import { authOptions } from "./auth-options"

// // ✅ Ensure JWT_SECRET always exists
// const JWT_SECRET = process.env.JWT_SECRET as string
// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET is not set in environment variables")
// }

// // The payload you put in JWTs
// export interface TokenUser {
//   user_id: string | number
//   email: string
//   name: string
//   user_type?: UserType // optional now (Google may not return this)
// }

// // -------- PASSWORD UTILS --------
// export async function hashPassword(password: string): Promise<string> {
//   return bcrypt.hash(password, 12)
// }

// export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
//   return bcrypt.compare(password, hashedPassword)
// }

// // -------- JWT UTILS --------
// export function generateToken(user: TokenUser): string {
//   return jwt.sign(
//     {
//       user_id: user.user_id,
//       email: user.email,
//       name: user.name,
//       user_type: user.user_type,
//     },
//     JWT_SECRET,
//     { expiresIn: "7d" }
//   )
// }

// export function verifyToken(token: string): TokenUser | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as any
//     return {
//       user_id: decoded.user_id ?? decoded.id,
//       email: decoded.email,
//       name: decoded.name,
//       user_type: decoded.user_type,
//     } as TokenUser
//   } catch {
//     return null
//   }
// }

// // -------- REQUEST HELPERS --------
// export function getTokenFromRequest(request: NextRequest): string | null {
//   const authHeader = request.headers.get("authorization")
//   if (authHeader?.startsWith("Bearer ")) {
//     return authHeader.slice(7)
//   }
//   return null
// }

// // ✅ Old JWT-based
// export function getUserFromRequest(request: NextRequest): TokenUser | null {
//   const token = getTokenFromRequest(request)
//   return token ? verifyToken(token) : null
// }

// // ✅ New NextAuth-based session getter
// export async function getAuthSession() {
//   return await getServerSession(authOptions)
// }


import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import type { UserType } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth-options"

// ✅ Ensure JWT_SECRET always exists
const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables")
}

// -------- TYPES --------
export interface TokenUser {
  user_id: string | number
  email: string
  name: string
  user_type?: UserType // optional now (Google may not return this)
}

// -------- PASSWORD UTILS --------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// -------- JWT UTILS --------
export function generateToken(user: TokenUser): string {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      user_type: user.user_type,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  )
}

export function verifyToken(token: string): TokenUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      user_id: decoded.user_id ?? decoded.id,
      email: decoded.email,
      name: decoded.name,
      user_type: decoded.user_type,
    } as TokenUser
  } catch {
    return null
  }
}

// -------- REQUEST HELPERS --------
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  return null
}

// ✅ Unified user extractor for both manual login (JWT) and Google login (NextAuth)
export async function getUserFromRequest(request: NextRequest): Promise<TokenUser | null> {
  // 1. Try Bearer JWT first (manual login users)
  const token = getTokenFromRequest(request)
  if (token) {
    return verifyToken(token)
  }

  // 2. Fall back to NextAuth session (Google login users)
  const session = await getServerSession(authOptions)
  if (session?.user) {
    return {
      user_id: (session.user as any).user_id, // set in auth-options callbacks
      email: session.user.email!,
      name: session.user.name || "",
      user_type: (session.user as any).user_type ?? "both",
    }
  }

  return null
}

// ✅ Direct session getter (if you only need NextAuth session)
export async function getAuthSession() {
  return await getServerSession(authOptions)
}
