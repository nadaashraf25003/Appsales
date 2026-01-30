import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useExpenses from '@/Hooks/useExpenses';
import Loader from '@/Components/Global/Loader';

const ExpensesList = () => {
  // 1. State for Search and Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");
  
  // 2. Hook Integration
  // Pulling tenantId from localStorage to ensure data is scoped to the user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1; 

  const { getAllExpensesQuery, deleteExpenseMutation } = useExpenses();
  
  // 3. Fetch Data using the Query Hook
  const { 
    data: expenses, 
    isLoading, 
    isError, 
    refetch 
  } = getAllExpensesQuery(tenantId);

  // 4. Delete Logic
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      deleteExpenseMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Expense deleted successfully");
          refetch(); // Trigger a refetch to update the table
        },
        onError: (error) => {
          const errMsg = error?.response?.data?.message || "Failed to delete expense";
          toast.error(errMsg);
        }
      });
    }
  };

  // 5. Dynamic Filter Options (Extracted from live data)
  const categories = ["All", ...new Set(expenses?.map(ex => ex.category).filter(Boolean))];
  const branches = ["All", ...new Set(expenses?.map(ex => ex.branchId).filter(Boolean))];

  // 6. Filtering Logic
  const filteredExpenses = expenses?.filter((exp) => {
    const matchesSearch = 
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "All" || exp.category === filterCategory;
    const matchesBranch = filterBranch === "All" || String(exp.branchId) === filterBranch;
    
    return matchesSearch && matchesCategory && matchesBranch;
  }) || [];

  // Loading and Error States
  if (isLoading) return <Loader />;
  
  if (isError) return (
    <div className="p-6 text-center">
      <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
        <p className="font-bold">Error loading expenses</p>
        <p className="text-sm">Please check your connection or try again later.</p>
        <button onClick={() => refetch()} className="mt-2 text-sm underline">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-light">Expenses</h1>
          <p className="text-gray-500 text-sm">Review and manage your company outflows.</p>
        </div>
        <Link 
          to="/erp/accounting/expenses/add" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center font-medium shadow-sm"
        >
          <span className="mr-2">+</span> Add New Expense
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="card overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card">
        
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 bg-gray-50/50 dark:bg-dark-card/20">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <input 
              type="text" 
              placeholder="Search description..." 
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Branch Filter */}
          <select 
            className="input max-w-[150px] cursor-pointer"
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="All">All Branches</option>
            {branches.filter(b => b !== "All").map(b => (
               <option key={b} value={b}>Branch #{b}</option>
            ))}
          </select>
          
          {/* Category Filter */}
          <select 
            className="input max-w-[150px] cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-dark-card/50 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
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
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/20 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-dark dark:text-light">
                      {exp.description}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded text-[10px] font-bold uppercase tracking-wide">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {exp.branchId ? `Branch #${exp.branchId}` : "General"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-red-500">
                      {exp.amount.toLocaleString()} EGP
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-4">
                        <Link 
                          to={`/erp/accounting/expenses/${exp.id}/edit`} 
                          className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(exp.id)}
                          disabled={deleteExpenseMutation.isPending}
                          className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {deleteExpenseMutation.isPending ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                    {searchTerm ? `No matching expenses found for "${searchTerm}"` : "No expenses recorded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400 font-medium bg-gray-50/30 dark:bg-transparent">
            Showing {filteredExpenses.length} of {expenses?.length || 0} expenses
        </div>
      </div>
    </div>
  );
};

export default ExpensesList;