import React, { useState, useMemo, useEffect } from 'react';
import useAccounting from '@/Hooks/useAccounting';
import Loader from '@/Components/Global/Loader';

const FinancialStatements = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [tenantId, setTenantId] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.tenantId || 1;
  });
  const [inputTenantId, setInputTenantId] = useState("");

  const { getTrialBalanceQuery } = useAccounting();
  const { data: trialBalance, isLoading, error, refetch } = getTrialBalanceQuery(tenantId);

  useEffect(() => {
    setInputTenantId(tenantId.toString());
  }, [tenantId]);

  const computeBalance = (acc) => (acc.debit || 0) - (acc.credit || 0);

  const statementData = useMemo(() => {
    if (!trialBalance || !Array.isArray(trialBalance)) {
      return { 
        assets: [], liabilities: [], equity: [], revenue: [], expenses: [], otherIncome: [], otherExpenses: []
      };
    }

    const assetPatterns = ['cash', 'bank', 'inventory', 'receivable', 'asset', 'equipment', 'property'];
    const liabilityPatterns = ['payable', 'loan', 'debt', 'liability', 'credit'];
    const equityPatterns = ['equity', 'capital', 'retained', 'earnings'];
    const revenuePatterns = ['sales', 'revenue', 'income', 'fee', 'service'];
    const expensePatterns = ['expense', 'cost', 'salary', 'rent', 'utility', 'marketing', 'advertising', 'maintenance'];

    return {
      assets: trialBalance.filter(acc => assetPatterns.some(p => acc.accountName?.toLowerCase().includes(p))),
      liabilities: trialBalance.filter(acc => liabilityPatterns.some(p => acc.accountName?.toLowerCase().includes(p))),
      equity: trialBalance.filter(acc => equityPatterns.some(p => acc.accountName?.toLowerCase().includes(p))),
      revenue: trialBalance.filter(acc => revenuePatterns.some(p => acc.accountName?.toLowerCase().includes(p))),
      expenses: trialBalance.filter(acc => expensePatterns.some(p => acc.accountName?.toLowerCase().includes(p))),
      otherIncome: trialBalance.filter(acc =>
        !revenuePatterns.some(p => acc.accountName?.toLowerCase().includes(p)) &&
        computeBalance(acc) > 0 &&
        !assetPatterns.some(p => acc.accountName?.toLowerCase().includes(p))
      ),
      otherExpenses: trialBalance.filter(acc =>
        !expensePatterns.some(p => acc.accountName?.toLowerCase().includes(p)) &&
        computeBalance(acc) < 0 &&
        !liabilityPatterns.some(p => acc.accountName?.toLowerCase().includes(p))
      )
    };
  }, [trialBalance]);

  const totals = useMemo(() => {
    const totalRevenue = statementData.revenue.reduce((acc, a) => acc + (a.credit - a.debit), 0);
    const totalExpenses = statementData.expenses.reduce((acc, a) => acc + (a.debit - a.credit), 0);
    const totalOtherIncome = statementData.otherIncome.reduce((acc, a) => acc + computeBalance(a), 0);
    const totalOtherExpenses = statementData.otherExpenses.reduce((acc, a) => acc + computeBalance(a), 0);

    const netIncome = totalRevenue - totalExpenses + totalOtherIncome - totalOtherExpenses;

    const totalAssets = statementData.assets.reduce((acc, a) => acc + computeBalance(a), 0);
    const totalLiabilities = statementData.liabilities.reduce((acc, a) => acc + computeBalance(a), 0);
    const totalEquity = statementData.equity.reduce((acc, a) => acc + computeBalance(a), 0) + netIncome;
    const totalLiabilitiesEquity = totalLiabilities + totalEquity;

    return {
      assets: totalAssets,
      liabilities: totalLiabilities,
      equity: totalEquity,
      revenue: totalRevenue,
      expenses: totalExpenses,
      otherIncome: totalOtherIncome,
      otherExpenses: totalOtherExpenses,
      grossProfit: totalRevenue - totalExpenses,
      netIncome,
      totalLiabilitiesEquity
    };
  }, [statementData]);

  const formatCurrency = (num) => {
    const formatted = new Intl.NumberFormat("en-EG", { 
      style: "currency", 
      currency: "EGP", 
      minimumFractionDigits: 0 
    }).format(Math.abs(num));
    return num < 0 ? `(${formatted})` : formatted;
  };

  const handleTenantChange = () => {
    const newTenantId = parseInt(inputTenantId);
    if (newTenantId > 0) setTenantId(newTenantId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleTenantChange();
  };

  // Print function that only prints the statement
  const handlePrint = () => {
    const printContent = document.getElementById('printable-statement');
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    
    if (!printWindow) {
      alert('Please allow popups to print the statement.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Statement - AppSales ERP</title>
          <style>
            @media print {
              @page {
                margin: 20mm;
                size: A4 portrait;
              }
              body {
                font-family: Arial, sans-serif;
                color: #000;
                background: white;
                margin: 0;
                padding: 0;
              }
              .no-print { display: none !important; }
              .print-only { display: block !important; }
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
              }
              .print-section {
                margin-bottom: 25px;
                page-break-inside: avoid;
              }
              .print-totals {
                border-top: 2px solid #000;
                padding-top: 15px;
                margin-top: 20px;
              }
              .print-footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ccc;
                font-size: 10px;
                color: #666;
                text-align: center;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              th, td {
                padding: 8px 0;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              .total-row {
                font-weight: bold;
                border-top: 2px solid #000;
                padding-top: 10px;
              }
              .positive { color: #059669; }
              .negative { color: #dc2626; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div class="print-footer">
            Generated by AppSales ERP Accounting Module | Tenant ID: ${tenantId} | ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  if (isLoading) return <Loader />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4 md:p-6">
      <div className="text-center max-w-md">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-dark dark:text-light mb-2">Error loading financial data</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Unable to fetch trial balance for tenant {tenantId}
        </p>
        <button onClick={refetch} className="btn-primary px-4 py-2">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 animate-fadeIn">
      {/* Non-printable Header Section */}
      <div className="card p-4 md:p-6 no-print">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">Financial Statements</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive financial reporting</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <input 
                type="number" 
                min="1" 
                value={inputTenantId} 
                onChange={(e) => setInputTenantId(e.target.value)} 
                onKeyPress={handleKeyPress} 
                className="input text-sm w-32" 
                placeholder="Tenant ID" 
              />
              <button onClick={handleTenantChange} className="btn-secondary px-3 py-2 text-sm whitespace-nowrap">
                Load
              </button>
            </div>
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Statement
            </button>
          </div>
        </div>

        {/* Stats Overview - Non-printable */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 no-print">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl">
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Assets</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 truncate">{formatCurrency(totals.assets)}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl">
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Liabilities</div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400 truncate">{formatCurrency(totals.liabilities)}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-xl">
            <div className="text-xs text-gray-600 dark:text-gray-400">Revenue</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400 truncate">{formatCurrency(totals.revenue)}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl">
            <div className="text-xs text-gray-600 dark:text-gray-400">Net Income</div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">{formatCurrency(totals.netIncome)}</div>
          </div>
        </div>
      </div>

      {/* Non-printable Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 no-print">
        <div className="flex overflow-x-auto scrollbar-hide sm:overflow-visible">
          <button 
            onClick={() => setActiveTab('income')} 
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex-1 sm:flex-none sm:px-6 ${activeTab === 'income' ? 'bg-white dark:bg-gray-800 border-b-2 border-primary text-primary dark:text-dark-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Income Statement
          </button>
          <button 
            onClick={() => setActiveTab('balance')} 
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex-1 sm:flex-none sm:px-6 ${activeTab === 'balance' ? 'bg-white dark:bg-gray-800 border-b-2 border-primary text-primary dark:text-dark-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Balance Sheet
          </button>
        </div>
      </div>

      {/* Printable Statement Content */}
      <div id="printable-statement" className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-8 print:p-0 print:border-0 print:shadow-none">
        {/* Printable Header */}
        <div className="text-center mb-6 md:mb-8 border-b pb-6 dark:border-gray-700 print:pb-4 print:border-b-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div className="text-left mb-4 md:mb-0">
              <h2 className="text-xl md:text-2xl font-bold uppercase text-dark dark:text-light print:text-2xl">
                AppSales Enterprise
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 print:text-sm">
                Tenant ID: ${tenantId}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 print:text-xs">
                Generated: {new Date().toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 print:text-xs">
                As of {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300 print:text-xl">
            {activeTab === 'income' ? 'Statement of Profit and Loss' : 'Statement of Financial Position'}
          </h3>
        </div>

        {/* Printable Content */}
        {activeTab === 'income' ? (
          <div className="space-y-6 md:space-y-8 print:space-y-6">
            {/* Revenue Section */}
            <section className="space-y-3 print-section">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-2 print:text-sm print:font-bold">
                Operating Revenue
              </h4>
              <div className="space-y-2">
                {statementData.revenue.length > 0 ? (
                  statementData.revenue.map((acc, i) => (
                    <div key={i} className="flex justify-between items-center py-2 text-sm border-b border-gray-100 dark:border-gray-800 last:border-0 print:py-1">
                      <span className="truncate pr-2">{acc.accountName}</span>
                      <span className="font-medium whitespace-nowrap positive">{formatCurrency(acc.credit - acc.debit)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
                    No revenue accounts found
                  </div>
                )}
                <div className="flex justify-between py-3 font-bold text-dark dark:text-light border-t dark:border-gray-700 mt-4 print-totals">
                  <span>Total Operating Revenue</span>
                  <span className="positive">{formatCurrency(totals.revenue)}</span>
                </div>
              </div>
            </section>

            {/* Expenses Section */}
            <section className="space-y-3 print-section">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-2 print:text-sm print:font-bold">
                Operating Expenses
              </h4>
              <div className="space-y-2">
                {statementData.expenses.length > 0 ? (
                  statementData.expenses.map((acc, i) => (
                    <div key={i} className="flex justify-between items-center py-2 text-sm border-b border-gray-100 dark:border-gray-800 last:border-0 print:py-1">
                      <span className="truncate pr-2 text-gray-600 dark:text-gray-400">{acc.accountName}</span>
                      <span className="font-medium whitespace-nowrap negative">{formatCurrency(-(acc.debit - acc.credit))}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
                    No expense accounts found
                  </div>
                )}
                <div className="flex justify-between py-3 font-bold text-dark dark:text-light border-t dark:border-gray-700 mt-4 print-totals">
                  <span>Total Operating Expenses</span>
                  <span className="negative">{formatCurrency(-totals.expenses)}</span>
                </div>
              </div>
            </section>

            {/* Net Income Section */}
            <div className="p-5 rounded-xl border mt-8 print-section print-totals print:border-t-2 print:border-b-2 print:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-dark dark:text-light print:text-xl">
                    {totals.netIncome >= 0 ? 'Net Profit' : 'Net Loss'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 print:hidden">
                    {totals.netIncome >= 0 ? 'Congratulations!' : 'Review needed'}
                  </div>
                </div>
                <div className={`text-2xl sm:text-3xl font-black print:text-3xl ${totals.netIncome >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(totals.netIncome)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8 print:space-y-6">
            {/* Assets Section */}
            <section className="space-y-3 print-section">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-2 print:text-sm print:font-bold">
                Assets
              </h4>
              <div className="space-y-2">
                {statementData.assets.length > 0 ? (
                  statementData.assets.map((acc, i) => (
                    <div key={i} className="flex justify-between items-center py-2 text-sm border-b border-gray-100 dark:border-gray-800 last:border-0 print:py-1">
                      <span className="truncate pr-2">{acc.accountName}</span>
                      <span className="font-medium whitespace-nowrap">{formatCurrency(computeBalance(acc))}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
                    No asset accounts found
                  </div>
                )}
                <div className="flex justify-between py-3 font-bold text-lg text-dark dark:text-light border-t dark:border-gray-700 mt-4 print-totals">
                  <span>Total Assets</span>
                  <span>{formatCurrency(totals.assets)}</span>
                </div>
              </div>
            </section>

            {/* Liabilities & Equity Section */}
            <section className="space-y-4 print-section">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-2 print:text-sm print:font-bold">
                Liabilities & Equity
              </h4>

              {/* Liabilities */}
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 print:text-sm print:font-bold">
                  Liabilities
                </h5>
                {statementData.liabilities.length > 0 ? (
                  statementData.liabilities.map((acc, i) => (
                    <div key={i} className="flex justify-between items-center py-2 text-sm print:py-1">
                      <span className="truncate pr-2 text-gray-600 dark:text-gray-400">{acc.accountName}</span>
                      <span className="font-medium whitespace-nowrap">{formatCurrency(computeBalance(acc))}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-400 dark:text-gray-500 text-sm">
                    No liability accounts found
                  </div>
                )}
                <div className="flex justify-between py-2 font-bold text-dark dark:text-light border-t dark:border-gray-700 mt-2 print-totals">
                  <span>Total Liabilities</span>
                  <span>{formatCurrency(totals.liabilities)}</span>
                </div>
              </div>

              {/* Equity */}
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 print:text-sm print:font-bold">
                  Equity
                </h5>
                {statementData.equity.map((acc, i) => (
                  <div key={i} className="flex justify-between items-center py-2 text-sm print:py-1">
                    <span className="truncate pr-2 text-gray-600 dark:text-gray-400">{acc.accountName}</span>
                    <span className="font-medium whitespace-nowrap">{formatCurrency(computeBalance(acc))}</span>
                  </div>
                ))}
                {/* Retained Earnings / Net Income */}
                <div className="flex justify-between items-center py-2 text-sm print:py-1">
                  <span>Net Income / Retained Earnings</span>
                  <span className="font-medium whitespace-nowrap">{formatCurrency(totals.netIncome)}</span>
                </div>
                <div className="flex justify-between py-3 font-bold text-lg text-dark dark:text-light border-t dark:border-gray-700 mt-2 print-totals">
                  <span>Total Liabilities & Equity</span>
                  <span>{formatCurrency(totals.totalLiabilitiesEquity)}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Printable Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400 uppercase tracking-widest print:mt-12 print:pt-4">
          <div className="text-xs text-gray-500 print:text-xs">
            Generated by AppSales ERP Accounting Module | Page 1 of 1
          </div>
        </div>
      </div>

      {/* Print instructions (hidden on screen) */}
      <div className="hidden print:block print-only">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-statement, #printable-statement * {
              visibility: visible;
            }
            #printable-statement {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              box-shadow: none;
              border: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FinancialStatements;