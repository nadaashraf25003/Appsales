import React from 'react';

const AccountingDashboard = () => {
  const stats = [
    { label: "Total Revenue", value: "$125,400.00", change: "+12.5%", color: "text-success", bg: "bg-success/10" },
    { label: "Total Expenses", value: "$45,200.50", change: "+5.2%", color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Net Profit", value: "$80,199.50", change: "+18.3%", color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending Invoices", value: "$12,400.00", change: "-2.1%", color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Financial Overview</h1>
          <p className="text-gray-500 text-sm">Real-time summary of your business finances.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline">Download Report</button>
          <button className="btn-primary">+ Record Expense</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="card p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-2xl font-bold text-dark dark:text-light">{stat.value}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.bg} ${stat.color}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder */}
        <div className="card p-6 lg:col-span-2 min-h-[350px] flex flex-col">
          <h3 className="font-bold mb-4">Revenue vs Expenses</h3>
          <div className="flex-1 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <span className="text-gray-400">Monthly Cash Flow Chart (Line Chart)</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-6 flex flex-col">
          <h3 className="font-bold mb-4">Expense Breakdown</h3>
          <div className="flex-1 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center mb-4">
            <span className="text-gray-400">Category Pie Chart</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Salaries</span>
              <span className="font-semibold text-dark dark:text-light">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{width: '65%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;