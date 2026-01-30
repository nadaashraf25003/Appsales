import React from 'react';
import useAccounting from '@/Hooks/useAccounting';
import useExpenses from '@/Hooks/useExpenses';
import Loader from '@/Components/Global/Loader';

/**
 * Pure helper function moved outside the component 
 * to satisfy React Compiler's memoization rules.
 */
const calculateExpenseAnalytics = (expenses) => {
  if (!expenses || !Array.isArray(expenses)) return { total: 0, categories: [] };

  const total = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  
  const catMap = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0);
    return acc;
  }, {});

  const sortedCats = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return { total, categories: sortedCats };
};

const ReportsDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1;

  const { getTrialBalanceQuery, getLedgerQuery } = useAccounting();
  const { getAllExpensesQuery } = useExpenses();

  const { data: trialBalance, isLoading: tbLoading } = getTrialBalanceQuery(tenantId);
  const { isLoading: ledgerLoading } = getLedgerQuery(tenantId);
  const { data: expenses, isLoading: expLoading } = getAllExpensesQuery(tenantId);

  // Instead of useMemo, we calculate directly. 
  // If performance becomes an issue, the React Compiler will now 
  // be able to auto-memoize this because it's a pure function call.
  const analytics = calculateExpenseAnalytics(expenses);

  const reportTypes = [
    { title: "Trial Balance", desc: "View debit and credit balances for all accounts.", icon: "⚖️", action: "View Table" },
    { title: "Expense Analysis", desc: "Breakdown of business spending by category.", icon: "💸", action: "Analyze" },
    { title: "General Ledger", desc: "Detailed transaction history for every account.", icon: "📖", action: "Export" },
    { title: "VAT Summary", desc: "Estimated tax based on recent transactions.", icon: "🏛️", action: "Preview" },
  ];

  const isLoading = tbLoading || ledgerLoading || expLoading;

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header & Global Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Reports Centre</h1>
          <p className="text-gray-500 text-sm">Financial intelligence for Tenant #{tenantId}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input type="date" className="input text-sm w-auto" defaultValue="2024-01-01" />
          <span className="self-center text-gray-400">to</span>
          <input type="date" className="input text-sm w-auto" defaultValue="2024-12-31" />
          <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report, idx) => (
          <div key={idx} className="card p-6 hover:border-primary transition-all cursor-pointer group bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
              {report.icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-dark dark:text-light">{report.title}</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{report.desc}</p>
            <div className="flex gap-4">
              <button className="text-xs font-bold text-primary hover:underline">{report.action}</button>
              <button className="text-xs font-bold text-gray-400">Export PDF</button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trial Balance Quick View */}
        <div className="card p-6 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-dark dark:text-light mb-6">Trial Balance Summary</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {trialBalance?.slice(0, 5).map((acc, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-bg/40 rounded-lg">
                <span className="text-sm font-medium">{acc.accountName}</span>
                <span className={`text-sm font-mono font-bold ${acc.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {acc.balance.toLocaleString()} EGP
                </span>
              </div>
            ))}
            {!trialBalance?.length && <p className="text-center text-gray-400 py-10">No data found.</p>}
          </div>
        </div>

        {/* Expense Category Breakdown */}
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
                    style={{ width: analytics.total > 0 ? `${(cat.value / analytics.total) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            ))}
            {!analytics.categories.length && <p className="text-center text-gray-400 py-10 italic">No expenses recorded.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;