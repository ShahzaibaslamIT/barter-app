// // lib/auth-options.ts
// import type { NextAuthOptions } from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
// import { prisma } from "@/lib/prisma"

// // NOTE: Your User model requires email, username, and password_hash (non-null).
// // We'll auto-create a user row on first Google sign-in using events.signIn.

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: "jwt", // default in app router; keeps it simple
//   },
//   callbacks: {
//     async session({ session, token }) {
//       // Attach id if needed (token.sub carries the provider user id)
//       if (session.user && token?.sub) {
//         // @ts-expect-error – we’re extending at runtime
//         session.user.id = token.sub
//       }
//       return session
//     },
//   },
//   events: {
//     // Create/sync user in your own Prisma User table when Google login succeeds
//     async signIn({ user }) {
//       try {
//         if (!user?.email) return

//         // Create a username if none
//         const username =
//           user.name?.trim() ||
//           user.email.split("@")[0] ||
//           "user" + Math.floor(Math.random() * 10000)

//         await prisma.user.upsert({
//           where: { email: user.email },
//           update: {
//             // You can update avatar_url if you want:
//             // avatar_url: user.image ?? null,
//           },
//           create: {
//             email: user.email,
//             username,
//             password_hash: "google-oauth", // required by your schema
//             // user_type will default to "both" per your schema
//           },
//         })
//       } catch (e) {
//         console.error("[NextAuth signIn event] upsert user failed:", e)
//       }
//     },
//   },
// }


// // lib/auth-options.ts
// import type { NextAuthOptions } from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
// import { prisma } from "@/lib/prisma"
// import { generateToken } from "@/lib/auth"  // <-- your custom JWT helper
// import { UserType } from "@prisma/client"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: "jwt",
//   },

//   callbacks: {
//     // Runs whenever a new JWT is created or updated
//     async jwt({ token, account, profile }) {
//       // Only runs on initial login
//       if (account && profile?.email) {
//         let user = await prisma.user.findUnique({
//           where: { email: profile.email },
//         })

//         if (!user) {
//           user = await prisma.user.create({
//             data: {
//               email: profile.email,
//               username: profile.name || profile.email.split("@")[0],
//               password_hash: "google-oauth", // required by schema
//               user_type: UserType.both,
//             },
//           })
//         }

//         // Attach DB user_id
//         token.user_id = user.user_id
//         token.name = user.username
//         token.email = user.email

//         // 🔑 Create your custom JWT (same as /api/auth/login)
//         token.auth_token = generateToken({
//           user_id: String(user.user_id),
//           email: user.email,
//           name: user.username,
//           user_type: user.user_type,
//         })
//       }
//       return token
//     },

//     // Attach values into session for frontend
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.user_id = token.user_id as number
//         session.user.name = token.name as string
//         session.user.email = token.email as string
//       }
//       session.auth_token = token.auth_token as string
//       return session
//     },

//     async redirect({ url, baseUrl }) {
//       return "/home"
//     },
//   },
// }

// lib/auth-options.ts
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/auth"
import { UserType } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.email,
              username: profile.name || profile.email.split("@")[0],
              password_hash: "google-oauth", // required by schema
              user_type: UserType.both,
            },
          })
        }

        // Attach DB fields into JWT
        token.user_id = user.user_id
        token.name = user.username
        token.email = user.email
        token.user_type = user.user_type

        // Also issue our custom JWT for API auth
        token.auth_token = generateToken({
          user_id: String(user.user_id),
          email: user.email,
          name: user.username,
          user_type: user.user_type,
        })
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).user_id = token.user_id as number
        ;(session.user as any).user_type = token.user_type as UserType
        session.user.name = token.name as string
        session.user.email = token.email as string
      }

      ;(session as any).auth_token = token.auth_token as string
      return session
    },

    async redirect({ url, baseUrl }) {
      return "/home"
    },
  },
}



