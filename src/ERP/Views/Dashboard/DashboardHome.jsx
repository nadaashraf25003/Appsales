import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Hooks
import useSales from "@/Hooks/useSales";
import useCustomers from "@/Hooks/useCustomers";
import useExpenses from "@/Hooks/useExpenses";
import useItem from "@/Hooks/useItem";

// Order status configuration
const ORDER_STATUS = {
  PENDING: {
    value: "Pending",
    label: "Pending",
    color: "yellow",
    description: "Order placed and awaiting confirmation",
    icon: "⏳",
  },
  CONFIRMED: {
    value: "Confirmed",
    label: "Confirmed",
    color: "blue",
    description: "Order confirmed by restaurant",
    icon: "✅",
  },
  PREPARING: {
    value: "Preparing",
    label: "Preparing",
    color: "purple",
    description: "Order is being prepared",
    icon: "👨‍🍳",
  },
  READY: {
    value: "Ready",
    label: "Ready",
    color: "cyan",
    description: "Order is ready for pickup/delivery",
    icon: "📦",
  },
  DELIVERING: {
    value: "Delivering",
    label: "Out for Delivery",
    color: "indigo",
    description: "Order is out for delivery",
    icon: "🚚",
  },
  COMPLETED: {
    value: "Completed",
    label: "Completed",
    color: "green",
    description: "Order delivered successfully",
    icon: "🎉",
  },
  CANCELLED: {
    value: "Cancelled",
    label: "Cancelled",
    color: "red",
    description: "Order was cancelled",
    icon: "❌",
  },
};

const STATUS_FLOW = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Delivering",
  "Completed",
];

const DashboardHome = () => {
  const queryClient = useQueryClient();

  // Tenant management state
  const [tenantId, setTenantId] = useState(() => {
    const saved = localStorage.getItem("dashboardTenantId");
    return saved ? parseInt(saved) : 80;
  });

  const [inputTenantId, setInputTenantId] = useState(tenantId.toString());
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [isLoadingTenant, setIsLoadingTenant] = useState(false);
  const [recentTenants, setRecentTenants] = useState(() => {
    const saved = localStorage.getItem("recentTenants");
    return saved ? JSON.parse(saved) : [80, 1, 2, 3];
  });

  // Save to localStorage whenever tenantId changes
  useEffect(() => {
    localStorage.setItem("dashboardTenantId", tenantId.toString());

    // Update recent tenants
    const updated = [
      ...new Set([tenantId, ...recentTenants.filter((id) => id !== tenantId)]),
    ].slice(0, 5);
    setRecentTenants(updated);
    localStorage.setItem("recentTenants", JSON.stringify(updated));
  }, [tenantId]);

  // React Query hooks
  const { getOrdersByTenantQuery } = useSales();
  const { getAllCustomersQuery } = useCustomers();
  const { getAllExpensesQuery } = useExpenses();
  const { getItemsQuery } = useItem();

  // Fetch data
  const { data: ordersResponse, isLoading: ordersLoading } =
    getOrdersByTenantQuery(tenantId);
  const { data: customersResponse, isLoading: customersLoading } =
    getAllCustomersQuery();
  const { data: expensesResponse, isLoading: expensesLoading } =
    getAllExpensesQuery(tenantId);
  const { data: items, isLoading: itemsLoading } = getItemsQuery(tenantId);
  console.log("Items data:", items);

  const orders = ordersResponse?.data || [];
  const customers = customersResponse || [];
  const expenses = expensesResponse || [];
  const itemsList = items || [];

  // Loading state
  const isLoading =
    ordersLoading || customersLoading || expensesLoading || itemsLoading;

  // Handle tenant change
  const handleTenantChange = (newTenantId) => {
    const parsedId = parseInt(newTenantId);
    if (!isNaN(parsedId) && parsedId > 0) {
      setIsLoadingTenant(true);
      setTenantId(parsedId);

      // Invalidate queries to force refetch
      queryClient.invalidateQueries({
        queryKey: ["orders", parsedId],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses", parsedId],
      });
      queryClient.invalidateQueries({
        queryKey: ["items", parsedId],
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

  // Helper function to get order status
  const getOrderStatus = (status) => {
    return (
      ORDER_STATUS[status?.toUpperCase()] ||
      ORDER_STATUS.PENDING
    );
  };

  // Derived Stats with proper order status handling
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    
    // Order status counts
    const statusCounts = {};
    Object.values(ORDER_STATUS).forEach((status) => {
      statusCounts[status.value] = orders.filter(
        (o) => getOrderStatus(o.status).value === status.value
      ).length;
    });

    const avgOrderValue =
      totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : "0.00";

    const totalCustomers = customers.length;
    const customersWithBalance = customers.filter(
      (c) => (c.currentBalance || 0) > 0,
    ).length;
    const totalCustomerBalance = customers.reduce(
      (sum, c) => sum + (c.currentBalance || 0),
      0,
    );

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const largestExpense =
      expenses.length > 0
        ? expenses.reduce((max, e) => Math.max(max, e.amount || 0), 0)
        : 0;

    const lowStockItems =
      itemsList?.filter((i) => (i.currentStock || 0) <= (i.minStockLevel || 0))
        .length || 0;

    const totalInventoryValue =
      itemsList?.reduce(
        (sum, i) => sum + (i.sellingPrice || 0) * (i.currentStock || 0),
        0,
      ) || 0;

    const profit = totalSales - totalExpenses;
    const profitMargin =
      totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : "0.0";

    return [
      {
        title: "Total Sales",
        value: `$${totalSales.toFixed(2)}`,
        icon: "💰",
        color: "green",
        trend: totalSales > 0 ? "up" : "neutral",
        change: totalOrders > 0 ? "+12.5%" : "0%",
        description: "From last month",
      },
      {
        title: "Active Orders",
        value: orders.filter(o => 
          ["Pending", "Confirmed", "Preparing", "Ready", "Delivering"].includes(getOrderStatus(o.status).value)
        ).length,
        icon: "📋",
        color: "blue",
        trend: "up",
        change: statusCounts.Pending > 0 ? `${statusCounts.Pending} pending` : "All clear",
        description: "Orders in progress",
      },
      {
        title: "Completed Orders",
        value: statusCounts.Completed,
        icon: "✅",
        color: "green",
        trend: statusCounts.Completed > 0 ? "up" : "neutral",
        change: statusCounts.Completed > 0 ? "+8%" : "0%",
        description: "Delivered successfully",
      },
      {
        title: "Cancelled Orders",
        value: statusCounts.Cancelled,
        icon: "❌",
        color: "red",
        trend: statusCounts.Cancelled > 0 ? "down" : "neutral",
        change: statusCounts.Cancelled > 0 ? "-3%" : "0%",
        description: "Cancelled this month",
      },
      {
        title: "Avg Order Value",
        value: `$${avgOrderValue}`,
        icon: "📊",
        color: "purple",
        trend: parseFloat(avgOrderValue) > 0 ? "up" : "neutral",
        change: parseFloat(avgOrderValue) > 0 ? "+5.2%" : "0%",
        description: "Average per order",
      },
      {
        title: "Total Customers",
        value: totalCustomers,
        icon: "👥",
        color: "cyan",
        trend: totalCustomers > 0 ? "up" : "neutral",
        change: totalCustomers > 0 ? "+15 new" : "0 new",
        description: "Active customers",
      },
      {
        title: "Outstanding Balance",
        value: `$${totalCustomerBalance.toFixed(2)}`,
        icon: "💳",
        color: "orange",
        trend: totalCustomerBalance > 0 ? "down" : "neutral",
        change: customersWithBalance,
        description: `${customersWithBalance} customers`,
      },
      {
        title: "Low Stock Items",
        value: lowStockItems,
        icon: "⚠️",
        color: "yellow",
        trend: lowStockItems > 0 ? "up" : "neutral",
        change: `${lowStockItems} items`,
        description: "Need restocking",
      },
      {
        title: "Total Profit",
        value: `$${profit.toFixed(2)}`,
        icon: "📈",
        color: profit >= 0 ? "green" : "red",
        trend: profit >= 0 ? "up" : "down",
        change: `${profitMargin}% margin`,
        description: "Net profit",
      },
      {
        title: "Order Completion Rate",
        value: `${totalOrders > 0 ? ((statusCounts.Completed / totalOrders) * 100).toFixed(1) : 0}%`,
        icon: "🎯",
        color: statusCounts.Completed / totalOrders > 0.8 ? "green" : "yellow",
        trend: "up",
        change: "Success rate",
        description: "Orders fulfilled",
      },
    ];
  }, [orders, customers, expenses, itemsList]);

  // Order status breakdown
  const orderStatusBreakdown = useMemo(() => {
    return Object.values(ORDER_STATUS).map((status) => ({
      ...status,
      count: orders.filter(o => getOrderStatus(o.status).value === status.value).length,
      percentage: orders.length > 0 
        ? ((orders.filter(o => getOrderStatus(o.status).value === status.value).length / orders.length) * 100).toFixed(1)
        : 0,
    }));
  }, [orders]);

  // Recent Orders with proper status display
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [orders]);

  // Orders by status timeline
  const ordersTimeline = useMemo(() => {
    const timeline = [];
    const now = new Date();
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => {
      const dayOrders = orders.filter(o => 
        o.createdAt && o.createdAt.split('T')[0] === date
      );
      
      if (dayOrders.length > 0) {
        timeline.push({
          date,
          orders: dayOrders.length,
          completed: dayOrders.filter(o => getOrderStatus(o.status).value === "Completed").length,
          cancelled: dayOrders.filter(o => getOrderStatus(o.status).value === "Cancelled").length,
        });
      }
    });

    return timeline;
  }, [orders]);

  // Top Products by quantity
  const topProducts = useMemo(() => {
    const productCountMap = {};
    orders.forEach((order) => {
      order.items?.forEach((i) => {
        if (!productCountMap[i.name]) productCountMap[i.name] = 0;
        productCountMap[i.name] += i.quantity || 0;
      });
    });
    return Object.entries(productCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));
  }, [orders]);

  // Performance Metrics with order status consideration
  const performanceMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => getOrderStatus(o.status).value === "Completed"
    ).length;
    
    const cancelledOrders = orders.filter(
      (o) => getOrderStatus(o.status).value === "Cancelled"
    ).length;

    const completionRate =
      totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;
    
    const cancellationRate =
      totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0;

    const avgProcessingTime = "45 min"; // This would require actual timestamp data

    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalExpensesAmount = expenses.reduce(
      (sum, e) => sum + (e.amount || 0),
      0,
    );
    const profit = totalSales - totalExpensesAmount;
    const profitMargin =
      totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0;

    return [
      {
        label: "Order Completion",
        value: `${completionRate}%`,
        color:
          completionRate > 90
            ? "green"
            : completionRate > 70
              ? "yellow"
              : "red",
        icon: "🎯",
      },
      {
        label: "Cancellation Rate",
        value: `${cancellationRate}%`,
        color:
          cancellationRate < 5
            ? "green"
            : cancellationRate < 15
              ? "yellow"
              : "red",
        icon: "⚠️",
      },
      {
        label: "Avg Processing Time",
        value: avgProcessingTime,
        color: avgProcessingTime.includes("min") ? "blue" : "purple",
        icon: "⏱️",
      },
      {
        label: "Customer Satisfaction",
        value: "4.8/5",
        color: "green",
        icon: "⭐",
      },
    ];
  }, [orders, expenses]);

  // Tenant Modal Component
  const TenantModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Switch Tenant
            </h3>
            <button
              onClick={() => setShowTenantModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoadingTenant ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 md:p-6 lg:p-8">
      {showTenantModal && <TenantModal />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back! Here's what's happening with your business today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <button
                onClick={() => setShowTenantModal(true)}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 group"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Tenant #{tenantId}
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {metric.label}
                    </div>
                    <div className={`text-lg md:text-xl font-bold text-${metric.color}-600 dark:text-${metric.color}-400`}>
                      {metric.value}
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30 text-${metric.color}-600 dark:text-${metric.color}-400`}>
                    {metric.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`p-2 md:p-3 rounded-xl text-lg md:text-xl ${
                    stat.color === "green"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : stat.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : stat.color === "yellow"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                          : stat.color === "purple"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                            : stat.color === "cyan"
                              ? "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
                              : stat.color === "red"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {stat.icon}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      stat.trend === "up"
                        ? "text-green-600 dark:text-green-400"
                        : stat.trend === "down"
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                    ) : stat.trend === "down" ? (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 12h14"
                        />
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
          {/* Order Status Overview Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 lg:col-span-1 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                  Order Status Overview
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Current order distribution
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              {orderStatusBreakdown.map((status) => (
                <div key={status.value} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getColorClass(status.color, 'bg')} flex items-center justify-center`}>
                        <span className="text-lg">{status.icon}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {status.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {status.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {status.count}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {status.percentage}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getColorClass(status.color, 'bg')} rounded-full transition-all duration-500`}
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 lg:col-span-1 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                  Recent Orders
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Latest customer orders
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order, index) => {
                const status = getOrderStatus(order.status);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getColorClass(status.color, 'bg')} flex items-center justify-center`}>
                        <span className="text-lg">{status.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          Order #{order.id || `#${index + 1000}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ${(order.totalAmount || 0).toFixed(2)} • {order.items?.length || 0} items
                        </div>
                        {order.customerName && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {order.customerName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getColorClass(status.color, 'bg')} ${getColorClass(status.color, 'text')}`}>
                        {status.label}
                      </span>
                      {order.createdAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {recentOrders.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No recent orders available
                </p>
              </div>
            )}
          </div>

          {/* Top Products Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 lg:col-span-1 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                  Top Products
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Best selling items this month
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
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
                      <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Best Seller
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
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No product sales data available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Timeline */}
        {/* {ordersTimeline.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 mb-6 md:mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                  Order Timeline (Last 7 Days)
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Daily order performance
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
              {ordersTimeline.map((day, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-lg font-bold text-gray-800 dark:text-white">
                    {day.orders}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {day.completed} completed
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

// Helper function to get color classes
const getColorClass = (color, type = 'bg') => {
  const colors = {
    green: type === 'bg' ? 'bg-green-100 dark:bg-green-900/30' : 'text-green-600 dark:text-green-400',
    blue: type === 'bg' ? 'bg-blue-100 dark:bg-blue-900/30' : 'text-blue-600 dark:text-blue-400',
    yellow: type === 'bg' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'text-yellow-600 dark:text-yellow-400',
    purple: type === 'bg' ? 'bg-purple-100 dark:bg-purple-900/30' : 'text-purple-600 dark:text-purple-400',
    cyan: type === 'bg' ? 'bg-cyan-100 dark:bg-cyan-900/30' : 'text-cyan-600 dark:text-cyan-400',
    red: type === 'bg' ? 'bg-red-100 dark:bg-red-900/30' : 'text-red-600 dark:text-red-400',
    orange: type === 'bg' ? 'bg-orange-100 dark:bg-orange-900/30' : 'text-orange-600 dark:text-orange-400',
    indigo: type === 'bg' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'text-indigo-600 dark:text-indigo-400',
  };
  return colors[color] || colors.blue;
};

export default DashboardHome;