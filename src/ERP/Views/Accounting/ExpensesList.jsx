import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ExpensesList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const dummyExpenses = [
    { id: 1, desc: "Office Rent - Jan", amount: 2500, category: "Rent", date: "2024-01-01", branch: "Main Branch" },
    { id: 2, desc: "Electricity Bill", amount: 450, category: "Utilities", date: "2024-01-05", branch: "Main Branch" },
    { id: 3, desc: "Facebook Ads", amount: 1200, category: "Marketing", date: "2024-01-10", branch: "Downtown" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Link to="/erp/accounting/expenses/add" className="btn-primary">Add New Expense</Link>
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
          <input 
            type="text" 
            placeholder="Search expenses..." 
            className="input max-w-xs"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="input max-w-[150px]">
            <option>All Branches</option>
            <option>Main Branch</option>
            <option>Downtown</option>
          </select>
          <select className="input max-w-[150px]">
            <option>All Categories</option>
            <option>Rent</option>
            <option>Utilities</option>
            <option>Marketing</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-dark-card/50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {dummyExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/20">
                  <td className="px-6 py-4 text-sm">{exp.date}</td>
                  <td className="px-6 py-4 text-sm font-medium">{exp.desc}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-info/10 text-info rounded text-xs">{exp.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">{exp.branch}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-secondary">${exp.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <Link to={`/erp/accounting/expenses/${exp.id}/edit`} className="text-primary hover:underline text-sm font-medium">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesList;