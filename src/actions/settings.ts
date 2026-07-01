"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: "singleton" }
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: "singleton",
        shopName: "Bharat Hydraulics",
        address: "",
        gstNumber: "",
        defaultTax: 18.0
      }
    });
  }

  return settings;
}

export async function updateSettings(data: {
  shopName: string;
  address: string;
  gstNumber: string;
  defaultTax: number;
}) {
  const settings = await prisma.settings.update({
    where: { id: "singleton" },
    data
  });

  revalidatePath('/settings');
  revalidatePath('/');
  return settings;
}
