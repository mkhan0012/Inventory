import ProfitManagementClient from "@/components/ProfitManagementClient";
import { getMonthProfit, getProfitAllocations } from "@/actions/profit-allocation";

export default async function ProfitManagementPage({
  searchParams
}: {
  searchParams: Promise<{ month?: string; year?: string }> | { month?: string; year?: string }
}) {
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
    <ProfitManagementClient
      initialMonth={targetMonth}
      initialYear={targetYear}
      profit={profit}
      allocations={allocations}
    />
  );
}
