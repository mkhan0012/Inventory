import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'OWNER') {
    return new NextResponse("Unauthorized: Owners only", { status: 401 });
  }

  try {
    // With PostgreSQL on Vercel/Neon, backups are automatically handled by the database provider.
    // We cannot download a .db file anymore.
    const message = "Your database is now securely hosted on Vercel Postgres / Neon! Backups are handled automatically in your cloud dashboard.";
    
    return new NextResponse(message, {
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  } catch (error) {
    console.error("Backup failed", error);
    return new NextResponse("Failed to generate backup", { status: 500 });
  }
}
