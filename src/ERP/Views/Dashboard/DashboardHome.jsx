// src/ERP/Views/Dashboard/DashboardHome.jsx
import { useEffect, useState } from "react";
import ActivityList from "./components/ActivityList";
import { StatsCard } from "./components/StatsCard";

// Hooks
import useSales from "@/Hooks/useSales";
import useCustomers from "@/Hooks/useCustomers";
import useExpenses from "@/Hooks/useExpenses";
import useUsers from "@/Hooks/useUsers";

const DashboardHome = () => {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([
    "Product A",
    "Product B",
    "Product C",
  ]);

  // Tenant ID (replace with dynamic tenantId from auth context or state)
  const tenantId = 1;

  // Hooks
  const { getOrdersByTenantMutation } = useSales();
  const { getAllCustomersMutation } = useCustomers();
  const { getAllExpensesMutation } = useExpenses();

  useEffect(() => {
    // Fetch Orders
    getOrdersByTenantMutation.mutate(tenantId, {
      onSuccess: (res) => {
        const orders = res.data || [];

        // Stats: Total Sales & New Orders
        setStats((prev) => [
          ...prev,
          {
            title: "Total Sales",
            value: `$${orders.reduce((a, o) => a + o.totalAmount, 0).toFixed(2)}`,
            icon: "💰",
            trend: "+0%",
            color: "success",
          },
          {
            title: "New Orders",
            value: `${orders.filter((o) => o.status === "Pending").length}`,
            icon: "📦",
            trend: "+0%",
            color: "primary",
          },
        ]);

        // Recent Orders & Activities
        const recent = orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentOrders(recent);

        const orderActivities = recent.map((o) => ({
          id: o.id,
          activity: `Order #${o.id} ${o.status}`,
          time: new Date(o.createdAt).toLocaleString(),
          type: "order",
        }));

        setActivities((prev) => [...prev, ...orderActivities]);
      },
    });

    // Fetch Customers
    getAllCustomersMutation.mutate(undefined, {
      onSuccess: (res) => {
        const customers = res.data || [];

        setStats((prev) => [
          ...prev,
          {
            title: "Customers",
            value: customers.length,
            icon: "👥",
            trend: "+0%",
            color: "info",
          },
        ]);

        const customerActivities = customers.slice(-5).map((c) => ({
          id: c.id,
          activity: `New customer registered: ${c.name}`,
          time: new Date().toLocaleTimeString(),
          type: "customer",
        }));

        setActivities((prev) => [...prev, ...customerActivities]);
      },
    });

    // Fetch Expenses (Pending Invoices)
    getAllExpensesMutation.mutate({ tenantId }, {
      onSuccess: (res) => {
        const expenses = res.data || [];

        setStats((prev) => [
          ...prev,
          {
            title: "Pending Invoices",
            value: expenses.length,
            icon: "📄",
            trend: "-0%",
            color: "warning",
          },
        ]);

        const expenseActivities = expenses.slice(-5).map((e) => ({
          id: e.id,
          activity: `Expense added: ${e.description} ($${e.amount})`,
          time: new Date(e.date).toLocaleDateString(),
          type: "expense",
        }));

        setActivities((prev) => [...prev, ...expenseActivities]);
      },
    });
  }, []);

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
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-light">
                Recent Activities
              </h2>
              <button className="text-sm text-primary dark:text-dark-primary font-medium hover:opacity-80">
                View All →
              </button>
            </div>
            <ActivityList activities={activities.slice(0, 5)} />
          </div>
        </div>

        {/* Quick Stats / Sidebar */}
        <div className="space-y-6">
          {/* Performance Chart Placeholder */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-light mb-4">
              Performance
            </h3>
            <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-dark-card rounded-xl">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600 dark:text-gray-300">Chart visualization</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly trends</p>
              </div>
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
        </div>
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
              <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-card rounded-lg transition-colors">
                <span className="text-gray-700 dark:text-gray-300">{product}</span>
                <span className="text-sm font-medium text-brand-success">+{25 - i * 5}%</span>
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
              <div key={order.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-card rounded-lg transition-colors">
                <span className="text-gray-700 dark:text-gray-300">Order #{order.id}</span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  order.status === "Completed" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-light mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">API Services</span>
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
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
