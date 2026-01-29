import React, { useState } from 'react';

const FinancialStatements = () => {
  const [activeTab, setActiveTab] = useState('income'); // 'income' or 'balance'

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Statements</h1>
          <p className="text-gray-500 text-sm">Official records of the financial activities.</p>
        </div>
        <button className="btn-outline flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Statement
        </button>
      </div>

      {/* Statement Tabs */}
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

      {/* Statement Content */}
      <div className="card p-8 shadow-lg max-w-4xl mx-auto dark:bg-dark-card border-none">
        <div className="text-center mb-8 border-b pb-8 dark:border-gray-800">
          <h2 className="text-2xl font-bold uppercase">Your Company Name Ltd</h2>
          <p className="text-gray-500 font-medium">
            {activeTab === 'income' ? 'Profit & Loss Statement' : 'Statement of Financial Position'}
          </p>
          <p className="text-xs text-gray-400 mt-1 italic">For the period ended December 31, 2025</p>
        </div>

        {activeTab === 'income' ? (
          /* Income Statement Mockup */
          <div className="space-y-6">
            <section>
              <h4 className="font-bold text-primary uppercase text-xs tracking-wider mb-3">Operating Revenue</h4>
              <div className="flex justify-between border-b dark:border-gray-800 py-2">
                <span>Total Product Sales</span>
                <span className="font-semibold">$150,000.00</span>
              </div>
              <div className="flex justify-between border-b dark:border-gray-800 py-2">
                <span>Service Revenue</span>
                <span className="font-semibold">$25,000.00</span>
              </div>
            </section>

            <section>
              <h4 className="font-bold text-secondary uppercase text-xs tracking-wider mb-3">Operating Expenses</h4>
              <div className="flex justify-between py-2 italic text-gray-600 dark:text-gray-400">
                <span>Cost of Goods Sold (COGS)</span>
                <span>($45,000.00)</span>
              </div>
              <div className="flex justify-between py-2 italic text-gray-600 dark:text-gray-400">
                <span>Salaries & Wages</span>
                <span>($30,000.00)</span>
              </div>
              <div className="flex justify-between py-2 italic text-gray-600 dark:text-gray-400 border-b dark:border-gray-800">
                <span>Marketing & Ads</span>
                <span>($5,000.00)</span>
              </div>
            </section>

            <div className="bg-primary/5 p-4 rounded-lg flex justify-between items-center mt-8">
              <span className="text-lg font-bold">Net Operating Income</span>
              <span className="text-xl font-black text-primary">$95,000.00</span>
            </div>
          </div>
        ) : (
          /* Balance Sheet Mockup */
          <div className="space-y-6">
             <section>
              <h4 className="font-bold text-success uppercase text-xs tracking-wider mb-3">Assets</h4>
              <div className="flex justify-between py-2"><span>Cash & Cash Equivalents</span><span>$85,000</span></div>
              <div className="flex justify-between py-2"><span>Inventory</span><span>$120,000</span></div>
              <div className="flex justify-between py-2 border-t dark:border-gray-800 font-bold"><span>Total Assets</span><span>$205,000</span></div>
            </section>
            
            <section>
              <h4 className="font-bold text-warning uppercase text-xs tracking-wider mb-3">Liabilities</h4>
              <div className="flex justify-between py-2"><span>Accounts Payable</span><span>$15,000</span></div>
              <div className="flex justify-between py-2 border-t dark:border-gray-800 font-bold"><span>Total Liabilities</span><span>$15,000</span></div>
            </section>
          </div>
        )}
        
        <div className="mt-12 text-center text-[10px] text-gray-400 uppercase tracking-widest">
          End of Statement - Generated by AppSales ERP
        </div>
      </div>
    </div>
  );
};

export default FinancialStatements;