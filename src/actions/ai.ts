"use server";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";
import { getDashboardStats } from "./dashboard";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askAI(query: string) {
  try {
    // 1. Fetch live summary data
    const stats = await getDashboardStats();
    const customers = await prisma.customer.findMany();
    const products = await prisma.product.findMany();
    
    const contextData = {
      businessOverview: {
        allTimeSales: stats.allTimeSales,
        allTimeProfit: stats.allTimeProfit,
        allTimePurchases: stats.allTimePurchases,
        stockValue: stats.stockValue,
        todaysSales: stats.todaysSales,
        todaysProfit: stats.todaysProfit,
        thisMonthSales: stats.monthlySales,
        thisMonthProfit: stats.monthlyProfit,
        totalPendingDuesFromCustomers: stats.duePayments,
      },
      inventoryAlerts: {
        outOfStock: stats.outOfStockProducts.map(p => p.name),
        lowStock: stats.lowStockProducts.map(p => ({ name: p.name, stock: p.stock })),
      },
      recentInvoices: stats.recentSales.map(s => ({ invoiceNo: s.invoiceNo, total: s.total, status: s.status, date: s.date })),
      topCustomers: customers.sort((a,b) => b.totalPurchases - a.totalPurchases).slice(0, 5).map(c => ({ name: c.name, totalBought: c.totalPurchases, pendingDues: c.dueAmount })),
      inventoryCatalog: products.map(p => ({
        code: p.code,
        name: p.name,
        stock: p.stock,
        price: p.price,
        purchasePrice: p.purchasePrice,
        category: p.category,
        location: p.location,
      })),
    };

    const systemPrompt = `You are a highly intelligent Business Assistant for Bharat Hydraulics. 
Here is the LIVE real-time state of the business data in JSON format, which includes all historical data you need:
${JSON.stringify(contextData, null, 2)}

Answer the user's question accurately based ONLY on this provided data. 
- Keep your answer brief, professional, and easy to read.
- You now have access to ALL-TIME historical totals (allTimeSales, allTimeProfit, allTimePurchases). Use them when the user asks about total historical data, all-time performance, previous months, or total profit.
- If you don't know the answer based on the JSON, politely say you don't have that specific data.
- Format numbers with commas and currency symbols nicely (e.g. ₹5,000.00).`;

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
