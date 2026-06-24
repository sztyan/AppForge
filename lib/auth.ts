import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

const logFullError = (label: string, error: any, extra?: any) => {
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

let _prismaAdapter: any;
try {
  _prismaAdapter = PrismaAdapter(prisma);
} catch (e: any) {
  logFullError("PrismaAdapter initialization failed:", e);
  _prismaAdapter = undefined;
}

const wrapAdapter = (adapter: any) => {
  if (!adapter) return undefined;

  return new Proxy(adapter, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;

      return async (...args: any[]) => {
        try {
          return await value.apply(target, args);
        } catch (e: any) {
          logFullError(`Prisma adapter method "${String(prop)}" failed:`, e, { args });
          throw e;
        }
      };
    },
  });
};

const wrappedAdapter = wrapAdapter(_prismaAdapter);

export const authOptions = {
  adapter: wrappedAdapter,
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger, isNewUser }: any) {
      try {
        return token;
      } catch (e: any) {
        logFullError("NextAuth jwt callback error:", e, {
          user: user?.email,
          provider: account?.provider,
          trigger,
          isNewUser,
        });
        throw e;
      }
    },
    async session({ session, token, user }: any) {
      try {
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            email: user.email,
          },
        };
      } catch (e: any) {
        logFullError("NextAuth session callback error:", e, {
          user: user?.email,
          tokenEmail: token?.email,
        });
        throw e;
      }
    },
    async signIn({ user, account, profile }: any) {
      try {
        console.log("NextAuth signIn callback", {
          user: user?.email,
          provider: account?.provider,
          profileEmail: profile?.email,
        });
        return true;
      } catch (e: any) {
        logFullError("NextAuth signIn callback error:", e, {
          user: user?.email,
          provider: account?.provider,
        });
        throw e;
      }
    },
  },
  events: {
    async error(payload: any) {
      logFullError("NextAuth event error:", payload?.error ?? payload, payload);
    },
    async signIn(message: any) {
      console.log("NextAuth event signIn:", {
        user: message.user?.email,
        provider: message.account?.provider,
        isNewUser: message.isNewUser,
      });
    },
  },
  logger: {
    error(code: any, metadata?: any) {
      console.error("NextAuth logger error:", code, metadata);
    },
    warn(code: any) {
      console.warn("NextAuth logger warn:", code);
    },
    debug(code: any) {
      console.debug("NextAuth logger debug:", code);
    },
  },
};

export async function getServerAuthSession() {
  return nextAuthGetServerSession(authOptions as any);
}

export default NextAuth(authOptions as any);
