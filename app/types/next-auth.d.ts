import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

// Extend User object
declare module "next-auth" {
  interface Session {
    user: {
      user_id: number
      name: string
      email: string
    } & DefaultSession["user"]
    auth_token: string
  }

  interface User extends DefaultUser {
    user_id: number
    auth_token?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id: number
    auth_token: string
    name: string
    email: string
  }
}
