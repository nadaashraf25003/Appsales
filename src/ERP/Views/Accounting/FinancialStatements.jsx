import React, { useState, useMemo } from 'react';
import useAccounting from '@/Hooks/useAccounting';
import Loader from '@/Components/Global/Loader';

const FinancialStatements = () => {
  const [activeTab, setActiveTab] = useState('income'); // 'income' or 'balance'
  
  // 1. Hook Integration
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1;
  const { getTrialBalanceQuery } = useAccounting();
  const { data: trialBalance, isLoading } = getTrialBalanceQuery(tenantId);

  // 2. Data Categorization Logic
  const statementData = useMemo(() => {
    if (!trialBalance || !Array.isArray(trialBalance)) {
      return { assets: [], liabilities: [], equity: [], revenue: [], expenses: [] };
    }

    return {
      assets: trialBalance.filter(acc => acc.accountType === 'Asset'),
      liabilities: trialBalance.filter(acc => acc.accountType === 'Liability'),
      equity: trialBalance.filter(acc => acc.accountType === 'Equity'),
      revenue: trialBalance.filter(acc => acc.accountType === 'Revenue'),
      expenses: trialBalance.filter(acc => acc.accountType === 'Expense'),
    };
  }, [trialBalance]);

  // 3. Totals Calculation
  const totals = useMemo(() => {
    const sum = (arr) => arr.reduce((acc, curr) => acc + Math.abs(curr.balance || 0), 0);
    
    const totalRev = sum(statementData.revenue);
    const totalExp = sum(statementData.expenses);
    
    return {
      assets: sum(statementData.assets),
      liabilities: sum(statementData.liabilities),
      equity: sum(statementData.equity),
      revenue: totalRev,
      expenses: totalExp,
      netIncome: totalRev - totalExp
    };
  }, [statementData]);

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Financial Statements</h1>
          <p className="text-gray-500 text-sm">Official records for Tenant ID: {tenantId}</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="btn-outline flex items-center gap-2 border-gray-200 dark:border-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Statement
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => setActiveTab('income')}
          className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'income' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
        >
          Income Statement (P&L)
        </button>
        <button 
          onClick={() => setActiveTab('balance')}
          className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'balance' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
        >
          Balance Sheet
        </button>
      </div>

      {/* Content */}
      <div className="card p-8 shadow-xl max-w-4xl mx-auto bg-white dark:bg-dark-card border-none print:shadow-none print:p-0">
        <div className="text-center mb-8 border-b pb-8 dark:border-gray-800">
          <h2 className="text-2xl font-bold uppercase text-dark dark:text-light">AppSales Enterprise</h2>
          <p className="text-gray-500 font-medium">
            {activeTab === 'income' ? 'Profit & Loss Statement' : 'Statement of Financial Position'}
          </p>
          <p className="text-xs text-gray-400 mt-1 italic">As of {new Date().toLocaleDateString()}</p>
        </div>

        {activeTab === 'income' ? (
          <div className="space-y-8">
            {/* Revenue */}
            <section>
              <h4 className="font-bold text-primary uppercase text-xs tracking-wider mb-3">Operating Revenue</h4>
              {statementData.revenue.map((acc, i) => (
                <div key={i} className="flex justify-between border-b border-gray-50 dark:border-gray-800 py-2 text-sm">
                  <span>{acc.accountName}</span>
                  <span className="font-semibold">{acc.balance.toLocaleString()} EGP</span>
                </div>
              ))}
              <div className="flex justify-between py-3 font-bold text-dark dark:text-light">
                <span>Total Revenue</span>
                <span>{totals.revenue.toLocaleString()} EGP</span>
              </div>
            </section>

            {/* Expenses */}
            <section>
              <h4 className="font-bold text-secondary uppercase text-xs tracking-wider mb-3">Operating Expenses</h4>
              {statementData.expenses.map((acc, i) => (
                <div key={i} className="flex justify-between py-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{acc.accountName}</span>
                  <span>({Math.abs(acc.balance).toLocaleString()})</span>
                </div>
              ))}
              <div className="flex justify-between py-3 font-bold border-t dark:border-gray-800 mt-2">
                <span>Total Operating Expenses</span>
                <span>({totals.expenses.toLocaleString()}) EGP</span>
              </div>
            </section>

            <div className={`p-5 rounded-xl flex justify-between items-center mt-8 ${totals.netIncome >= 0 ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
              <span className="text-lg font-bold">Net Operating Income</span>
              <span className={`text-xl font-black ${totals.netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {totals.netIncome.toLocaleString()} EGP
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Assets */}
            <section>
              <h4 className="font-bold text-green-600 uppercase text-xs tracking-wider mb-3">Assets</h4>
              {statementData.assets.map((acc, i) => (
                <div key={i} className="flex justify-between py-2 text-sm border-b border-gray-50 dark:border-gray-800">
                  <span>{acc.accountName}</span>
                  <span>{acc.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 font-bold text-lg text-dark dark:text-light">
                <span>Total Assets</span>
                <span>{totals.assets.toLocaleString()} EGP</span>
              </div>
            </section>
            
            {/* Liabilities */}
            <section>
              <h4 className="font-bold text-orange-500 uppercase text-xs tracking-wider mb-3">Liabilities & Equity</h4>
              {statementData.liabilities.map((acc, i) => (
                <div key={i} className="flex justify-between py-2 text-sm">
                  <span>{acc.accountName}</span>
                  <span>{Math.abs(acc.balance).toLocaleString()}</span>
                </div>
              ))}
              {statementData.equity.map((acc, i) => (
                <div key={i} className="flex justify-between py-2 text-sm italic">
                  <span>{acc.accountName} (Equity)</span>
                  <span>{Math.abs(acc.balance).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 border-t dark:border-gray-800 font-bold text-lg">
                <span>Total Liabilities & Equity</span>
                <span>{(totals.liabilities + totals.equity).toLocaleString()} EGP</span>
              </div>
            </section>
          </div>
        )}
        
        <div className="mt-12 text-center text-[10px] text-gray-400 uppercase tracking-widest">
          End of Statement - Generated by AppSales ERP Accounting Module
        </div>
      </div>
    </div>
  );
};

export default FinancialStatements;