import React, { useState, useMemo } from "react";
import useAccounting from "@/Hooks/useAccounting";
import useExpenses from "@/Hooks/useExpenses";
import Loader from "@/Components/Global/Loader";

// Expense analytics helper
const calculateExpenseAnalytics = (expenses) => {
  if (!expenses || !Array.isArray(expenses)) return { total: 0, categories: [] };

  const total = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  const catMap = expenses.reduce((acc, exp) => {
    const cat = exp.category || "Other";
    acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0);
    return acc;
  }, {});

  const sortedCats = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return { total, categories: sortedCats };
};

const ReportsDashboard = () => {
  // ---- Tenant Selection ----
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [tenantId, setTenantId] = useState(user.tenantId || 1);

  const { getTrialBalanceQuery, getLedgerQuery } = useAccounting();
  const { getAllExpensesQuery } = useExpenses();

  const { data: trialBalance, isLoading: tbLoading } = getTrialBalanceQuery(tenantId);
  const { isLoading: ledgerLoading } = getLedgerQuery(tenantId);
  const { data: expenses, isLoading: expLoading } = getAllExpensesQuery(tenantId);

  const isLoading = tbLoading || ledgerLoading || expLoading;

  // ---- Expense Analytics ----
  const analytics = useMemo(() => calculateExpenseAnalytics(expenses), [expenses]);

  // ---- Financial Statement Calculations ----
  const financials = useMemo(() => {
    if (!trialBalance || !Array.isArray(trialBalance)) return {
      revenue: [],
      expenses: [],
      assets: [],
      liabilities: [],
      equity: [],
      totals: { revenue: 0, expenses: 0, netIncome: 0, assets: 0, liabilities: 0, equity: 0 }
    };

    // Categorize accounts based on simple name matching
    const revenueNames = ["Revenue", "Sales"];
    const expenseNames = ["Expense", "Utilities", "Rent"];
    const assetNames = ["Cash", "Receivable", "Accounts"];
    const liabilityNames = ["Payable", "Liabilities"];
    const equityNames = ["Equity", "Capital"];

    const revenue = trialBalance.filter(acc =>
      revenueNames.some(name => acc.accountName.includes(name))
    );
    const expensesAcc = trialBalance.filter(acc =>
      expenseNames.some(name => acc.accountName.includes(name))
    );
    const assets = trialBalance.filter(acc =>
      assetNames.some(name => acc.accountName.includes(name))
    );
    const liabilities = trialBalance.filter(acc =>
      liabilityNames.some(name => acc.accountName.includes(name))
    );
    const equity = trialBalance.filter(acc =>
      equityNames.some(name => acc.accountName.includes(name))
    );

    const sumBalance = (arr, isRevenue = false) =>
      arr.reduce((sum, acc) => {
        const balance = (acc.debit || 0) - (acc.credit || 0);
        return sum + (isRevenue ? -balance : balance); // revenue = credit - debit
      }, 0);

    const totals = {
      revenue: sumBalance(revenue, true),
      expenses: sumBalance(expensesAcc),
      netIncome: sumBalance(revenue, true) - sumBalance(expensesAcc),
      assets: sumBalance(assets),
      liabilities: sumBalance(liabilities),
      equity: sumBalance(equity)
    };

    return { revenue, expenses: expensesAcc, assets, liabilities, equity, totals };
  }, [trialBalance]);

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* ---- Header & Tenant Selector ---- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Reports Centre</h1>
          <p className="text-gray-500 text-sm">Financial intelligence for Tenant #{tenantId}</p>
        </div>
        <div className="flex gap-3 items-center">
          <label className="text-gray-500 text-sm">Tenant ID:</label>
          <input
            type="number"
            value={tenantId}
            onChange={(e) => setTenantId(Number(e.target.value))}
            className="input w-20 text-sm"
          />
        </div>
      </div>

      {/* ---- Financial Summary ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trial Balance */}
        <div className="card p-6 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-dark dark:text-light mb-6">Trial Balance</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {trialBalance?.map((acc, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-bg/40 rounded-lg">
                <span className="text-sm font-medium">{acc.accountName}</span>
                <span className={`text-sm font-mono font-bold ${((acc.debit || 0) - (acc.credit || 0)) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {((acc.debit || 0) - (acc.credit || 0)).toLocaleString()} EGP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="card p-6 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-dark dark:text-light">Expense Breakdown</h3>
            <span className="text-sm font-bold text-red-500">{analytics.total.toLocaleString()} EGP</span>
          </div>
          <div className="space-y-4">
            {analytics.categories.slice(0, 4).map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                  <span className="text-gray-500 font-mono">{cat.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: analytics.total > 0 ? `${(cat.value / analytics.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Net Income Summary ---- */}
      <div className="card p-6 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 mt-6">
        <h3 className="font-bold text-dark dark:text-light mb-4">Financial Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 flex flex-col items-center">
            <span className="font-bold">Revenue</span>
            <span className="text-green-600 font-black">{financials.totals.revenue.toLocaleString()} EGP</span>
          </div>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 flex flex-col items-center">
            <span className="font-bold">Expenses</span>
            <span className="text-red-500 font-black">{financials.totals.expenses.toLocaleString()} EGP</span>
          </div>
          <div className={`p-4 rounded-lg flex flex-col items-center ${financials.totals.netIncome >= 0 ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
            <span className="font-bold">Net Income</span>
            <span className={`text-xl font-black ${financials.totals.netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {financials.totals.netIncome.toLocaleString()} EGP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
