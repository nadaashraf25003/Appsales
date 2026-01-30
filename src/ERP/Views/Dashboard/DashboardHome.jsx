// src/ERP/Views/Dashboard/DashboardHome.jsx
import { useMemo } from "react";
import ActivityList from "./components/ActivityList";
import { StatsCard } from "./components/StatsCard";

// Hooks
import useSales from "@/Hooks/useSales";
import useCustomers from "@/Hooks/useCustomers";
import useExpenses from "@/Hooks/useExpenses";

const DashboardHome = () => {
  // Tenant ID (replace with dynamic tenantId from auth context or state)
  const tenantId = 1;

  // React Query hooks
  const { getOrdersByTenantQuery } = useSales();
  const { getAllCustomersQuery } = useCustomers();
  const { getAllExpensesQuery } = useExpenses();

  // Fetch data
  const { data: ordersResponse } = getOrdersByTenantQuery(tenantId);
  const orders = ordersResponse?.data || []; // default to empty array
  const { data: customersResponse } = getAllCustomersQuery();
  const customers = customersResponse?.data || [];

  const { data: expensesResponse } = getAllExpensesQuery(tenantId);
  const expenses = expensesResponse?.data || [];
  // Derived Stats
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter((o) => o.status === "Pending").length;

    return [
      {
        title: "Total Sales",
        value: `$${totalSales.toFixed(2)}`,
        icon: "💰",
        trend: "+0%",
        color: "success",
      },
      {
        title: "New Orders",
        value: pendingOrders,
        icon: "📦",
        trend: "+0%",
        color: "primary",
      },
      {
        title: "Customers",
        value: customers.length,
        icon: "👥",
        trend: "+0%",
        color: "info",
      },
      {
        title: "Pending Invoices",
        value: expenses.length,
        icon: "📄",
        trend: "-0%",
        color: "warning",
      },
    ];
  }, [orders, customers, expenses]);

  // Recent Orders
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [orders]);


  // Top Products placeholder (can later derive from orders)
  const topProducts = ["Product A", "Product B", "Product C"];

  return (
    <div className="p-6 animate-slideDown">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-light mb-2">
          Welcome Back!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <StatsCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            // trend={stat.trend}
            // color={stat.color}
          />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-light mb-4">
            Top Products
          </h3>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-card rounded-lg transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {product}
                </span>
                <span className="text-sm font-medium text-brand-success">
                  +{25 - i * 5}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-light mb-4">
            Recent Orders
          </h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-card rounded-lg transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  Order #{order.id}
                </span>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    order.status === "Completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-light mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full btn-primary flex items-center justify-center gap-2">
              <span>+</span>
              <span>Create New Order</span>
            </button>
            <button className="w-full btn-secondary flex items-center justify-center gap-2">
              <span>📊</span>
              <span>Generate Report</span>
            </button>
            <button className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
              <span>👥</span>
              <span>Add Customer</span>
            </button>
          </div>
        </div>
        {/* System Status */}
        {/* <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-light mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                API Services
              </span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Database</span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Storage</span>
              <span className="text-sm text-brand-warning">78% used</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default DashboardHome;
