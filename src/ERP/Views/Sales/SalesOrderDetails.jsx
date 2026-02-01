import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSales from "@/Hooks/useSales";
import Loader from "@/Components/Global/Loader";
import { message, Modal } from "antd";

// Status mapping for display and colors
const statusMap = {
  Pending: "Pending",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Ready: "Ready",
  Preparing: "Preparing",
  Confirmed: "Confirmed",
};

const statusColors = {
  Pending: {
    text: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  Completed: {
    text: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  Cancelled: {
    text: "text-red-600",
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
  Ready: {
    text: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  Preparing: {
    text: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-200 dark:border-purple-800",
    dot: "bg-purple-500",
  },
  Confirmed: {
    text: "text-teal-600",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    border: "border-teal-200 dark:border-teal-800",
    dot: "bg-teal-500",
  },
};

const SalesOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const { getOrderByIdQuery, updateOrderMutation, cancelOrderMutation } = useSales();

  // States
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch order
  const {
    data: orderResponse,
    isLoading,
    error,
  } = getOrderByIdQuery(Number(id));
  const order = orderResponse?.data;

  // Update states after order loads
  useEffect(() => {
    if (order) {
      setNewStatus(order.status || "Pending");
      setPaidAmount(order.paidAmount || 0);
      setPaymentMethod(order.paymentMethod || "Cash");
    }
  }, [order]);

  // Format currency
  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(num || 0));

  // Format date
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  // Format date only (without time)
  const formatDateOnly = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Calculate totals
  const subtotal =
    order?.items?.reduce(
      (sum, item) => sum + Number(item.totalPrice || 0),
      0,
    ) || 0;
  const taxAmount = order?.taxAmount || subtotal * 0.14;
  const discountAmount = order?.discountAmount || 0;
  const totalAmount = subtotal + taxAmount - discountAmount;
  const changeDue = (order?.paidAmount || 0) - totalAmount;

  const statusLabel = statusMap[order?.status] || "Pending";
  const statusColor = statusColors[statusLabel] || statusColors["Pending"];

  // Get order type display
  const getOrderTypeDisplay = (type) => {
    switch (type) {
      case "DineIn": return "Dine In";
      case "TakeAway": return "Take Away";
      case "Delivery": return "Delivery";
      default: return type || "N/A";
    }
  };

  // Get payment method display
  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case "Cash": return "Cash";
      case "Card": return "Card";
      case "Mobile": return "Mobile Payment";
      default: return method || "Cash";
    }
  };

  // Update Order
  const handleUpdateOrder = () => {
    if (!order) return;
    
    setIsUpdating(true);
    updateOrderMutation.mutate(
      {
        orderId: order.id,
        newStatus,
        paidAmount,
        newDetails: [],
      },
      {
        onSuccess: () => {
          message.success("Order updated successfully!");
          setIsUpdating(false);
        },
        onError: () => {
          message.error("Failed to update order.");
          setIsUpdating(false);
        },
      }
    );
  };

  // Cancel Order
  const handleCancelOrder = () => {
    if (!order || !cancelReason.trim()) {
      return message.warning("Please provide a reason for cancellation");
    }

    cancelOrderMutation.mutate(
      {
        id: order.id,
        reason: cancelReason,
      },
      {
        onSuccess: () => {
          message.success("Order cancelled successfully!");
          setShowCancelModal(false);
          setTimeout(() => navigate(-1), 1500);
        },
        onError: () => {
          message.error("Failed to cancel order.");
          setShowCancelModal(false);
        },
      }
    );
  };

  // Open cancel confirmation modal
  const confirmCancel = () => {
    if (order?.status === "Cancelled") {
      message.warning("Order is already cancelled.");
      return;
    }
    if (order?.status === "Completed") {
      Modal.confirm({
        title: "Confirm Cancellation",
        content: "This order is already completed. Are you sure you want to cancel it?",
        okText: "Yes, Cancel",
        okType: "danger",
        cancelText: "No",
        onOk: () => setShowCancelModal(true),
      });
    } else {
      setShowCancelModal(true);
    }
  };

  // Handle print with better formatting
  const handlePrint = () => {
    if (!order) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.id}</title>
        <style>
          @media print { 
            @page { 
              margin: 15px; 
              size: A4 portrait; 
            } 
            body { 
              font-family: 'Arial', sans-serif; 
              color: #333; 
              margin: 0; 
              padding: 20px; 
              font-size: 14px;
            } 
            .invoice { 
              max-width: 800px; 
              margin: 0 auto; 
              border: 1px solid #ddd; 
              padding: 25px;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #4f46e5;
              margin-bottom: 5px;
            }
            .company-address {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            .invoice-title {
              font-size: 20px;
              font-weight: bold;
              margin: 10px 0;
              color: #333;
            }
            .order-info {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
              padding: 15px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .info-item {
              flex: 1;
            }
            .info-label {
              font-size: 11px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 3px;
            }
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: #333;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 25px 0; 
            } 
            th { 
              background: #4f46e5; 
              color: white; 
              font-weight: bold;
              padding: 12px 8px;
              text-align: left;
              font-size: 12px;
              text-transform: uppercase;
            }
            td { 
              border: 1px solid #e5e7eb; 
              padding: 10px 8px; 
              font-size: 13px;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { 
              font-weight: bold; 
              font-size: 15px; 
              background: #f9fafb;
            }
            .summary { 
              margin-top: 30px;
              width: 300px;
              margin-left: auto;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .grand-total {
              font-size: 18px;
              font-weight: bold;
              color: #4f46e5;
              border-top: 2px solid #4f46e5;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              background: ${statusLabel === "Completed" ? "#d1fae5" : statusLabel === "Cancelled" ? "#fee2e2" : "#fef3c7"};
              color: ${statusLabel === "Completed" ? "#065f46" : statusLabel === "Cancelled" ? "#991b1b" : "#92400e"};
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="company-name">RESTAURANT POS SYSTEM</div>
            <div class="company-address">123 Business Street, Cairo, Egypt | Phone: +20 100 123 4567</div>
            <div class="invoice-title">INVOICE #${order.id}</div>
            <div style="font-size: 12px; color: #666;">Date: ${formatDate(order.createdAt)}</div>
          </div>

          <div class="order-info">
            <div class="info-item">
              <div class="info-label">Order Type</div>
              <div class="info-value">${getOrderTypeDisplay(order.orderType)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value"><span class="status-badge">${statusLabel}</span></div>
            </div>
            <div class="info-item">
              <div class="info-label">Customer</div>
              <div class="info-value">Walking Customer</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                order.items?.length
                  ? order.items
                      .map(
                        (item, index) => `
                        <tr>
                          <td>${index + 1}</td>
                          <td>${item.notes || "Item #" + item.itemId}</td>
                          <td class="text-right">${item.quantity || 1}</td>
                          <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                          <td class="text-right">${formatCurrency(item.totalPrice)}</td>
                        </tr>`
                      )
                      .join("")
                  : `<tr><td colspan="5" class="text-center">No items found</td></tr>`
              }
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Tax (14%):</span>
              <span>${formatCurrency(taxAmount)}</span>
            </div>
            ${
              discountAmount > 0
                ? `<div class="summary-row">
                    <span>Discount:</span>
                    <span>-${formatCurrency(discountAmount)}</span>
                   </div>`
                : ""
            }
            <div class="summary-row grand-total">
              <span>TOTAL:</span>
              <span>${formatCurrency(totalAmount)}</span>
            </div>
            <div class="summary-row">
              <span>Paid Amount:</span>
              <span>${formatCurrency(order.paidAmount || 0)}</span>
            </div>
            <div class="summary-row">
              <span>Change Due:</span>
              <span>${formatCurrency(changeDue)}</span>
            </div>
          </div>

          <div class="footer">
            Thank you for your business!<br>
            This is a computer-generated invoice and does not require a signature.
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => printWindow.close(), 100);
    }, 300);
  };

  // Status timeline
  const statusHistory = [
    { status: "Pending", date: order?.createdAt, icon: "⏳" },
    { status: "Confirmed", date: order?.confirmedAt, icon: "✅" },
    { status: "Preparing", date: order?.preparingAt, icon: "👨‍🍳" },
    { status: "Ready", date: order?.readyAt, icon: "📦" },
    { status: "Completed", date: order?.completedAt, icon: "🏁" },
  ];

  // Loading & error states
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <Loader />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading order details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.282 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Failed to Load Order</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Could not load order #{id}. Please try again.</p>
          <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2">
            ← Back to Orders
          </button>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 max-w-md text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">Order Not Found</h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">No order found with ID #{id}</p>
          <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2">
            ← Back to Orders
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-3 sm:p-4 md:p-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="card mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-primary dark:text-dark-primary hover:text-primary-dark dark:hover:text-dark-primary-dark flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 dark:hover:bg-dark-primary/10 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Orders</span>
            </button>

            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">
                  Order #<span className="text-primary dark:text-dark-primary">{order.id}</span>
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusColor.dot}`}></span>
                    {statusLabel}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                    {formatDateOnly(order.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Order Type: <span className="font-medium text-dark dark:text-light">{getOrderTypeDisplay(order.orderType)}</span></span>
                <span className="hidden sm:inline">•</span>
                <span>Tenant: <span className="font-medium">{order.tenantId || "N/A"}</span></span>
                <span>Branch: <span className="font-medium">{order.branchId || "N/A"}</span></span>
                <span className="hidden sm:inline">•</span>
                <span>User: <span className="font-medium">{order.createdByUserId || "N/A"}</span></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
            <button
              onClick={handlePrint}
              className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 hover:shadow-md transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Invoice
            </button>
            
            {order.status !== "Cancelled" && order.status !== "Completed" && (
              <button
                onClick={() => navigate(`/pos?orderId=${order.id}`)}
                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Order
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column: Order Items (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-dark dark:text-light flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Order Items ({order.items?.length || 0})
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(order.createdAt)}
              </span>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={item.itemId || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary dark:text-dark-primary">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-dark dark:text-light">
                                {item.notes || `Item #${item.itemId}`}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                ID: #{item.itemId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md font-medium">
                            {item.quantity}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-bold text-primary dark:text-dark-primary">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                          <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p>No items found in this order</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-dark dark:text-light mb-4">Order Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Tax (14%)</span>
                    <span className="text-gray-500 dark:text-gray-400">{formatCurrency(taxAmount)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-dark dark:text-light">Total Amount</span>
                      <span className="text-xl font-bold text-primary dark:text-dark-primary">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                  
                  {order.paidAmount > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Paid Amount</span>
                        <span className="font-medium">{formatCurrency(order.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Change Due</span>
                        <span className={`font-bold ${changeDue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(changeDue)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes (if any) */}
          {order.notes && (
            <div className="card">
              <h3 className="text-lg font-bold text-dark dark:text-light mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Order Notes
              </h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Info & Actions */}
        <div className="space-y-6">
          {/* Order Status Timeline */}
          {/* <div className="card">
            <h3 className="text-lg font-bold text-dark dark:text-light mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Order Status Timeline
            </h3>
            <div className="space-y-3">
              {statusHistory.map((item, index) => (
                <div key={item.status} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${order.status === item.status ? statusColor.bg : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <span className={`text-sm ${order.status === item.status ? statusColor.text : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${order.status === item.status ? statusColor.text : 'text-gray-600 dark:text-gray-400'}`}>
                        {item.status}
                      </span>
                      {item.date && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDateOnly(item.date)}
                        </span>
                      )}
                    </div>
                    {index < statusHistory.length - 1 && (
                      <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 ml-4 mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Transaction Information */}
          <div className="card">
            <h3 className="text-lg font-bold text-dark dark:text-light mb-4">Transaction Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Type</div>
                  <div className="font-medium">{getOrderTypeDisplay(order.orderType)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method</div>
                  <div className="font-medium">{getPaymentMethodDisplay(paymentMethod)}</div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created By</div>
                <div className="font-medium">User #{order.createdByUserId}</div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created At</div>
                <div className="font-medium">{formatDate(order.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="card">
            <h3 className="text-lg font-bold text-dark dark:text-light mb-4">Order Actions</h3>
            <div className="space-y-4">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Update Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input w-full mb-3"
                  disabled={order.status === "Cancelled" || order.status === "Completed"}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleUpdateOrder}
                  disabled={order.status === newStatus || isUpdating || order.status === "Cancelled"}
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Status
                    </>
                  )}
                </button>
              </div>

              {/* Cancel Order */}
              {order.status !== "Cancelled" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cancel Order
                  </label>
                  <button
                    onClick={confirmCancel}
                    disabled={order.status === "Completed"}
                    className="btn-danger w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Order
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate('/pos')}
                    className="btn-secondary py-2 text-sm flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Order
                  </button>
                  <button
                    onClick={handlePrint}
                    className="btn-secondary py-2 text-sm flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        title="Cancel Order"
        open={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        footer={[
          <button key="cancel" onClick={() => setShowCancelModal(false)} className="btn-secondary px-4 py-2">
            Cancel
          </button>,
          <button key="submit" onClick={handleCancelOrder} className="btn-danger px-4 py-2 ml-2">
            Confirm Cancellation
          </button>,
        ]}
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.282 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-bold">Warning: This action cannot be undone.</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Order #{order.id} will be marked as cancelled. Please provide a reason for cancellation.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Cancellation *
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter the reason for cancelling this order..."
              className="input w-full min-h-[100px]"
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesOrderDetails;