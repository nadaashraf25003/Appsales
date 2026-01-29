import React from 'react';

const ReportsDashboard = () => {
  const reportTypes = [
    { title: "Sales Analysis", desc: "Detailed breakdown of revenue by product and region.", icon: "📈" },
    { title: "Expense Report", desc: "Monitor spending patterns across all branches.", icon: "💸" },
    { title: "Tax Summary", desc: "Estimated VAT/Sales tax for the selected period.", icon: "🏛️" },
    { title: "Inventory Valuation", desc: "Current stock value based on FIFO/LIFO.", icon: "📦" },
  ];

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header & Global Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Reports Centre</h1>
          <p className="text-gray-500 text-sm">Generate and export business intelligence reports.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input type="date" className="input text-sm w-auto" defaultValue="2024-01-01" />
          <span className="self-center">to</span>
          <input type="date" className="input text-sm w-auto" defaultValue="2024-01-31" />
          <button className="btn-primary px-6">Apply Filters</button>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report, idx) => (
          <div key={idx} className="card p-6 hover:border-primary transition-colors cursor-pointer group">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
              {report.icon}
            </div>
            <h3 className="font-bold text-lg mb-2">{report.title}</h3>
            <p className="text-gray-500 text-sm mb-6">{report.desc}</p>
            <div className="flex gap-2">
              <button className="text-xs font-bold text-primary hover:underline">Preview</button>
              <button className="text-xs font-bold text-gray-400">Export PDF</button>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Analytics Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Quarterly Revenue Growth</h3>
            <select className="text-xs bg-transparent border-none outline-none font-bold text-primary">
              <option>Year 2024</option>
              <option>Year 2023</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-dark-bg/40 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <span className="text-gray-400">Growth Area Chart Placeholder</span>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold mb-6">Top Performing Branches</h3>
          <div className="space-y-4">
            {[
              { name: "Main Branch", sales: "$45,000", color: "bg-primary" },
              { name: "Downtown Office", sales: "$32,000", color: "bg-secondary" },
              { name: "East Side Mall", sales: "$18,500", color: "bg-success" },
            ].map((branch, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{branch.name}</span>
                  <span className="text-gray-500">{branch.sales}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className={`${branch.color} h-2 rounded-full`} style={{ width: `${(i === 0 ? 80 : i === 1 ? 60 : 40)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;