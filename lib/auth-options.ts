// // lib/auth-options.ts
// import type { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { prisma } from "@/lib/prisma";
// import { generateToken } from "@/lib/auth";
// import { UserType } from "@prisma/client";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       allowDangerousEmailAccountLinking: true,
//     }),
//   ],

//   secret: process.env.NEXTAUTH_SECRET,

//   session: {
//     strategy: "jwt",
//   },

//   // @ts-expect-error — trustHost is supported at runtime
//   trustHost: true,

//   cookies: {
//     sessionToken: {
//       name: "__Secure-next-auth.session-token",
//       options: {
//         httpOnly: true,
//         sameSite: "none",
//         secure: true,
//         path: "/",
//       },
//     },
//   },

//   pages: {
//     signIn: "/auth",
//     error: "/auth",
//   },

//   callbacks: {
//     async jwt({ token, account, profile }) {
//       if (account && profile?.email) {
//         let user = await prisma.user.findUnique({
//           where: { email: profile.email },
//         });

//         if (!user) {
//           user = await prisma.user.create({
//             data: {
//               email: profile.email,
//               username: profile.name || profile.email.split("@")[0],
//               password_hash: "google-oauth",
//               user_type: UserType.both,
//             },
//           });
//         }

//         token.user_id = user.user_id;
//         token.name = user.username;
//         token.email = user.email;
//         token.user_type = user.user_type;

//         token.auth_token = generateToken({
//           user_id: String(user.user_id),
//           email: user.email,
//           name: user.username,
//           user_type: user.user_type,
//         });
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         (session.user as any).user_id = token.user_id;
//         (session.user as any).user_type = token.user_type;
//         session.user.name = token.name as string;
//         session.user.email = token.email as string;
//       }

//       (session as any).auth_token = token.auth_token;
//       return session;
//     },

//     // Simple, safe redirect: after login, go home
//     async redirect({ url, baseUrl }) {
//       // If this is the Google callback, send user to /home
//       if (url.includes("/api/auth/callback/google")) {
//         return `${baseUrl}/home`;
//       }

//       // For any relative path, prefix with baseUrl
//       if (url.startsWith("/")) {
//         return `${baseUrl}${url}`;
//       }

//       try {
//         const parsed = new URL(url);
//         if (parsed.origin === baseUrl) return url;
//       } catch {
//         // ignore parse errors and fall through
//       }

//       // Fallback: send to home
//       return `${baseUrl}/home`;
//     },
//   },
// };

// // lib/auth-options.ts
// import type { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { prisma } from "@/lib/prisma";
// import { generateToken } from "@/lib/auth";
// import { UserType } from "@prisma/client";
// import { randomInt } from "crypto";
// import { resend } from "@/lib/resend";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       allowDangerousEmailAccountLinking: true,
//     }),
//   ],

//   secret: process.env.NEXTAUTH_SECRET,

//   session: { strategy: "jwt" },

//   // @ts-expect-error supported at runtime
//   trustHost: true,

//   cookies: {
//     sessionToken: {
//       name: "__Secure-next-auth.session-token",
//       options: {
//         httpOnly: true,
//         sameSite: "none",
//         secure: true,
//         path: "/",
//       },
//     },
//   },

//   pages: {
//     signIn: "/auth",
//     error: "/auth",
//   },

//   callbacks: {
//     // 🔐 GOOGLE LOGIN → SEND OTP ON FIRST LOGIN ONLY
//     async jwt({ token, account, profile }) {
//       if (
//         account?.provider === "google" &&
//         account.type === "oauth" && // ✅ IMPORTANT
//         profile?.email
//       ) {
//         const email = profile.email.toLowerCase();

//         let user = await prisma.user.findUnique({
//           where: { email },
//         });

//         const otp = String(randomInt(100000, 999999));
//         const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//         if (!user) {
//           user = await prisma.user.create({
//             data: {
//               email,
//               username: profile.name || email.split("@")[0],
//               password_hash: "google-oauth",
//               user_type: UserType.both,
//               otp_code: otp,
//               otp_expires: otpExpires,
//               email_verified: false,
//             },
//           });
//         } else {
//           await prisma.user.update({
//             where: { email },
//             data: {
//               otp_code: otp,
//               otp_expires: otpExpires,
//               email_verified: false,
//             },
//           });
//         }

//         await resend.emails.send({
//           from: "BarterHub <no-reply@postocard.com>",
//           to: email,
//           subject: "Your BarterHub Login OTP",
//           html: `
//             <h2>Login Verification</h2>
//             <p>Your OTP code:</p>
//             <h1 style="font-size:28px; letter-spacing:6px;">${otp}</h1>
//             <p>Expires in 10 minutes.</p>
//           `,
//         });

//         token.user_id = user.user_id;
//         token.email = user.email;
//         token.name = user.username;
//         token.user_type = user.user_type;
//         token.otp_verified = false;

//         token.auth_token = generateToken({
//           user_id: String(user.user_id),
//           email: user.email,
//           name: user.username,
//           user_type: user.user_type,
//         });
//       }

//       // 🔁 Always re-check OTP verification status
//       if (token.email) {
//         const dbUser = await prisma.user.findUnique({
//           where: { email: token.email },
//           select: { email_verified: true },
//         });

//         token.otp_verified = !!dbUser?.email_verified;
//       }

//       return token;
//     },

//     // ✅ KEEP SESSION, JUST FLAG OTP STATUS
//     async session({ session, token }) {
//       if (session.user) {
//         (session as any).requires_verification = !token.otp_verified;

//         (session.user as any).user_id = token.user_id;
//         (session.user as any).user_type = token.user_type;
//         session.user.name = token.name as string;
//         session.user.email = token.email as string;
//       }

//       (session as any).auth_token = token.auth_token;
//       return session;
//     },

//     // ✅ DO NOT OVERRIDE CALLBACK URL
//     async redirect({ url, baseUrl }) {
//       if (url.startsWith("/")) return `${baseUrl}${url}`;
//       if (new URL(url).origin === baseUrl) return url;
//       return `${baseUrl}/home`;
//     },
//   },
// };


// lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { UserType } from "@prisma/client";
import { randomInt } from "crypto";
import { resend } from "@/lib/resend";
import type { User } from "next-auth";


export const authOptions: NextAuthOptions = {
  providers: [
    // =========================
    // GOOGLE LOGIN (OTP FLOW)
    // =========================
  GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  allowDangerousEmailAccountLinking: true,
  authorization: {
    params: {
      prompt: "select_account",
    },
  },
}),


    // =========================
    // MANUAL LOGIN (OTP VERIFIED)
    // =========================
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials, _req) {
    if (!credentials?.email) return null;

    const user = await prisma.user.findUnique({
      where: { email: credentials.email.toLowerCase() },
    });

    if (!user) return null;

    // ✅ EXPLICIT CAST — this fixes the TS error
    return {
      id: String(user.user_id),
      email: user.email,
      name: user.username,
    } as User;
  },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // @ts-expect-error supported at runtime
  trustHost: true,

  cookies: process.env.NODE_ENV === "production"
    ? {
        sessionToken: {
          name: "__Secure-next-auth.session-token",
          options: {
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
          },
        },
      }
    : {},

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  callbacks: {
    // =========================
    // JWT CALLBACK
    // =========================
    async jwt({ token, user, account, profile }) {
      /**
       * 🔑 MANUAL LOGIN (Credentials)
       * Happens AFTER OTP verification
       */
      if (user && account?.provider === "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!dbUser) return token;

        token.user_id = dbUser.user_id;
        token.email = dbUser.email;
        token.name = dbUser.username;
        token.user_type = dbUser.user_type;
        token.otp_verified = true;

        token.auth_token = generateToken({
          user_id: String(dbUser.user_id),
          email: dbUser.email,
          name: dbUser.username,
          user_type: dbUser.user_type,
        });

        return token;
      }

      /**
       * 🔐 GOOGLE LOGIN → SEND OTP ONLY FOR NEW / UNVERIFIED USERS
       * Already-verified users skip OTP and go straight to home.
       */
      if (
        account?.provider === "google" &&
        account.type === "oauth" &&
        profile?.email
      ) {
        const email = profile.email.toLowerCase();

        let dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!dbUser) {
          // NEW user — create account and send first-time OTP
          const otp = String(randomInt(100000, 999999));
          const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

          dbUser = await prisma.user.create({
            data: {
              email,
              username: profile.name || email.split("@")[0],
              password_hash: "google-oauth",
              user_type: UserType.both,
              otp_code: otp,
              otp_expires: otpExpires,
              email_verified: false,
            },
          });

          try {
            await resend.emails.send({
              from: "BarterHub <no-reply@postocard.com>",
              to: email,
              subject: "Your BarterHub Login OTP",
              html: `
                <h2>Login Verification</h2>
                <p>Your OTP code:</p>
                <h1 style="font-size:28px; letter-spacing:6px;">${otp}</h1>
                <p>Expires in 10 minutes.</p>
              `,
            });
          } catch (emailErr) {
            console.error("[google-auth] OTP email failed:", emailErr);
          }

          token.otp_verified = false;
        } else if (!dbUser.email_verified) {
          // EXISTING but unverified — resend OTP (don't touch email_verified)
          const otp = String(randomInt(100000, 999999));
          const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

          await prisma.user.update({
            where: { email },
            data: { otp_code: otp, otp_expires: otpExpires },
          });

          try {
            await resend.emails.send({
              from: "BarterHub <no-reply@postocard.com>",
              to: email,
              subject: "Your BarterHub Login OTP",
              html: `
                <h2>Login Verification</h2>
                <p>Your OTP code:</p>
                <h1 style="font-size:28px; letter-spacing:6px;">${otp}</h1>
                <p>Expires in 10 minutes.</p>
              `,
            });
          } catch (emailErr) {
            console.error("[google-auth] OTP email failed:", emailErr);
          }

          token.otp_verified = false;
        } else {
          // RETURNING verified user — no OTP needed, grant immediate access
          token.otp_verified = true;
        }

        token.user_id = dbUser.user_id;
        token.email = dbUser.email;
        token.name = dbUser.username;
        token.user_type = dbUser.user_type;

        token.auth_token = generateToken({
          user_id: String(dbUser.user_id),
          email: dbUser.email,
          name: dbUser.username,
          user_type: dbUser.user_type,
        });
      }

      /**
       * 🔁 Always re-check OTP verification
       */
      if (token.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: token.email as string },
      select: {
        email_verified: true,
        profile_complete: true,
        terms_accepted: true,
      },
    });

    token.otp_verified = !!dbUser?.email_verified;
    token.profile_complete = !!dbUser?.profile_complete;
    token.terms_accepted = !!dbUser?.terms_accepted;
  }


      return token;
    },

    // =========================
    // SESSION CALLBACK
    // =========================
   async session({ session, token }) {
  if (session.user) {
    (session as any).requires_verification = !token.otp_verified;

    (session.user as any).user_id = token.user_id;
    (session.user as any).user_type = token.user_type;

    (session.user as any).profile_complete = !!token.profile_complete;
    (session.user as any).terms_accepted = !!token.terms_accepted;

    session.user.name = token.name as string;
    session.user.email = token.email as string;
  }

  (session as any).auth_token = token.auth_token;
  return session;
},


    // =========================
    // REDIRECT
    // =========================
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/home`;
    },
  },
};
