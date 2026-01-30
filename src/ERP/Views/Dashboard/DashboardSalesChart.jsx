// src/ERP/Views/Dashboard/SalesChart.jsx
import { useState, useEffect } from "react";
import useSales from "@/Hooks/useSales";
import useCustomers from "@/Hooks/useCustomers";
import useExpenses from "@/Hooks/useExpenses";

// Optionally, you can import chart libraries (e.g., Chart.js or Recharts) later
// For now, simplified visualization like before

const SalesChart = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const [activeChart, setActiveChart] = useState("sales");
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  // Tenant ID (replace with auth context if available)
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

        // Total Revenue
        const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        setTotalRevenue(revenue.toFixed(2));

        // Total Orders
        setTotalOrders(orders.length);

        // Avg Order Value
        setAvgOrderValue(orders.length > 0 ? (revenue / orders.length).toFixed(2) : 0);

        // Line chart data (monthly totals)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const line = months.map((m, idx) => {
          const monthlyOrders = orders.filter(
            (o) => new Date(o.createdAt).getMonth() === idx
          );
          const sales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
          return { date: m, sales, orders: monthlyOrders.length };
        });
        setLineData(line);

        // Pie chart by category
        const categoryTotals = {};
        orders.forEach((o) => {
          if (!categoryTotals[o.category]) categoryTotals[o.category] = 0;
          categoryTotals[o.category] += o.totalAmount;
        });
        const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const pie = Object.keys(categoryTotals).map((cat) => ({
          category: cat,
          value: totalSales > 0 ? ((categoryTotals[cat] / totalSales) * 100).toFixed(0) : 0,
          color: "#" + Math.floor(Math.random() * 16777215).toString(16), // random color
        }));
        setPieData(pie);
      },
    });

    // Optional: fetch customers or expenses if needed
    getAllCustomersMutation.mutate(undefined, { onSuccess: () => {} });
    getAllExpensesMutation.mutate({ tenantId }, { onSuccess: () => {} });
  }, []);

  return (
    <div className="p-6 animate-slideDown">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-light mb-2">
            Sales Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Visualize sales performance and trends
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2 mt-4 md:mt-0">
          {["daily", "weekly", "monthly"].map((range) => (
            <button
              key={range}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                timeRange === range
                  ? "btn-primary"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-card"
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-light">${totalRevenue}</p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <span className="text-2xl">💰</span>
          </div>
        </div>
        <div className="card flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-light">{totalOrders}</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <span className="text-2xl">📦</span>
          </div>
        </div>
        <div className="card flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Order Value</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-light">${avgOrderValue}</p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="card lg:col-span-2 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-light">Sales Over Time</h2>
            <div className="flex gap-2">
              {["sales", "orders"].map((chart) => (
                <button
                  key={chart}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeChart === chart
                      ? "btn-primary"
                      : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-card"
                  }`}
                  onClick={() => setActiveChart(chart)}
                >
                  {chart.charAt(0).toUpperCase() + chart.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Simplified line chart */}
          <div className="h-64 relative flex items-end">
            {lineData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center mx-1">
                <div
                  className="w-10 bg-primary dark:bg-dark-primary rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${activeChart === "sales" ? item.sales / 100 : item.orders * 10}px`,
                    maxHeight: "90%",
                  }}
                  title={activeChart === "sales" ? `$${item.sales}` : `${item.orders} orders`}
                ></div>
                <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card p-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-light mb-6">Sales by Category</h2>
          <div className="h-64 relative flex items-center justify-center">
            <div className="relative w-48 h-48">
              {pieData.reduce((acc, item, idx) => {
                const prevPercent = acc;
                const rotation = (prevPercent / 100) * 360;
                return (
                  <>
                    {acc}
                    <div
                      key={idx}
                      className="absolute top-0 left-0 w-full h-full rounded-full"
                      style={{
                        clipPath: `conic-gradient(${item.color} ${prevPercent}%, ${item.color} ${parseInt(item.value) + prevPercent}%, transparent ${
                          parseInt(item.value) + prevPercent
                        }%)`,
                        transform: `rotate(${rotation}deg)`,
                      }}
                    />
                  </>
                );
              }, 0)}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 space-y-3">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-light">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
