import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";

const logFullError = (label: string, error: unknown, extra?: unknown) => {
  console.error(label);
  if (error instanceof Error) {
    console.error(error.stack ?? error.message ?? error);
  } else {
    console.error(error);
  }
  if (extra !== undefined) {
    console.error(extra);
  }
};

let _prismaAdapter: Adapter | undefined;
try {
  _prismaAdapter = PrismaAdapter(prisma) as Adapter;
} catch (error) {
  logFullError("PrismaAdapter initialization failed:", error);
  _prismaAdapter = undefined;
}

const wrapAdapter = (adapter?: Adapter) => {
  if (!adapter) return undefined;

  return new Proxy(adapter, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;

      return async (...args: unknown[]) => {
        try {
          return await value.apply(target, args);
        } catch (error) {
          logFullError(`Prisma adapter method "${String(prop)}" failed:`, error, { args });
          throw error;
        }
      };
    },
  });
};

const wrappedAdapter = wrapAdapter(_prismaAdapter);

export const authOptions: NextAuthOptions = {
  adapter: wrappedAdapter,
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        return token;
      } catch (error) {
        logFullError("NextAuth jwt callback error:", error, {
          user: user?.email,
        });
        throw error;
      }
    },
    async session({ session, user }) {
      try {
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            email: user.email,
          },
        };
      } catch (error) {
        logFullError("NextAuth session callback error:", error, {
          user: user?.email,
        });
        throw error;
      }
    },
    async signIn({ user, account, profile }) {
      try {
        console.log("NextAuth signIn callback", {
          user: user?.email,
          provider: account?.provider,
          profileEmail: profile?.email,
        });
        return true;
      } catch (error) {
        logFullError("NextAuth signIn callback error:", error, {
          user: user?.email,
          provider: account?.provider,
        });
        throw error;
      }
    },
  },
  events: {
    async signIn(message) {
      console.log("NextAuth event signIn:", {
        user: message.user?.email,
        provider: message.account?.provider,
        isNewUser: message.isNewUser,
      });
    },
  },
  logger: {
    error(code, metadata) {
      console.error("NextAuth logger error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth logger warn:", code);
    },
    debug(code) {
      console.debug("NextAuth logger debug:", code);
    },
  },
};

export async function getServerAuthSession(): Promise<Session | null> {
  return nextAuthGetServerSession(authOptions);
}

export default NextAuth(authOptions);
