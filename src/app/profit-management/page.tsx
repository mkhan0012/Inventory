import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProfitManagementClient from "@/components/ProfitManagementClient";
import { getMonthProfit, getProfitAllocations } from "@/actions/profit-allocation";

export default async function ProfitManagementPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string; year?: string }> | { month?: string; year?: string }
}) {
  // Await searchParams if it is a promise (Next.js 15+ behavior)
  const resolvedParams = await Promise.resolve(searchParams);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let targetMonth = currentMonth - 1;
  let targetYear = currentYear;

  if (targetMonth < 0) {
    targetMonth = 11;
    targetYear -= 1;
  }

  if (resolvedParams?.month) targetMonth = parseInt(resolvedParams.month);
  if (resolvedParams?.year) targetYear = parseInt(resolvedParams.year);

  const profit = await getMonthProfit(targetYear, targetMonth);
  const allocations = await getProfitAllocations(targetYear, targetMonth);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <ProfitManagementClient
          initialMonth={targetMonth}
          initialYear={targetYear}
          profit={profit}
          allocations={allocations}
        />
      </div>
    </div>
  );
}
