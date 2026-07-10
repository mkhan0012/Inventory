"use server";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";
import { getDashboardStats } from "./dashboard";
import { getAdvancedBiData } from "./reports";

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

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ];

    const tools: any[] = [
      {
        type: "function",
        function: {
          name: "create_customer",
          description: "Creates a new customer in the database.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Customer name" },
              phone: { type: "string", description: "Customer phone number" },
              creditLimit: { type: "number", description: "Credit limit (default 50000)" }
            },
            required: ["name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "record_expense",
          description: "Logs a new operational expense.",
          parameters: {
            type: "object",
            properties: {
              description: { type: "string", description: "Description of expense" },
              amount: { type: "number", description: "Expense amount" },
              category: { type: "string", description: "Category of expense (e.g., Electricity, Tea)" }
            },
            required: ["description", "amount", "category"]
          }
        }
      }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile", 
      temperature: 0.3,
      tools,
      tool_choice: "auto",
    });

    const responseMessage = chatCompletion.choices[0]?.message;

    if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
      messages.push(responseMessage);
      
      for (const toolCall of responseMessage.tool_calls) {
        let result = "";
        try {
          if (toolCall.function.name === 'create_customer') {
            const args = JSON.parse(toolCall.function.arguments);
            await prisma.customer.create({ data: { name: args.name, phone: args.phone || "", creditLimit: args.creditLimit || 50000 }});
            result = `Successfully created customer ${args.name}.`;
          } else if (toolCall.function.name === 'record_expense') {
            const args = JSON.parse(toolCall.function.arguments);
            await prisma.expense.create({ data: { description: args.description, amount: args.amount, category: args.category }});
            result = `Successfully recorded expense of ₹${args.amount} for ${args.description}.`;
          }
        } catch (e: any) {
          result = `Error: ${e.message}`;
        }
        
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: result
        });
      }
      
      const finalResponse = await groq.chat.completions.create({
        messages,
        model: "llama-3.3-70b-versatile",
      });
      return finalResponse.choices[0]?.message?.content || "Action completed.";
    }

    return responseMessage?.content || "Sorry, I couldn't generate an answer.";
  } catch (error: any) {
    console.error("AI Error:", error);
    return "Error connecting to AI: " + error.message;
  }
}

export async function generateDailyInsight() {
  try {
    const stats = await getDashboardStats();
    
    const contextData = {
      todaysSales: stats.todaysSales,
      monthlySales: stats.monthlySales,
      pendingDues: stats.duePayments,
      outOfStockCount: stats.outOfStockProducts.length,
      lowStockCount: stats.lowStockProducts.length,
    };

    const systemPrompt = `You are a highly intelligent Business Assistant for Bharat Hydraulics. 
Here is a quick snapshot of today's stats:
${JSON.stringify(contextData, null, 2)}

Write exactly ONE brief, encouraging, and highly professional sentence summarizing the business's day. 
Do not use greetings like "Good morning". Just the insight.
Example: "Sales are looking steady at ₹X today, but note that you have Y items running low on stock."
Be creative but extremely concise. Use currency symbol ₹ where appropriate.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.7,
      max_tokens: 50,
    });

    return chatCompletion.choices[0]?.message?.content || "Sales are looking steady today; keep up the great work!";
  } catch (error: any) {
    console.error("AI Insight Error:", error);
    return "Welcome back to Bharat Hydraulics dashboard.";
  }
}

export async function generateCEOBriefing() {
  try {
    const start = new Date();
    start.setDate(1); 
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); 
    end.setMilliseconds(-1);

    const bi = await getAdvancedBiData(start.toISOString(), end.toISOString());
    
    const prompt = `You are the Chief Financial Officer (CFO) of Bharat Hydraulics. 
Write a highly professional, Markdown-formatted Weekly CEO Briefing based on this data:
${JSON.stringify(bi, null, 2)}

Include sections for:
1. Executive Summary
2. Profitability Analysis (mention the waterfall: Revenue, COGS, Gross Profit, Expenses, Net Profit)
3. Year-over-Year Growth (sales and profit growth %)
4. Category Performance
Do not make up any numbers. Be concise and professional. Do NOT use introductory or concluding conversational filler like "Here is the report", just output the markdown report directly.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4
    });
    
    return chatCompletion.choices[0]?.message?.content || "Failed to generate report.";
  } catch (error: any) {
    console.error("AI CEO Briefing Error:", error);
    return "Error generating briefing: " + error.message;
  }
}
