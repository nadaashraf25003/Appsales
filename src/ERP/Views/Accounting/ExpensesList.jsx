import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useExpenses from '@/Hooks/useExpenses';
import Loader from '@/Components/Global/Loader';

const ExpensesList = () => {
  // ===============================
  // 1. State for Search and Filters
  // ===============================
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 👉 Manual Tenant & Branch
  const [tenantId, setTenantId] = useState("");
  const [branchId, setBranchId] = useState("");

  // 👉 Delete Modal State
  const [deleteId, setDeleteId] = useState(null);

  // ===============================
  // 2. Hook Integration
  // ===============================
  const { getAllExpensesQuery, deleteExpenseMutation } = useExpenses();

  // ===============================
  // 3. Fetch Data (Query Params)
  // ===============================
  const { data: expenses, isLoading, isError, refetch } = getAllExpensesQuery(
    tenantId ? Number(tenantId) : 0
  );

  // ===============================
  // 4. Delete Logic
  // ===============================
  const confirmDelete = () => {
    deleteExpenseMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Expense deleted successfully");
        setDeleteId(null);
        refetch();
      },
      onError: () => {
        toast.error("Failed to delete expense");
      },
    });
  };

  // ===============================
  // 5. Dynamic Filters
  // ===============================
  const categories = ["All", ...new Set(expenses?.map(e => e.category).filter(Boolean))];
  const branches = ["All", ...new Set(expenses?.map(e => e.branchId).filter(Boolean))];

  // ===============================
  // 6. Filtering Logic
  // ===============================
  const filteredExpenses = expenses?.filter(exp => {
    const matchesSearch =
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = filterCategory === "All" || exp.category === filterCategory;
    const matchesBranch = branchId === "" || String(exp.branchId) === branchId;

    return matchesSearch && matchesCategory && matchesBranch;
  }) || [];
  
  const totalAmount = filteredExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
  const averageAmount = filteredExpenses?.length > 0 ? totalAmount / filteredExpenses.length : 0;

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-apply filters on search term change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        refetch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ===============================
  // 7. Loading & Error States
  // ===============================
  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4 md:p-6">
        <div className="text-red-500 text-center max-w-md">
          <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base md:text-lg font-semibold mb-2">Failed to load expenses</p>
          <button 
            onClick={refetch} 
            className="btn-primary mt-4 px-4 md:px-6 py-2 text-sm md:text-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ===============================
  // 8. JSX
  // ===============================
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 animate-fadeIn max-w-screen-2xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-dark dark:text-light">
            Expense Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Review and manage your company outflows
          </p>
        </div>
        <Link
          to="/erp/accounting/expenses/add"
          className="btn-primary px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-base whitespace-nowrap"
        >
          + Add Expense
        </Link>
      </div>

      {/* Stats Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="card p-3 sm:p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
              Total Expenses
            </span>
            <span className="text-[10px] xs:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-red-50 dark:bg-dark-secondary/10 text-secondary dark:text-dark-secondary">
              Live
            </span>
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-dark dark:text-light">
            {filteredExpenses.length}
          </div>
        </div>
        
        <div className="card p-3 sm:p-4">
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
            Total Amount
          </span>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-secondary dark:text-dark-secondary truncate">
            {totalAmount.toLocaleString('en-EG', {
              style: 'currency',
              currency: 'EGP',
              minimumFractionDigits: 0
            })}
          </div>
        </div>
        
        <div className="card p-3 sm:p-4">
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
            Average Expense
          </span>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-warning dark:text-dark-warning truncate">
            {averageAmount.toLocaleString('en-EG', {
              style: 'currency',
              currency: 'EGP',
              minimumFractionDigits: 0
            })}
          </div>
        </div>
        
        <div className="card p-3 sm:p-4">
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
            Categories
          </span>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-info dark:text-dark-info">
            {categories.length - 1}
          </div>
        </div>
      </div>

      {/* Filters Toolbar - Ultra Responsive */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center justify-between w-full text-sm font-medium text-primary dark:text-dark-primary p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </span>
            <span className="text-xs bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary px-2 py-1 rounded">
              {isFilterOpen ? '▼' : '▶'}
            </span>
          </button>

          {/* Desktop/Expanded Filters */}
          <div className={`${isFilterOpen ? 'block' : 'hidden md:block'} space-y-3 sm:space-y-4`}>
            {/* Filter Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="number"
                placeholder="Tenant ID"
                className="input text-sm"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                aria-label="Tenant ID"
              />
              
              <input
                type="number"
                placeholder="Branch ID"
                className="input text-sm"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                aria-label="Branch ID"
              />

              <input
                type="text"
                placeholder="Search expenses..."
                className="input text-sm lg:col-span-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search expenses"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 w-full sm:w-auto">
                <select
                  className="input text-sm w-full"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  aria-label="Filter by category"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={refetch}
                  className="btn-primary px-3 sm:px-4 py-2 text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setTenantId("");
                    setBranchId("");
                    setSearchTerm("");
                    setFilterCategory("All");
                  }}
                  className="px-3 sm:px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table - Mobile Cards View */}
      {isMobile ? (
        /* Mobile Cards View */
        <div className="space-y-3">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(exp => (
              <div key={exp.id} className="card p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm line-clamp-2">{exp.description}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-dark-info/20 text-blue-800 dark:text-dark-info">
                        {exp.category}
                      </span>
                      <span className="text-xs text-gray-500">Branch #{exp.branchId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-secondary dark:text-dark-secondary">
                      {exp.amount.toLocaleString('en-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(exp.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    {new Date(exp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex gap-4">
                    <Link
                      to={`/erp/accounting/expenses/${exp.id}/edit`}
                      className="text-primary dark:text-dark-primary text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(exp.id)}
                      className="text-secondary dark:text-dark-secondary text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card p-6 text-center">
              <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-base font-medium mb-1">No expenses found</p>
                <p className="text-xs mb-4">Adjust filters or add a new expense</p>
                <Link
                  to="/erp/accounting/expenses/add"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Add Expense
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] lg:min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map(exp => (
                    <tr 
                      key={exp.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium">{new Date(exp.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(exp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[180px] lg:max-w-none">
                          {exp.description}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-dark-info/20 text-blue-800 dark:text-dark-info">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className="text-xs sm:text-sm">Branch #{exp.branchId}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                        <div className="text-xs sm:text-sm font-bold text-secondary dark:text-dark-secondary">
                          {exp.amount.toLocaleString('en-EG', {
                            style: 'currency',
                            currency: 'EGP',
                            minimumFractionDigits: 0
                          })}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          <Link
                            to={`/erp/accounting/expenses/${exp.id}/edit`}
                            className="text-primary dark:text-dark-primary hover:underline text-xs sm:text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteId(exp.id)}
                            className="text-secondary dark:text-dark-secondary hover:underline text-xs sm:text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 sm:py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">No expenses found</p>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4">Try adjusting your filters or add a new expense</p>
                        <Link
                          to="/erp/accounting/expenses/add"
                          className="btn-primary px-4 sm:px-6 py-2 text-sm"
                        >
                          Add Your First Expense
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredExpenses.length > 0 && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-semibold">{filteredExpenses.length}</span> of{' '}
                  <span className="font-semibold">{expenses?.length || 0}</span> expenses
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Total: <span className="font-bold text-secondary dark:text-dark-secondary">
                    {totalAmount.toLocaleString('en-EG', {
                      style: 'currency',
                      currency: 'EGP',
                      minimumFractionDigits: 0
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal - Ultra Responsive */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-slideDown">
          <div className="card w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-red-50 dark:bg-dark-secondary/20 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-dark-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-dark dark:text-light truncate">
                Delete Expense
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 sm:px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm flex-1 sm:flex-none order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn-secondary px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm flex-1 sm:flex-none order-1 sm:order-2"
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesList;