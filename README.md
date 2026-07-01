# 🏭 Bharat Hydraulics Inventory System

A modern, full-stack inventory and sales management system built exclusively for Bharat Hydraulics. This application is designed to handle stock tracking, invoice generation, customer credit limits, automated communications, and financial reporting with an intuitive, dynamic user interface.

## 🚀 Features

- **Inventory Management**: Track products, stock levels, locations, and pricing.
- **Sales & Invoices**: Generate invoices dynamically. Stock is automatically deducted from inventory upon sale.
- **Purchases & Suppliers**: Log new stock purchases from suppliers. Stock automatically increments.
- **Role-Based Security**: 
  - `OWNER` has full access, including safe deletions and financial reversals.
  - `STAFF` can generate bills and add items, but cannot delete records or access restricted tabs (Reports, Settings).
- **Financial Safeguards**: Prevents selling below purchase price (profit warnings) and stops billing if a customer exceeds their defined credit limit.
- **Smart Communications**: 1-click WhatsApp follow-ups for pending payments and clients who haven't visited in 15 days.
- **AI Assistant**: Built-in Groq AI Chat Widget to help you query data or navigate the app.
- **Database Backups & Export**: Generate monthly GST Excel Reports or automatically backup the database.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: Vanilla CSS & [Lucide Icons](https://lucide.dev/)
- **AI Integration**: [Groq API](https://groq.com/)
- **Charts**: [Recharts](https://recharts.org/)

## 💻 Local Development Setup

To run this project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mkhan0012/Inventory.git
   cd Inventory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   DATABASE_URL="your_neon_postgres_url"
   NEXTAUTH_SECRET="your_secret_key"
   NEXTAUTH_URL="http://localhost:3000"
   GROQ_API_KEY="your_groq_api_key"
   ```

4. **Sync the Database & Seed Users:**
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ☁️ Deploying to Vercel

This app is fully optimized for Vercel's serverless environment.

1. Import this repository into your Vercel Dashboard.
2. In the deployment settings, add all of your Environment Variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `GROQ_API_KEY`).
3. Set `NEXTAUTH_URL` to your live Vercel domain (e.g., `https://bharat-hydraulics.vercel.app`).
4. Vercel will automatically run `npm run build` and launch your production application!

---
*Developed for Bharat Hydraulics*
