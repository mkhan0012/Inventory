"use server";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";
import { getDashboardStats } from "./dashboard";
import { getAdvancedBiData } from "./reports";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function cleanAIResponse(text: string | null | undefined, fallback: string): string {
  if (!text) return fallback;
  const stripped = text.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '').trim();
  return stripped === '' ? fallback : stripped;
}

export async function askAI(query: string) {
  try {
    // 1. Fetch live summary data
    const stats = await getDashboardStats();
    const customers = await prisma.customer.findMany();
    const products = await prisma.product.findMany();
    const expenses = await prisma.expense.findMany();
    
    // Calculate total expenses to give a better profitability view
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const formatInr = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    const contextData = {
      businessOverview: {
        allTimeSales: formatInr(stats.allTimeSales),
        allTimeProfit: formatInr(stats.allTimeProfit),
        allTimePurchases: formatInr(stats.allTimePurchases),
        totalExpenses: formatInr(totalExpenses),
        netIncome: formatInr(stats.allTimeProfit - totalExpenses),
        stockValue: formatInr(stats.stockValue),
        todaysSales: formatInr(stats.todaysSales),
        todaysProfit: formatInr(stats.todaysProfit),
        thisMonthSales: formatInr(stats.monthlySales),
        thisMonthProfit: formatInr(stats.monthlyProfit),
        totalPendingDuesFromCustomers: formatInr(stats.duePayments),
      },
      inventoryAlerts: {
        outOfStock: stats.outOfStockProducts.map(p => p.name),
        lowStock: stats.lowStockProducts.map(p => ({ name: p.name, stock: p.stock })),
      },
      recentInvoices: stats.recentSales.map(s => ({ invoiceNo: s.invoiceNo, total: formatInr(s.total), status: s.status, date: s.date })),
      topCustomers: customers.sort((a,b) => b.totalPurchases - a.totalPurchases).slice(0, 5).map(c => ({ name: c.name, totalBought: formatInr(c.totalPurchases), pendingDues: formatInr(c.dueAmount) })),
      inventoryCatalog: products.map(p => ({
        code: p.code,
        name: p.name,
        stock: p.stock,
        price: formatInr(p.price),
        purchasePrice: formatInr(p.purchasePrice),
        category: p.category,
        location: p.location,
      })),
    };

    const systemPrompt = `You are a highly intelligent Expert Business Consultant and 'Super AI' for Bharat Hydraulics. 
Here is the LIVE real-time state of the business data in JSON format:
${JSON.stringify(contextData, null, 2)}

Your Goal: Provide brilliant, highly structured, and insightful answers.
- PROACTIVE TOOLS: If the user asks to add/edit anything, USE YOUR TOOLS immediately. Don't ask for permission if the data is provided.
- DEEP INSIGHTS: When asked for advice, don't just state the obvious. Analyze the data (e.g. pending dues vs net profit, slow moving stock) and offer 3 clear, actionable strategies.
- STRUCTURE: Use beautiful Markdown formatting. Use headings, bold text, and bullet points. Make your response look like a premium consulting report.
- CRITICAL: DO NOT invent, hallucinate, or recalculate any numbers. Use EXACT figures from the JSON.`;

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
      },
      {
        type: "function",
        function: {
          name: "add_product",
          description: "Adds a new product to the inventory system.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the product" },
              code: { type: "string", description: "Unique code for the product" },
              category: { type: "string", description: "Category of the product" },
              price: { type: "number", description: "Selling price" },
              purchasePrice: { type: "number", description: "Purchase price (default 0)" },
              stock: { type: "number", description: "Initial stock quantity (default 0)" },
              unit: { type: "string", description: "Unit of measurement (e.g., Pcs, Ltr, Kg)" },
              location: { type: "string", description: "Storage location (e.g., Store Front, Warehouse)" }
            },
            required: ["name", "code", "category", "price", "unit"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_stock",
          description: "Updates the stock quantity of an existing product.",
          parameters: {
            type: "object",
            properties: {
              productCode: { type: "string", description: "The unique code of the product" },
              quantityToAdd: { type: "number", description: "The quantity to ADD to the current stock. Use negative numbers to reduce stock." }
            },
            required: ["productCode", "quantityToAdd"]
          }
        }
      }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "groq/compound", 
      temperature: 0.5,
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
          } else if (toolCall.function.name === 'add_product') {
            const args = JSON.parse(toolCall.function.arguments);
            await prisma.product.create({ 
              data: { 
                name: args.name, 
                code: args.code, 
                category: args.category, 
                price: args.price, 
                purchasePrice: args.purchasePrice || 0,
                stock: args.stock || 0,
                unit: args.unit,
                location: args.location || "Store Front"
              }
            });
            result = `Successfully added product ${args.name} (Code: ${args.code}).`;
          } else if (toolCall.function.name === 'update_stock') {
            const args = JSON.parse(toolCall.function.arguments);
            const product = await prisma.product.findUnique({ where: { code: args.productCode } });
            if (product) {
              const newStock = product.stock + args.quantityToAdd;
              const status = newStock <= 0 ? "Out of Stock" : newStock <= 10 ? "Low Stock" : "In Stock";
              await prisma.product.update({
                where: { code: args.productCode },
                data: { stock: newStock, status }
              });
              result = `Successfully updated stock for ${product.name}. New stock is ${newStock}.`;
            } else {
              result = `Error: Product with code ${args.productCode} not found.`;
            }
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
        model: "groq/compound",
        temperature: 0.5,
      });
      return cleanAIResponse(finalResponse.choices[0]?.message?.content, "Action completed.");
    }

    return cleanAIResponse(responseMessage?.content, "Sorry, I couldn't generate an answer.");
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
      messages: [{ role: "user", content: systemPrompt }],
      model: "groq/compound", 
      temperature: 0.7,
      max_tokens: 1024,
    });

    return cleanAIResponse(chatCompletion.choices[0]?.message?.content, "Sales are looking steady today; keep up the great work!");
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
Do not make up any numbers. Be concise and professional. Do NOT use introductory or concluding conversational filler like "Here is the report", just output the markdown report directly.
IMPORTANT: ALWAYS format currency and money values using the Indian Rupee symbol (₹) and proper Indian comma placement (e.g. ₹4,25,799.21). NEVER use Dollars ($).
CRITICAL: DO NOT invent, hallucinate, or recalculate any numbers! ONLY use the EXACT numerical values provided in the JSON data, taking care to format them correctly without changing the actual value.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "groq/compound",
      temperature: 0.4
    });
    
    return cleanAIResponse(chatCompletion.choices[0]?.message?.content, "Failed to generate report.");
  } catch (error: any) {
    console.error("AI CEO Briefing Error:", error);
    return "Error generating briefing: " + error.message;
  }
}
