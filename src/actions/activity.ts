"use server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function logActivity(action: string, details: string, userName: string, userRole: string) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        details,
        userName,
        userRole
      }
    });
  } catch (e) {
    console.error("Activity logging failed", e);
  }
}

export async function getAuditLogs() {
  return await prisma.activityLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 100
  });
}
