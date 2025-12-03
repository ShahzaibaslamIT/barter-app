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
//       // ✅ allows Google to link with an existing credentials account safely
//       allowDangerousEmailAccountLinking: true,
//     }),
//   ],

//   secret: process.env.NEXTAUTH_SECRET,

//   session: {
//     strategy: "jwt",
//   },

//   // @ts-expect-error: trustHost is supported at runtime but missing in types
// trustHost: true,

//   // ✅ mobile-safe cookies
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
//         // Find or create user in your own User table
//         let user = await prisma.user.findUnique({
//           where: { email: profile.email },
//         });

//         if (!user) {
//           user = await prisma.user.create({
//             data: {
//               email: profile.email,
//               username: profile.name || profile.email.split("@")[0],
//               password_hash: "google-oauth", // identifies Google-linked users
//               user_type: UserType.both,
//             },
//           });
//         }

//         // Attach DB fields into JWT
//         token.user_id = user.user_id;
//         token.name = user.username;
//         token.email = user.email;
//         token.user_type = user.user_type;

//         // Also issue your custom JWT for API auth
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
//         (session.user as any).user_id = token.user_id as number;
//         (session.user as any).user_type = token.user_type as UserType;
//         session.user.name = token.name as string;
//         session.user.email = token.email as string;
//       }

//       (session as any).auth_token = token.auth_token as string;
//       return session;
//     },

//     async redirect({ baseUrl }) {
//       return `${baseUrl}/home`;
//     },
//   },
// };



// lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { UserType } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  // @ts-expect-error — trustHost is supported at runtime
  trustHost: true,

  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
      },
    },
  },

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.email,
              username: profile.name || profile.email.split("@")[0],
              password_hash: "google-oauth",
              user_type: UserType.both,
            },
          });
        }

        token.user_id = user.user_id;
        token.name = user.username;
        token.email = user.email;
        token.user_type = user.user_type;

        token.auth_token = generateToken({
          user_id: String(user.user_id),
          email: user.email,
          name: user.username,
          user_type: user.user_type,
        });
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).user_id = token.user_id;
        (session.user as any).user_type = token.user_type;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }

      (session as any).auth_token = token.auth_token;
      return session;
    },

    // Simple, safe redirect: after login, go home
    async redirect({ url, baseUrl }) {
      // If this is the Google callback, send user to /home
      if (url.includes("/api/auth/callback/google")) {
        return `${baseUrl}/home`;
      }

      // For any relative path, prefix with baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) return url;
      } catch {
        // ignore parse errors and fall through
      }

      // Fallback: send to home
      return `${baseUrl}/home`;
    },
  },
};
