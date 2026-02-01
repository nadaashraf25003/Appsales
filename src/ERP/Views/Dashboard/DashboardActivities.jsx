// src/ERP/Views/Dashboard/Activities.jsx
import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Hooks
import useSales from "@/Hooks/useSales";
import useCustomers from "@/Hooks/useCustomers";
import useExpenses from "@/Hooks/useExpenses";

const Activities = () => {
  const queryClient = useQueryClient();
  const [tenantId, setTenantId] = useState(() => {
    const saved = localStorage.getItem("activitiesTenantId");
    return saved ? parseInt(saved) : 1;
  });
  const [tenantIdInput, setTenantIdInput] = useState(tenantId.toString());
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [recentTenants, setRecentTenants] = useState(() => {
    const saved = localStorage.getItem("recentActivitiesTenants");
    return saved ? JSON.parse(saved) : [1, 2, 3, 80];
  });

  // Save tenantId to localStorage
  useEffect(() => {
    localStorage.setItem("activitiesTenantId", tenantId.toString());

    // Update recent tenants
    const updated = [
      ...new Set([tenantId, ...recentTenants.filter((id) => id !== tenantId)]),
    ].slice(0, 5);
    setRecentTenants(updated);
    localStorage.setItem("recentActivitiesTenants", JSON.stringify(updated));
  }, [tenantId]);

  // Hooks
  const { getOrdersByTenantQuery } = useSales();
  const { getAllCustomersQuery } = useCustomers();
  const { getAllExpensesQuery } = useExpenses();

  // Fetch data
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = getOrdersByTenantQuery(tenantId);
  const { data: customersResponse, isLoading: customersLoading } =
    getAllCustomersQuery();
  const {
    data: expensesResponse,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = getAllExpensesQuery(tenantId);

  const orders = ordersResponse?.data || [];
  const customers = customersResponse || [];
  const expenses = expensesResponse || [];

  // Loading state
  const loading =
    isLoading || ordersLoading || customersLoading || expensesLoading;

  // Handle tenant change
  const handleTenantChange = (newTenantId) => {
    const parsedId = parseInt(newTenantId);
    if (!isNaN(parsedId) && parsedId > 0) {
      setIsLoading(true);
      setTenantId(parsedId);

      // Invalidate and refetch queries
      queryClient.invalidateQueries({
        queryKey: ["orders", parsedId],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses", parsedId],
      });

      // Hide modal and reset loading
      setTimeout(() => {
        setShowTenantModal(false);
        setIsLoading(false);
      }, 500);
    }
  };

  // Submit tenant form
  const handleSubmitTenant = (e) => {
    e.preventDefault();
    handleTenantChange(tenantIdInput);
  };

  // Filter activities by time
  const filterByTime = (activities) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    return activities.filter((activity) => {
      const activityTime = new Date(activity.time);
      const timeDiff = now - activityTime;

      switch (timeFilter) {
        case "today":
          return timeDiff < oneDay;
        case "week":
          return timeDiff < oneWeek;
        case "month":
          return timeDiff < oneMonth;
        default:
          return true;
      }
    });
  };
 const statusMap = {
  Pending: "Pending",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Ready: "Ready",
  Preparing: "Preparing",
  Confirmed: "Confirmed",
};

  // Map data to activities
  const allActivities = useMemo(() => {
    // Order activities
    const orderActivities = orders.map((order) => ({
      id: `order-${order.id}`,
      type: "order",
      title: `Order #${order.id}`,
      description:
        order.status === "Completed"
          ? "Order completed successfully"
          : order.status === "Pending"
            ? "Order placed and pending"
            : "Order updated",
      amount: `$${order.totalAmount?.toFixed(2) || "0.00"}`,
      time: new Date(order.createdAt),
      status: statusMap[order.status] || "Unknown",
      user: order.customerName || "Customer",
      icon: "📦",
      color: order.status === "1" ? "green" : "orange",
    }));

    // Customer activities
    const customerActivities = customers.map((customer) => ({
      id: `customer-${customer.id}`,
      type: "customer",
      title: `New Customer`,
      description: `${customer.name} registered`,
      // amount: `Balance: $${customer.currentBalance?.toFixed(2) || "0.00"}`,
      time: new Date(customer.createdAt || Date.now()),
      status: "registered",
      user: customer.name,
      icon: "👤",
      color: "blue",
    }));

    // Expense activities
    const expenseActivities = expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      type: "expense",
      title: `Expense Recorded`,
      description: expense.description || "General expense",
      amount: `-$${expense.amount?.toFixed(2) || "0.00"}`,
      time: new Date(expense.date || expense.createdAt || Date.now()),
      status: "recorded",
      user: expense.category || "General",
      icon: "💰",
      color: "red",
    }));

    // Combine all activities
    const combined = [
      ...orderActivities,
      ...customerActivities,
      ...expenseActivities,
    ];

    // Sort by time (newest first)
    return combined.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [orders, customers, expenses]);

  // Apply filters
  const filteredActivities = useMemo(() => {
    let filtered = allActivities;

    // Filter by time
    filtered = filterByTime(filtered);

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((activity) => activity.type === typeFilter);
    }

    return filtered.slice(0, 20); // Limit to 20 items
  }, [allActivities, timeFilter, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const today = filterByTime(allActivities).filter((a) => {
      const now = new Date();
      const activityTime = new Date(a.time);
      return now - activityTime < 24 * 60 * 60 * 1000;
    });

    return {
      total: allActivities.length,
      today: today.length,
      orders: allActivities.filter((a) => a.type === "order").length,
      customers: allActivities.filter((a) => a.type === "customer").length,
      expenses: allActivities.filter((a) => a.type === "expense").length,
    };
  }, [allActivities]);

  // Format time display
  const formatTime = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / (24 * 3600000));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return activityDate.toLocaleDateString();
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      case "registered":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

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
                value={tenantIdInput}
                onChange={(e) => setTenantIdInput(e.target.value)}
                min="1"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 1"
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
                      setTenantIdInput(id.toString());
                      handleTenantChange(id);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      tenantId === id
                        ? "bg-blue-600 text-white"
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
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
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

  if (loading && allActivities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading activities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      {showTenantModal && <TenantModal />}

      <div className="max-w-7xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Activity Log
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-12">
                Track all recent activities across the system
              </p>
            </div>

            {/* Tenant ID Display & Switch Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={() => setShowTenantModal(true)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex items-center gap-3 group w-full sm:w-auto"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Current Tenant
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      #{tenantId}
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400 transition-transform group-hover:rotate-180"
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
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  // Refresh data for current tenant
                  setIsLoading(true);
                  refetchOrders();
                  refetchExpenses();
                  setTimeout(() => setIsLoading(false), 500);
                }}
                disabled={isLoading}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 w-full sm:w-auto"
              >
                <svg
                  className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isLoading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {isLoading ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex justify-between items-center">
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
              {["all", "order", "customer", "expense"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTypeFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                    typeFilter === filter
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {filter === "all" ? "All Types" : filter + "s"}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Data for Tenant #{tenantId}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Activities
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <span className="text-2xl text-blue-600 dark:text-blue-400">
                  📊
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-green-600 dark:text-green-400">
                {stats.today}
              </span>{" "}
              today
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.orders}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <span className="text-2xl text-green-600 dark:text-green-400">
                  📦
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Order activities
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.customers}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <span className="text-2xl text-orange-600 dark:text-orange-400">
                  👤
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Customer registrations
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Expenses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.expenses}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <span className="text-2xl text-red-600 dark:text-red-400">
                  💰
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Expense records
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Activity Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Activities
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Showing {filteredActivities.length} of {allActivities.length}{" "}
                  activities
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated:{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* Activity List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl ${
                      activity.type === "order"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : activity.type === "customer"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <span className="text-xl">{activity.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {activity.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}
                      >
                        {activity.status}
                      </span>
                      <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(activity.time)}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {activity.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {activity.user}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.time.toLocaleDateString()} at{" "}
                          {activity.time.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      <div
                        className={`text-lg font-bold ${
                          activity.type === "expense"
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {activity.amount}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No activities found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  There are no activities for Tenant #{tenantId}. Try switching
                  to a different tenant.
                </p>
                <button
                  onClick={() => setShowTenantModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
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
                  Switch Tenant
                </button>
              </div>
            )}
          </div>

          {/* Activity Footer */}
          {filteredActivities.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div>
                  Showing{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {filteredActivities.length}
                  </span>{" "}
                  activities
                  {typeFilter !== "all" && ` (${typeFilter}s only)`}
                  for Tenant #{tenantId}
                </div>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                  View all activities
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activity Types Legend */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Activity Types
            </h3>
            <button
              onClick={() => setShowTenantModal(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
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
              Change Tenant
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Order Activities
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  New orders, status updates, completions
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Customer Activities
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  New registrations, profile updates
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Expense Activities
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  New expenses, updates, deletions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Activity log automatically refreshes every 5 minutes</p>
          <p className="mt-1">
            Tenant #{tenantId} • Last sync: {new Date().toLocaleTimeString()} •
            <button
              onClick={() => setShowTenantModal(true)}
              className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Switch tenant
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Activities;
