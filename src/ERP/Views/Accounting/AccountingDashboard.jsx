import React from 'react';
import useAccounting from '@/Hooks/useAccounting';
import useExpenses from '@/Hooks/useExpenses';

const AccountingDashboard = () => {
  // 1. Context & Data Fetching
  // Fetching user data to get tenantId (fallback to 1 for dev)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1;

  const { getTrialBalanceQuery, getLedgerQuery } = useAccounting();
  const { getAllExpensesQuery } = useExpenses();

  const { data: trialBalance, isLoading: tbLoading } = getTrialBalanceQuery(tenantId);
  const { data: ledger } = getLedgerQuery(tenantId);
  const { data: expenses, isLoading: expLoading } = getAllExpensesQuery(tenantId);

  // 2. Data Processing & Logic
  const isLoading = tbLoading || expLoading;

  // Calculate Total Expenses from useExpenses hook
  const totalExpensesValue = expenses?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

  // Calculate Revenue from Trial Balance (Assuming 'Revenue' exists in account names)
  const revenueAccount = trialBalance?.find(acc => 
    acc.accountName?.toLowerCase().includes('revenue') || 
    acc.accountName?.toLowerCase().includes('sales')
  );
  const totalRevenueValue = revenueAccount ? Math.abs(revenueAccount.balance) : 0;

  // Calculate Net Profit
  const netProfitValue = totalRevenueValue - totalExpensesValue;

  // Grouping Expenses by Category for the sidebar breakdown
  const categoryTotals = expenses?.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  // 3. KPI Configuration
  const stats = [
    { 
      label: "Total Revenue", 
      value: `${totalRevenueValue.toLocaleString()} EGP`, 
      change: "Live Data", 
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
    { 
      label: "Total Expenses", 
      value: `${totalExpensesValue.toLocaleString()} EGP`, 
      change: `${expenses?.length || 0} Records`, 
      color: "text-red-600", 
      bg: "bg-red-50" 
    },
    { 
      label: "Net Profit", 
      value: `${netProfitValue.toLocaleString()} EGP`, 
      change: "Calculated", 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Ledger Accounts", 
      value: ledger?.length || 0, 
      change: "Active", 
      color: "text-orange-600", 
      bg: "bg-orange-50" 
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-3 text-gray-500">Syncing Financial Records...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Financial Overview</h1>
          <p className="text-gray-500 text-sm">Tenant: {user.name || "Default"} (ID: {tenantId})</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
            Download Report
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            + Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-2xl font-bold text-dark dark:text-light">{stat.value}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.bg} ${stat.color}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trial Balance Table (Replacing Chart Placeholder) */}
        <div className="bg-white dark:bg-gray-800 p-6 lg:col-span-2 rounded-xl border border-gray-100 dark:border-gray-700 min-h-[400px]">
          <h3 className="font-bold mb-4 text-dark dark:text-light text-lg">Trial Balance Summary</h3>
          <div className="overflow-hidden rounded-lg border border-gray-50 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-semibold">Account Name</th>
                  <th className="px-4 py-3 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {trialBalance?.slice(0, 8).map((account, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-dark dark:text-light font-medium">{account.accountName}</td>
                    <td className={`px-4 py-3 text-right font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {account.balance?.toLocaleString()} EGP
                    </td>
                  </tr>
                ))}
                {(!trialBalance || trialBalance.length === 0) && (
                  <tr>
                    <td colSpan={2} className="px-4 py-10 text-center text-gray-400">No account balances found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col">
          <h3 className="font-bold mb-4 text-dark dark:text-light text-lg">Expense Breakdown</h3>
          <div className="flex-1 space-y-6">
            {categoryTotals && Object.entries(categoryTotals).length > 0 ? (
              Object.entries(categoryTotals).map(([category, amount]) => {
                const percentage = totalExpensesValue > 0 
                  ? ((amount / totalExpensesValue) * 100).toFixed(1) 
                  : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{category}</span>
                      <span className="font-bold text-dark dark:text-light">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 text-right">{amount.toLocaleString()} EGP</p>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="h-12 w-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <span className="text-gray-400">📊</span>
                </div>
                <p className="text-gray-400 text-sm italic">No expenses found for this tenant.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-gray-500">Total Outflow</span>
              <span className="text-red-500">{totalExpensesValue.toLocaleString()} EGP</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccountingDashboard;