// src/ERP/Views/Dashboard/SalesChart.jsx
import { useState, useEffect, useMemo } from "react";
import useSales from "@/Hooks/useSales";
import useExpenses from "@/Hooks/useExpenses";

// Mock user data (replace with auth context in real app)
const user = {
  id: 25,
  name: "Nada Ashraf",
  email: "nadanadaashraf25@gmail.com",
  role: "SuperAdmin",
  tenantId: 1,
  branchId: 1,
};

const SalesChart = () => {
  const [tenantIdInput, setTenantIdInput] = useState(user.tenantId);
  const [tenantId, setTenantId] = useState(user.tenantId);
  const [isLoading, setIsLoading] = useState(false);

  const [timeRange, setTimeRange] = useState("monthly");
  const [activeChart, setActiveChart] = useState("sales");

  const [orders, setOrders] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const { getOrdersByTenantMutation } = useSales();
  const { getAllExpensesMutation } = useExpenses();

  // Fetch orders for a tenant
  const refetchOrders = (tenantIdToFetch) => {
    setIsLoading(true);
    getOrdersByTenantMutation.mutate(tenantIdToFetch, {
      onSuccess: (res) => {
        const fetchedOrders = res.data || [];
        console.log("Fetched orders:", fetchedOrders);

        // Filter by branch if not SuperAdmin
        const filteredOrders =
          user.role === "SuperAdmin"
            ? fetchedOrders
            : fetchedOrders.filter((o) => o.branchId === user.branchId);

        // If no orders, set empty array to trigger zero stats
        setOrders(filteredOrders.length ? filteredOrders : []);
        setIsLoading(false);
      },
      onError: () => {
        // If API fails, treat as no data
        setOrders([]);
        setIsLoading(false);
      },
    });

    getAllExpensesMutation.mutate({ tenantId: tenantIdToFetch }, { onSuccess: () => {} });
  };

  // Initial fetch
  useEffect(() => {
    refetchOrders(tenantId);
  }, []);

  // Stats calculation with fallback to zeros
  const stats = useMemo(() => {
    if (!orders.length) {
      return { 
        totalRevenue: "0.00", 
        totalOrders: 0, 
        avgOrderValue: "0.00", 
        pendingOrders: 0,
        completedOrders: 0,
        totalCustomers: new Set(orders.map(o => o.customerId || o.customer?.id)).size
      };
    }

    const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrder = orders.length > 0 ? revenue / orders.length : 0;
    const pendingOrders = orders.filter((o) => o.status === "0").length;
    const completedOrders = orders.filter((o) => o.status === "1").length;
    const uniqueCustomers = new Set(orders.map(o => o.customerId || o.customer?.id)).size;

    return {
      totalRevenue: revenue.toFixed(2),
      totalOrders: orders.length,
      avgOrderValue: avgOrder.toFixed(2),
      pendingOrders,
      completedOrders,
      totalCustomers: uniqueCustomers
    };
  }, [orders]);

  // Line chart (monthly) with fallback zeros
  useEffect(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const line = months.map((m, idx) => {
      const monthlyOrders = orders.filter(
        (o) => new Date(o.createdAt).getMonth() === idx
      );
      const sales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return { date: m, sales: sales || 0, orders: monthlyOrders.length || 0 };
    });
    setLineData(line);
  }, [orders]);

  // Pie chart with zeros fallback
  useEffect(() => {
    if (!orders.length) {
      setPieData([
        { status: "Pending", value: 0, color: "#F97316", count: 0 },
        { status: "Processing", value: 0, color: "#3B82F6", count: 0 },
        { status: "Completed", value: 0, color: "#10B981", count: 0 },
        { status: "Cancelled", value: 0, color: "#EF4444", count: 0 },
      ]);
      return;
    }

    const statusCounts = {
      Pending: 0,
      Processing: 0,
      Completed: 0,
      Cancelled: 0,
    };

    orders.forEach((o) => {
      if (o.status === "0") statusCounts.Pending++;
      else if (o.status === "1") statusCounts.Processing++;
      else if (o.status === "2") statusCounts.Completed++;
      else statusCounts.Cancelled++;
    });

    const totalOrders = orders.length;
    const pie = Object.keys(statusCounts).map((status) => ({
      status,
      value: totalOrders > 0 ? ((statusCounts[status] / totalOrders) * 100).toFixed(0) : 0,
      count: statusCounts[status],
      color: 
        status === "Pending" ? "#F97316" :
        status === "Processing" ? "#3B82F6" :
        status === "Completed" ? "#10B981" : "#EF4444"
    }));

    setPieData(pie);
  }, [orders]);

  // Calculate max value for chart scaling
  const maxSalesValue = useMemo(() => {
    if (!lineData.length) return 100;
    return Math.max(...lineData.map(d => d.sales), 100);
  }, [lineData]);

  const maxOrdersValue = useMemo(() => {
    if (!lineData.length) return 10;
    return Math.max(...lineData.map(d => d.orders), 10);
  }, [lineData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto animate-slideDown">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Sales Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize sales performance and trends across all branches
              </p>
            </div>

            {/* Tenant ID Input - Enhanced */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tenant ID</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tenantIdInput}
                    onChange={(e) => setTenantIdInput(Number(e.target.value))}
                    min="1"
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ID"
                  />
                  <button
                    onClick={() => { 
                      setTenantId(tenantIdInput); 
                      refetchOrders(tenantIdInput); 
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Load Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            
            </div>
          </div>

         
        </div>

        {/* Stats Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <span className="text-2xl text-purple-600 dark:text-purple-400">💰</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400 font-medium">+12.5%</span> from last month
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <span className="text-2xl text-blue-600 dark:text-blue-400">📦</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400 font-medium">{stats.completedOrders}</span> completed
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.avgOrderValue}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <span className="text-2xl text-green-600 dark:text-green-400">📊</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400 font-medium">+5.2%</span> growth
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <span className="text-2xl text-orange-600 dark:text-orange-400">👥</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400 font-medium">+8</span> new this month
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line Chart Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Sales Over Time</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly sales performance visualization</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                  {["sales", "orders"].map((chart) => (
                    <button
                      key={chart}
                      onClick={() => setActiveChart(chart)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                        activeChart === chart
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {chart === "sales" ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Sales
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Orders
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-72 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-right pr-2">
                    {activeChart === "sales" 
                      ? `$${(maxSalesValue * i/4).toFixed(0)}` 
                      : `${(maxOrdersValue * i/4).toFixed(0)}`}
                  </div>
                ))}
              </div>

              {/* Chart bars */}
              <div className="ml-12 h-full flex items-end">
                {lineData.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center mx-1 group">
                    <div className="w-full max-w-16 relative">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          activeChart === "sales" 
                            ? "bg-blue-500 hover:bg-blue-600" 
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                        style={{
                          height: `${activeChart === "sales" 
                            ? (item.sales / maxSalesValue) * 100 
                            : (item.orders / maxOrdersValue) * 100}%`,
                        }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {activeChart === "sales" ? `$${item.sales.toFixed(2)}` : `${item.orders} orders`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">{item.date}</span>
                  </div>
                ))}
              </div>

              {/* Grid lines */}
              <div className="absolute left-12 right-0 top-0 bottom-0 pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-700"
                    style={{ top: `${i * 25}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Chart legend */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Total Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Total Orders</span>
                  </div>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Showing {timeRange} data for {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </div>

          {/* Pie Chart Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Orders by Status</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Distribution of order statuses</p>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
            </div>

            {/* Pie Chart Visualization */}
            <div className="relative h-48 mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-gray-100 dark:border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                  </div>
                </div>
              </div>
              
              {/* Pie segments */}
              <div className="absolute inset-0">
                {pieData.reduce((acc, segment, idx) => {
                  const startAngle = acc;
                  const angle = (segment.value / 100) * 360;
                  const endAngle = startAngle + angle;
                  
                  if (segment.value > 0) {
                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (endAngle - 90) * (Math.PI / 180);
                    
                    const x1 = 100 + 80 * Math.cos(startRad);
                    const y1 = 100 + 80 * Math.sin(startRad);
                    const x2 = 100 + 80 * Math.cos(endRad);
                    const y2 = 100 + 80 * Math.sin(endRad);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    const pathData = [
                      `M 100 100`,
                      `L ${x1} ${y1}`,
                      `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                      `Z`
                    ].join(' ');
                    
                    return (
                      <svg key={idx} className="absolute inset-0" viewBox="0 0 200 200">
                        <path d={pathData} fill={segment.color} opacity="0.8" />
                      </svg>
                    );
                  }
                  return endAngle;
                }, 0)}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="space-y-3">
              {pieData.map((status, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{status.status}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{status.count} orders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">{status.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Footer */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sales Activity</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View all →
            </button>
          </div>
          
          <div className="space-y-3">
            {orders.slice(0, 3).map((order, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    order.status === "1" ? "bg-green-100 dark:bg-green-900/30" :
                    order.status === "0" ? "bg-orange-100 dark:bg-orange-900/30" :
                    "bg-gray-100 dark:bg-gray-700"
                  }`}>
                    <svg className={`w-5 h-5 ${
                      order.status === "1" ? "text-green-600 dark:text-green-400" :
                      order.status === "0" ? "text-orange-600 dark:text-orange-400" :
                      "text-gray-600 dark:text-gray-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Order #{order.id || idx + 1000}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ${order.totalAmount?.toFixed(2) || "0.00"} • {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === "1" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                  order.status === "0" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
                  "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }`}>
                  {order.status === "1" ? "Completed" : order.status === "0" ? "Pending" : "Processing"}
                </span>
              </div>
            ))}
            
            {orders.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No recent sales activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;