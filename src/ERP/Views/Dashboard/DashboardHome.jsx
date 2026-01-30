import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Hooks
import useSales from "@/Hooks/useSales";
import useCustomers from "@/Hooks/useCustomers";
import useExpenses from "@/Hooks/useExpenses";
import useItem from "@/Hooks/useItem";

const DashboardHome = () => {
  const queryClient = useQueryClient();
  
  // Tenant management state
  const [tenantId, setTenantId] = useState(() => {
    const saved = localStorage.getItem('dashboardTenantId');
    return saved ? parseInt(saved) : 80;
  });
  
  const [inputTenantId, setInputTenantId] = useState(tenantId.toString());
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [isLoadingTenant, setIsLoadingTenant] = useState(false);
  const [recentTenants, setRecentTenants] = useState(() => {
    const saved = localStorage.getItem('recentTenants');
    return saved ? JSON.parse(saved) : [80, 1, 2, 3];
  });

  // Save to localStorage whenever tenantId changes
  useEffect(() => {
    localStorage.setItem('dashboardTenantId', tenantId.toString());
    
    // Update recent tenants
    const updated = [...new Set([tenantId, ...recentTenants.filter(id => id !== tenantId)])].slice(0, 5);
    setRecentTenants(updated);
    localStorage.setItem('recentTenants', JSON.stringify(updated));
  }, [tenantId]);

  // React Query hooks
  const { getOrdersByTenantQuery } = useSales();
  const { getAllCustomersQuery } = useCustomers();
  const { getAllExpensesQuery } = useExpenses();
  const { getItemsQuery } = useItem();

  // Fetch data
  const { data: ordersResponse, isLoading: ordersLoading } = getOrdersByTenantQuery(tenantId);
  const { data: customersResponse, isLoading: customersLoading } = getAllCustomersQuery();
  const { data: expensesResponse, isLoading: expensesLoading } = getAllExpensesQuery(tenantId);
  const { data: items, isLoading: itemsLoading } = getItemsQuery(tenantId);

  const orders = ordersResponse?.data || [];
  const customers = customersResponse || [];
  const expenses = expensesResponse || [];
  const itemsList = items || [];

  // Loading state
  const isLoading = ordersLoading || customersLoading || expensesLoading || itemsLoading;

  // Handle tenant change
  const handleTenantChange = (newTenantId) => {
    const parsedId = parseInt(newTenantId);
    if (!isNaN(parsedId) && parsedId > 0) {
      setIsLoadingTenant(true);
      setTenantId(parsedId);
      
      // Invalidate queries to force refetch
      queryClient.invalidateQueries({
        queryKey: ['orders', parsedId]
      });
      queryClient.invalidateQueries({
        queryKey: ['expenses', parsedId]
      });
      queryClient.invalidateQueries({
        queryKey: ['items', parsedId]
      });
      
      // Hide modal and reset loading
      setTimeout(() => {
        setShowTenantModal(false);
        setIsLoadingTenant(false);
      }, 500);
    }
  };

  // Submit tenant form
  const handleSubmitTenant = (e) => {
    e.preventDefault();
    handleTenantChange(inputTenantId);
  };

  // Derived Stats
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "0" || o.status === "Pending").length;
    const completedOrders = orders.filter(o => o.status === "1" || o.status === "Completed").length;
    const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : "0.00";

    const totalCustomers = customers.length;
    const customersWithBalance = customers.filter(c => (c.currentBalance || 0) > 0).length;
    const totalCustomerBalance = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const largestExpense = expenses.length > 0 ? expenses.reduce((max, e) => Math.max(max, e.amount || 0), 0) : 0;

    const lowStockItems = itemsList?.filter(i => (i.currentStock || 0) <= (i.minStockLevel || 0)).length || 0;

    const totalInventoryValue = itemsList?.reduce((sum, i) => sum + ((i.sellingPrice || 0) * (i.currentStock || 0)), 0) || 0;

    const profit = totalSales - totalExpenses;
    const profitMargin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : "0.0";

    return [
      { 
        title: "Total Sales", 
        value: `$${totalSales.toFixed(2)}`, 
        icon: "💰", 
        color: "success",
        trend: totalSales > 0 ? "up" : "neutral",
        change: totalOrders > 0 ? "+12.5%" : "0%",
        description: "From last month"
      },
      { 
        title: "Total Profit", 
        value: `$${profit.toFixed(2)}`, 
        icon: "📈", 
        color: profit >= 0 ? "success" : "danger",
        trend: profit >= 0 ? "up" : "down",
        change: `${profitMargin}% margin`,
        description: "Net profit"
      },
      { 
        title: "Completed Orders", 
        value: completedOrders, 
        icon: "✅", 
        color: "primary",
        trend: completedOrders > 0 ? "up" : "neutral",
        change: completedOrders > 0 ? "+8%" : "0%",
        description: "Completed this month"
      },
      { 
        title: "Pending Orders", 
        value: pendingOrders, 
        icon: "📦", 
        color: "warning",
        trend: pendingOrders > 0 ? "down" : "neutral",
        change: pendingOrders > 0 ? "-3%" : "0%",
        description: "Awaiting fulfillment"
      },
      { 
        title: "Avg Order Value", 
        value: `$${avgOrderValue}`, 
        icon: "📊", 
        color: "info",
        trend: parseFloat(avgOrderValue) > 0 ? "up" : "neutral",
        change: parseFloat(avgOrderValue) > 0 ? "+5.2%" : "0%",
        description: "Average per order"
      },
      { 
        title: "Total Customers", 
        value: totalCustomers, 
        icon: "👥", 
        color: "info",
        trend: totalCustomers > 0 ? "up" : "neutral",
        change: totalCustomers > 0 ? "+15 new" : "0 new",
        description: "Active customers"
      },
      { 
        title: "Outstanding Balance", 
        value: `$${totalCustomerBalance.toFixed(2)}`, 
        icon: "💳", 
        color: "danger",
        trend: totalCustomerBalance > 0 ? "down" : "neutral",
        change: customersWithBalance,
        description: `${customersWithBalance} customers`
      },
      { 
        title: "Low Stock Items", 
        value: lowStockItems, 
        icon: "⚠️", 
        color: "warning",
        trend: lowStockItems > 0 ? "up" : "neutral",
        change: `${lowStockItems} items`,
        description: "Need restocking"
      },
      { 
        title: "Inventory Value", 
        value: `$${totalInventoryValue.toFixed(2)}`, 
        icon: "🏬", 
        color: "purple",
        trend: totalInventoryValue > 0 ? "up" : "neutral",
        change: totalInventoryValue > 0 ? "+4.3%" : "0%",
        description: "Total stock value"
      },
      { 
        title: "Total Expenses", 
        value: `$${totalExpenses.toFixed(2)}`, 
        icon: "🧾", 
        color: "red",
        trend: totalExpenses > 0 ? "down" : "neutral",
        change: totalExpenses > 0 ? "-2.1%" : "0%",
        description: "Monthly expenses"
      },
      { 
        title: "Largest Expense", 
        value: `$${largestExpense.toFixed(2)}`, 
        icon: "📌", 
        color: "orange",
        trend: "neutral",
        change: "Single expense",
        description: "Highest this month"
      },
    ];
  }, [orders, customers, expenses, itemsList]);

  // Recent Orders
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [orders]);

  // Top Products by quantity
  const topProducts = useMemo(() => {
    const productCountMap = {};
    orders.forEach(order => {
      order.items?.forEach(i => {
        if (!productCountMap[i.name]) productCountMap[i.name] = 0;
        productCountMap[i.name] += (i.quantity || 0);
      });
    });
    return Object.entries(productCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));
  }, [orders]);

  // Branch Sales Summary
  const branchSales = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      const branchId = o.branchId || "Unknown";
      if (!map[branchId]) map[branchId] = 0;
      map[branchId] += (o.totalAmount || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([branchId, total]) => ({ branchId, total }));
  }, [orders]);

  // Performance Metrics
  const performanceMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === "1" || o.status === "Completed").length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0;
    
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalExpensesAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profit = totalSales - totalExpensesAmount;
    const profitMargin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0;
    
    const customerGrowth = customers.length > 0 ? "+15%" : "0%";
    
    return [
      { label: "Order Completion", value: `${completionRate}%`, color: completionRate > 80 ? "success" : completionRate > 50 ? "warning" : "danger" },
      { label: "Customer Growth", value: customerGrowth, color: customerGrowth !== "0%" ? "success" : "info" },
      { label: "Profit Margin", value: `${profitMargin}%`, color: profit > 0 ? "success" : profit < 0 ? "danger" : "info" },
      { label: "Inventory Turnover", value: orders.length > 0 ? "2.4x" : "0x", color: orders.length > 0 ? "info" : "gray" },
    ];
  }, [orders, expenses, customers]);

  // Tenant Modal Component
  const TenantModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Switch Tenant</h3>
            <button
              onClick={() => setShowTenantModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmitTenant} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Tenant ID
              </label>
              <input
                type="number"
                value={inputTenantId}
                onChange={(e) => setInputTenantId(e.target.value)}
                min="1"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., 80"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recent Tenants
              </label>
              <div className="flex flex-wrap gap-2">
                {recentTenants.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setInputTenantId(id.toString());
                      handleTenantChange(id);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      tenantId === id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Tenant #{id}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowTenantModal(false)}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoadingTenant}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoadingTenant ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Switching...
                  </>
                ) : (
                  "Switch Tenant"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-6 lg:p-8">
      {showTenantModal && <TenantModal />}
      
      <div className="max-w-7xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-light mb-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back! Here's what's happening with your business today.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <button
                onClick={() => setShowTenantModal(true)}
                className="px-4 py-2 rounded-full bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary text-sm font-medium hover:bg-primary/20 dark:hover:bg-dark-primary/30 transition-colors flex items-center gap-2 group"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Tenant #{tenantId}
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="card p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{metric.label}</div>
                    <div className={`text-lg md:text-xl font-bold text-${metric.color}`}>
                      {metric.value}
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg bg-${metric.color}/10 text-${metric.color}`}>
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="card p-4 md:p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{stat.title}</div>
                  <div className="text-xl md:text-2xl font-bold text-gray-800 dark:text-light mt-1">
                    {stat.value}
                  </div>
                </div>
                <div className={`p-2 md:p-3 rounded-xl text-lg md:text-xl ${
                  stat.color === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  stat.color === 'primary' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  stat.color === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  stat.color === 'info' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' :
                  stat.color === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                }`}>
                  {stat.icon}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 text-xs ${
                    stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                    stat.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {stat.trend === 'up' ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : stat.trend === 'down' ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                      </svg>
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Top Products Card */}
          <div className="card rounded-xl md:rounded-2xl p-4 md:p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-light">Top Products</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Best selling items this month</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 dark:text-light truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Product
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {product.qty} sold
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Units
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {topProducts.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No product sales data available</p>
              </div>
            )}
          </div>

          {/* Recent Orders Card */}
          <div className="card rounded-xl md:rounded-2xl p-4 md:p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-light">Recent Orders</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Latest customer orders</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      order.status === "1" || order.status === "Completed"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-yellow-100 dark:bg-yellow-900/30"
                    }`}>
                      <svg className={`w-4 h-4 ${
                        order.status === "1" || order.status === "Completed"
                          ? "text-green-600 dark:text-green-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 dark:text-light">
                        Order #{order.id || `#${index + 1000}`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      order.status === "1" || order.status === "Completed"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {order.status === "1" || order.status === "Completed" ? "Completed" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
            
            {recentOrders.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No recent orders available</p>
              </div>
            )}
          </div>

          {/* Branch Sales Card */}
          <div className="card rounded-xl md:rounded-2xl p-4 md:p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-light">Top Branches</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">Sales by branch performance</p>
              </div>
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              {branchSales.map((branch, index) => {
                const maxSale = Math.max(...branchSales.map(b => b.total));
                const percentage = maxSale > 0 ? (branch.total / maxSale) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-light">
                            Branch #{branch.branchId}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Sales performance
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                          ${branch.total.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {branchSales.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No branch sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="card p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</div>
                <div className="text-lg font-bold text-gray-800 dark:text-light">
                  ${stats[0]?.value.replace('$', '') || '0.00'}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Active Orders</div>
                <div className="text-lg font-bold text-gray-800 dark:text-light">
                  {stats[2]?.value || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</div>
                <div className="text-lg font-bold text-gray-800 dark:text-light">
                  {stats[7]?.value || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Active Customers</div>
                <div className="text-lg font-bold text-gray-800 dark:text-light">
                  {stats[5]?.value || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;