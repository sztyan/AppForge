import { NextResponse } from 'next/server';

export async function GET() {
  const hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  const hasDatabaseUrl = !!process.env.DATABASE_URL;

  return NextResponse.json({
    GOOGLE_CLIENT_ID: hasGoogleClientId,
    GOOGLE_CLIENT_SECRET: hasGoogleClientSecret,
    NEXTAUTH_SECRET: hasNextAuthSecret,
    DATABASE_URL: hasDatabaseUrl,
  });
}
