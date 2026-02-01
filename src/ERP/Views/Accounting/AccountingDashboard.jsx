import React, { useState } from 'react';
import useAccounting from '@/Hooks/useAccounting';
import useExpenses from '@/Hooks/useExpenses';

const AccountingDashboard = () => {
  // 1. Context & Data Fetching
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const defaultTenantId = user.tenantId || 1;

  const [inputTenantId, setInputTenantId] = useState(defaultTenantId.toString());
  const [activeTenantId, setActiveTenantId] = useState(defaultTenantId);

  const { getTrialBalanceQuery, getLedgerQuery } = useAccounting();
  const { getAllExpensesQuery } = useExpenses();

  const { data: trialBalance, isLoading: tbLoading } = 
    getTrialBalanceQuery(activeTenantId);

  const { data: ledger } = 
    getLedgerQuery(activeTenantId);

  const { data: expenses, isLoading: expLoading } = 
    getAllExpensesQuery(activeTenantId);

  // 2. Data Processing & Logic
  const isLoading = tbLoading || expLoading;

  const totalExpensesValue =
    expenses?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

  const revenueAccount = trialBalance?.find(acc =>
    acc.accountName?.toLowerCase().includes('revenue') ||
    acc.accountName?.toLowerCase().includes('sales')
  );

  const totalRevenueValue = revenueAccount
    ? Math.abs((revenueAccount.credit || 0) - (revenueAccount.debit || 0))
    : 0;

  const netProfitValue = totalRevenueValue - totalExpensesValue;

  const categoryTotals = expenses?.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  // 3. KPI Configuration with responsive values
  const stats = [
    {
      label: "Total Revenue",
      value: totalRevenueValue,
      change: "From Trial Balance",
      color: "text-brand-success",
      bg: "bg-green-50 dark:bg-dark-success/10"
    },
    {
      label: "Total Expenses",
      value: totalExpensesValue,
      change: `${expenses?.length || 0} Records`,
      color: "text-secondary dark:text-dark-secondary",
      bg: "bg-red-50 dark:bg-dark-secondary/10"
    },
    {
      label: "Net Profit",
      value: netProfitValue,
      change: netProfitValue >= 0 ? "Profit" : "Loss",
      color: netProfitValue >= 0 ? "text-brand-success" : "text-brand-warning",
      bg: netProfitValue >= 0 ? "bg-blue-50 dark:bg-dark-success/10" : "bg-orange-50 dark:bg-dark-warning/10"
    },
    {
      label: "Ledger Accounts",
      value: ledger?.length || 0,
      change: "Active",
      color: "text-brand-info",
      bg: "bg-info/10 dark:bg-dark-info/10"
    },
  ];

  // Format currency with responsive font sizes
  const formatCurrency = (value) => {
    return value.toLocaleString('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const handleTenantChange = () => {
    const tenantId = parseInt(inputTenantId);
    if (tenantId > 0) {
      setActiveTenantId(tenantId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTenantChange();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent dark:border-dark-primary"></div>
        <span className="ml-3 text-gray-500 dark:text-gray-400">
          Syncing Financial Records...
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fadeIn max-w-screen-2xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark dark:text-light">
            Financial Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Active Tenant ID: <span className="font-semibold text-primary dark:text-dark-primary">{activeTenantId}</span>
          </p>
        </div>

        {/* Tenant Control Section */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex gap-2 flex-1 sm:flex-none">
            <input
              type="number"
              min={1}
              value={inputTenantId}
              onChange={(e) => setInputTenantId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input flex-1 min-w-0 sm:w-40"
              placeholder="Enter Tenant ID"
              aria-label="Tenant ID"
            />
            <button
              onClick={handleTenantChange}
              className="btn-secondary px-4 py-2 whitespace-nowrap"
            >
              Load Data
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="card group hover:shadow-card-hover"
            role="region"
            aria-label={stat.label}
          >
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.label}
              </span>
              <div className="flex justify-between items-baseline">
                <span className={`text-2xl lg:text-xl font-bold truncate ${stat.color}`}>
                  {stat.label.includes('EGP') || stat.label.includes('Revenue') || stat.label.includes('Expenses') || stat.label.includes('Profit') 
                    ? formatCurrency(stat.value)
                    : stat.value}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${stat.bg} ${stat.color} ml-2 whitespace-nowrap`}>
                  {stat.change}
                </span>
              </div>
              {/* Progress bar for profit/loss */}
              {stat.label === "Net Profit" && totalRevenueValue > 0 && (
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${netProfitValue >= 0 ? 'bg-success dark:bg-dark-success' : 'bg-secondary dark:bg-dark-secondary'}`}
                    style={{ 
                      width: `${Math.min(Math.abs(netProfitValue) / totalRevenueValue * 100, 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Trial Balance Table - Responsive Card */}
        <div className="card lg:col-span-2 min-h-[400px]">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg md:text-xl text-dark dark:text-light">
                Trial Balance Summary
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {trialBalance?.length || 0} Accounts
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Account Name
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {trialBalance?.map((account, i) => {
                    const balance = (account.debit || 0) - (account.credit || 0);
                    return (
                      <tr 
                        key={i} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-sm md:text-base truncate max-w-[200px] lg:max-w-none">
                          {account.accountName}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold text-sm md:text-base ${
                          balance >= 0 
                            ? "text-success dark:text-dark-success" 
                            : "text-secondary dark:text-dark-secondary"
                        }`}>
                          {formatCurrency(Math.abs(balance))}
                          <span className="text-xs ml-1 text-gray-500">
                            {balance >= 0 ? 'DR' : 'CR'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expense Breakdown - Responsive Card */}
        <div className="card flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg md:text-xl text-dark dark:text-light">
              Expense Breakdown
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Object.keys(categoryTotals || {}).length} Categories
            </span>
          </div>

          <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto pr-2">
            {categoryTotals && Object.keys(categoryTotals).length > 0 ? (
              Object.entries(categoryTotals).map(([category, amount]) => {
                const percentage = totalExpensesValue > 0
                  ? ((amount / totalExpensesValue) * 100)
                  : 0;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate max-w-[60%]">
                        {category}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary dark:bg-dark-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatCurrency(amount)}</span>
                      <span>{((amount / totalExpensesValue) * 100).toFixed(1)}% of total</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm italic">No expenses found for this tenant.</p>
              </div>
            )}
          </div>

          {/* Total Expenses Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-bold text-dark dark:text-light">Total Outflow</span>
              <div className="text-right">
                <div className="text-lg md:text-xl font-bold text-secondary dark:text-dark-secondary">
                  {formatCurrency(totalExpensesValue)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Across {expenses?.length || 0} expense records
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;