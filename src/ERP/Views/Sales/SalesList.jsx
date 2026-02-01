import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSales from "@/Hooks/useSales";
import Loader from "@/Components/Global/Loader";
import * as XLSX from "xlsx";

const SalesList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Tenant ID State
  const [inputTenantId, setInputTenantId] = useState("");
  const [tenantId, setTenantId] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.tenantId || 1;
  });

  const { getOrdersByTenantQuery } = useSales();
  const {
    data: orders,
    isLoading,
    refetch,
    isFetching,
  } = getOrdersByTenantQuery(tenantId);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize tenant input
  useEffect(() => {
    setInputTenantId(tenantId.toString());
  }, [tenantId]);

  // Handle tenant change
  const handleTenantChange = () => {
    const newTenantId = parseInt(inputTenantId);
    if (newTenantId > 0) {
      setTenantId(newTenantId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTenantChange();
    }
  };

  // Calculate stats
const stats = useMemo(() => {
  if (!orders?.data)
    return { total: 0, totalRevenue: 0, pending: 0, completed: 0 };

  const filtered = orders.data.filter((order) => {
    const matchesId = order.id.toString().includes(searchText);
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const orderDate = new Date(order.createdAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = orderDate >= startDate && orderDate <= endDate;
    }

    return matchesId && matchesStatus && matchesDate;
  });

  return {
    total: filtered.length,
    totalRevenue: filtered.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    ),
    pending: filtered.filter(o => o.status === "Pending").length,
    completed: filtered.filter(o => o.status === "Completed").length,
  };
}, [orders, searchText, statusFilter, dateRange]);

  // Filter orders
 const filteredOrders = useMemo(() => {
  if (!orders?.data) return [];

  return orders.data
    .map((order) => ({
      ...order,
      date: order.createdAt,
      items: new Array(order.itemCount || 0).fill({}),
      status: order.status, // ✅ USE BACKEND VALUE
    }))
    .filter((order) => {
      const matchesId = order.id.toString().includes(searchText);
      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const orderDate = new Date(order.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        matchesDate = orderDate >= startDate && orderDate <= endDate;
      }

      return matchesId && matchesStatus && matchesDate;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}, [orders, searchText, statusFilter, dateRange]);

  // Format currency for Excel
  const formatCurrencyForExcel = (num) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // Format currency for display
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format date for Excel
  const formatDateForExcel = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Export to Excel function
  const exportToExcel = () => {
    try {
      setExporting(true);

      if (!filteredOrders.length) {
        alert("No data to export!");
        setExporting(false);
        return;
      }

      // Prepare data for Excel
      const excelData = filteredOrders.map((order) => ({
        "Order ID": order.id,
        "Customer ID": order.customerId || "N/A",
        Date: formatDateForExcel(order.date),
        "Branch ID": order.branchId || "N/A",
        "Tenant ID": order.tenantId || "N/A",
        "Items Count": order.itemCount || 0,
        Subtotal: formatCurrencyForExcel(order.subtotal),
        "Tax Amount": formatCurrencyForExcel(order.taxAmount),
        Discount: formatCurrencyForExcel(order.discountAmount),
        "Total Amount": formatCurrencyForExcel(order.totalAmount),
        "Paid Amount": formatCurrencyForExcel(order.paidAmount),
        Status: order.status,
        "Order Type": order.orderType || "N/A",
        Notes: order.notes || "",
      }));

      // Add summary row
      const summaryRow = {
        "Order ID": "SUMMARY",
        "Customer ID": "",
        Date: "",
        "Branch ID": "",
        "Tenant ID": "",
        "Items Count": filteredOrders.reduce(
          (sum, order) => sum + (order.itemCount || 0),
          0,
        ),
        Subtotal: formatCurrencyForExcel(
          filteredOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0),
        ),
        "Tax Amount": formatCurrencyForExcel(
          filteredOrders.reduce(
            (sum, order) => sum + (order.taxAmount || 0),
            0,
          ),
        ),
        Discount: formatCurrencyForExcel(
          filteredOrders.reduce(
            (sum, order) => sum + (order.discountAmount || 0),
            0,
          ),
        ),
        "Total Amount": formatCurrencyForExcel(
          filteredOrders.reduce(
            (sum, order) => sum + (order.totalAmount || 0),
            0,
          ),
        ),
        "Paid Amount": formatCurrencyForExcel(
          filteredOrders.reduce(
            (sum, order) => sum + (order.paidAmount || 0),
            0,
          ),
        ),
        Status: `Total Orders: ${filteredOrders.length}`,
        "Order Type": "",
        Notes: "",
      };

      const dataWithSummary = [...excelData, {}, summaryRow];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataWithSummary, {
        skipHeader: false,
      });

      // Auto-size columns
      const maxWidth = Object.keys(excelData[0] || {}).reduce((acc, key) => {
        acc[key] = Math.max(
          key.length,
          ...dataWithSummary.map((row) => String(row[key] || "").length),
        );
        return acc;
      }, {});

      ws["!cols"] = Object.values(maxWidth).map((width) => ({
        wch: Math.min(width + 2, 50),
      }));

      // Add styling for header row
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2D3748" } },
          alignment: { horizontal: "center" },
        };
      }

      // Style summary row
      const summaryRowIndex = dataWithSummary.length - 1;
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({
          r: summaryRowIndex,
          c: C,
        });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "3182CE" } },
          alignment: { horizontal: "center" },
        };
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Sales Orders");

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-");
      const fileName = `Sales_Orders_Tenant_${tenantId}_${timestamp}.xlsx`;

      // Export file
      XLSX.writeFile(wb, fileName);

      // Show success message
      setTimeout(() => {
        alert(`Excel file "${fileName}" has been downloaded successfully!`);
        setExporting(false);
      }, 500);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export Excel file. Please try again.");
      setExporting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText("");
    setDateRange({ start: "", end: "" });
    setStatusFilter("All");
  };

  // Get status badge
const getStatusBadge = (status) => {
  const config = {
    Pending: { color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200", label: "PENDING" },
    Confirmed: { color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", label: "CONFIRMED" },
    Preparing: { color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200", label: "PREPARING" },
    Ready: { color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200", label: "READY" },
    Completed: { color: "text-green-600", bg: "bg-green-100", border: "border-green-200", label: "COMPLETED" },
    Canceled: { color: "text-red-600", bg: "bg-red-100", border: "border-red-200", label: "CANCELED" },
  };

  return config[status] || {
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
    label: status || "UNKNOWN",
  };
};


  // Status options
const statusOptions = [
  { value: "All", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Preparing", label: "Preparing" },
  { value: "Ready", label: "Ready" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Canceled" },
];


  if (isLoading) return <Loader />;

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 animate-fadeIn max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">
              Sales Orders
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and manage all transactions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Tenant ID Control */}
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={inputTenantId}
                onChange={(e) => setInputTenantId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input text-sm w-32"
                placeholder="Tenant ID"
                aria-label="Tenant ID"
              />
              <button
                onClick={handleTenantChange}
                className="btn-secondary px-3 py-2 text-sm whitespace-nowrap"
              >
                Load
              </button>
            </div>

            <button
              onClick={() => refetch()}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm md:text-base"
              disabled={isFetching}
            >
              {isFetching ? (
                <svg
                  className="animate-spin h-4 w-4"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Refresh
            </button>

            <button
              onClick={exportToExcel}
              disabled={exporting || filteredOrders.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/10 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="card p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Orders
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-dark dark:text-light">
            {stats.total}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Tenant #{tenantId}
          </div>
        </div>

        <div className="card p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Revenue
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Filtered revenue
          </div>
        </div>

        <div className="card p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            Pending
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pending}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Awaiting payment
          </div>
        </div>

        <div className="card p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            Completed
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Paid orders
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center justify-between w-full text-sm font-medium text-primary dark:text-dark-primary p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </span>
            <span className="text-xs bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary px-2 py-1 rounded">
              {isFilterOpen ? "▼" : "▶"}
            </span>
          </button>

          {/* Search & Filters */}
          <div
            className={`${isFilterOpen ? "block" : "hidden md:flex"} flex-1 flex-col md:flex-row gap-4 w-full`}
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search Order ID..."
                  className="input text-sm pl-10"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Date Range */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="input text-sm flex-1"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="input text-sm flex-1"
                  placeholder="End Date"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
              <button
                onClick={() => refetch()}
                className="btn-primary px-4 py-2 text-sm whitespace-nowrap"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        {isMobile ? (
          /* Mobile Cards View */
          <div className="space-y-3">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <div key={order.id} className="card p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-dark dark:text-light">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Customer ID: {order.customerId || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Date
                        </span>
                        <span className="text-sm font-medium">
                          {formatDate(order.date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Items
                        </span>
                        <span className="text-sm font-medium">
                          {order.items?.length || 0} items
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total
                        </span>
                        <span className="text-lg font-bold text-primary dark:text-dark-primary">
                          {formatCurrency(order.totalAmount || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() =>
                          navigate(`/erp/sales/orders/${order.id}`)
                        }
                        className="text-primary dark:text-dark-primary hover:underline text-sm font-medium flex items-center gap-2"
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
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card p-6 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg
                    className="w-12 h-12 mb-3 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-base font-medium mb-1">No orders found</p>
                  <p className="text-xs mb-4">
                    {searchText || dateRange.start || statusFilter !== "All"
                      ? "Try adjusting your filters"
                      : `No orders available for Tenant ${tenantId}`}
                  </p>
                  {(searchText ||
                    dateRange.start ||
                    statusFilter !== "All") && (
                    <button
                      onClick={clearFilters}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Customer ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-primary dark:text-dark-primary">
                            #{order.id}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {order.customerId || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {formatDate(order.date)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">
                            {order.items?.length || 0} items
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-lg font-bold text-primary dark:text-dark-primary">
                            {formatCurrency(order.totalAmount || 0)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              navigate(`/erp/sales/orders/${order.id}`)
                            }
                            className="text-primary dark:text-dark-primary hover:underline text-sm font-medium px-3 py-1 rounded hover:bg-primary/5 dark:hover:bg-dark-primary/10 flex items-center gap-2 ml-auto"
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
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 sm:py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg
                          className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">
                          No orders found
                        </p>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                          {searchText ||
                          dateRange.start ||
                          statusFilter !== "All"
                            ? "Try adjusting your filters"
                            : `No orders available for Tenant ${tenantId}`}
                        </p>
                        {(searchText ||
                          dateRange.start ||
                          statusFilter !== "All") && (
                          <button
                            onClick={clearFilters}
                            className="btn-primary px-4 sm:px-6 py-2 text-sm"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {filteredOrders.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold">{filteredOrders.length}</span>{" "}
                orders for Tenant #{tenantId}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue:{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesList;
