"use server";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askAI(query: string) {
  try {
    // 1. Fetch live summary data
    const products = await prisma.product.findMany();
    const customers = await prisma.customer.findMany();
    
    // Fetch last 30 days of sales
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSales = await prisma.invoice.findMany({
      where: { date: { gte: thirtyDaysAgo } }
    });
    const totalRecentSales = recentSales.reduce((acc, s) => acc + s.total, 0);

    const contextData = {
      overview: {
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalSalesLast30Days: totalRecentSales,
      },
      lowStockAlerts: products.filter(p => p.stock < 10).map(p => ({ name: p.name, stock: p.stock })),
      top5Customers: customers.sort((a,b) => b.totalPurchases - a.totalPurchases).slice(0, 5).map(c => ({ name: c.name, totalBought: c.totalPurchases, pendingDues: c.dueAmount })),
      topDueCustomers: customers.filter(c => c.dueAmount > 0).sort((a,b) => b.dueAmount - a.dueAmount).slice(0, 5).map(c => ({ name: c.name, pendingDues: c.dueAmount }))
    };

    const systemPrompt = `You are a highly intelligent Business Assistant for Bharat Hydraulics. 
Here is the LIVE real-time state of the business data in JSON format:
${JSON.stringify(contextData, null, 2)}

Answer the user's question accurately based ONLY on this provided data. 
- Keep your answer brief, professional, and easy to read.
- If they ask about sales, you only have data for the last 30 days.
- If you don't know the answer based on the JSON, politely say you don't have that specific data.
- Format numbers nicely (e.g. ₹5,000).`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.3,
    });

    return chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate an answer.";
  } catch (error: any) {
    console.error("AI Error:", error);
    return "Error connecting to AI: " + error.message;
  }
}
