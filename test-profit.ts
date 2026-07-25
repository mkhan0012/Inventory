import { getDashboardStats } from './src/actions/dashboard.ts';
import { getMonthProfit } from './src/actions/profit-allocation.ts';

async function main() {
  const stats = await getDashboardStats();
  console.log("Dashboard Stats Year Chart:");
  console.log(stats.chartData.year);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let targetMonth = currentMonth;
  let targetYear = currentYear;

  const profit = await getMonthProfit(targetYear, targetMonth);
  console.log(`\nProfitAllocation calculated for ${targetMonth}/${targetYear}:`, profit);
  
  const profit2 = await getMonthProfit(targetYear, targetMonth - 1);
  console.log(`ProfitAllocation calculated for ${targetMonth - 1}/${targetYear}:`, profit2);
}

main().catch(console.error);
