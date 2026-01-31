import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSales from '@/Hooks/useSales';
import Loader from '@/Components/Global/Loader';

const SalesOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const { getOrderByIdQuery } = useSales();
  const { data: orderResponse, isLoading, error } = getOrderByIdQuery(Number(id));

  const order = orderResponse?.data;

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate subtotal from items
  const calculateSubtotal = () => {
    if (!order?.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const subtotal = order ? calculateSubtotal() : 0;
  const taxAmount = order ? (order.taxAmount || subtotal * 0.14) : 0;
  const discountAmount = order?.discountAmount || 0;
  const totalAmount = subtotal + taxAmount - discountAmount;
  
  const statusLabel = order?.status === "1" ? "Paid" : "Pending";

  // Print function
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order #ORD-${order?.id} - Invoice</title>
        <style>
          @media print {
            @page {
              margin: 20px;
              size: A4 portrait;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #000;
              background: white;
              margin: 0;
              padding: 0;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print-only {
              display: block !important;
            }
            
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .invoice-header {
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            
            .company-info h1 {
              margin: 0;
              font-size: 28px;
              color: #333;
            }
            
            .company-info p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            
            .invoice-info {
              text-align: right;
            }
            
            .invoice-info h2 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            
            .invoice-info p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              background: ${order?.status === "1" ? "#d1fae5" : "#fef3c7"};
              color: ${order?.status === "1" ? "#065f46" : "#92400e"};
              border-radius: 20px;
              font-weight: 600;
              font-size: 14px;
              margin-top: 5px;
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .detail-section {
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            
            .detail-section h3 {
              margin: 0 0 15px 0;
              font-size: 16px;
              color: #333;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            
            .detail-item {
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
            }
            
            .detail-label {
              color: #666;
              font-size: 14px;
            }
            
            .detail-value {
              color: #000;
              font-weight: 600;
              font-size: 14px;
              text-align: right;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            
            .items-table th {
              background: #f9fafb;
              color: #374151;
              font-weight: 600;
              font-size: 14px;
              text-align: left;
              padding: 12px 16px;
              border: 1px solid #e5e7eb;
            }
            
            .items-table td {
              padding: 12px 16px;
              border: 1px solid #e5e7eb;
              font-size: 14px;
            }
            
            .items-table tr:nth-child(even) {
              background: #f9fafb;
            }
            
            .total-section {
              margin-top: 30px;
              margin-left: auto;
              max-width: 400px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .total-row.total {
              border-top: 2px solid #333;
              border-bottom: none;
              padding-top: 16px;
              margin-top: 8px;
              font-size: 20px;
              font-weight: bold;
            }
            
            .total-label {
              color: #666;
            }
            
            .total-value {
              color: #000;
              font-weight: 600;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #333;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            
            .barcode {
              margin-top: 30px;
              text-align: center;
              font-family: 'Libre Barcode 128', monospace;
              font-size: 40px;
              color: #000;
            }
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="company-info">
              <h1>ERP System</h1>
              <p>Sales Order Invoice</p>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="invoice-info">
              <h2>Order #ORD-${order?.id}</h2>
              <p>${formatDate(order?.createdAt)}</p>
              <div class="status-badge">${statusLabel.toUpperCase()}</div>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-section">
              <h3>Order Details</h3>
              <div class="detail-item">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">ORD-${order?.id}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formatDate(order?.createdAt)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${statusLabel}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Branch & Tenant</h3>
              <div class="detail-item">
                <span class="detail-label">Branch ID:</span>
                <span class="detail-value">${order?.branchId || "N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tenant ID:</span>
                <span class="detail-value">${order?.tenantId || "N/A"}</span>
              </div>
            </div>
          </div>
          
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order?.items && Array.isArray(order.items) && order.items.length > 0 
                ? order.items.map((item, index) => `
                  <tr>
                    <td>#${item.itemId || "N/A"}</td>
                    <td>${item.notes || "Unnamed Item"}</td>
                    <td>x ${item.quantity || 1}</td>
                    <td>${formatCurrency(item.unitPrice)}</td>
                    <td>${formatCurrency(item.totalPrice)}</td>
                  </tr>
                `).join('')
                : `
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                      No items found in this order
                    </td>
                  </tr>
                `
              }
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">${formatCurrency(subtotal)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax (VAT 14%):</span>
              <span class="total-value">${formatCurrency(taxAmount)}</span>
            </div>
            ${discountAmount > 0 ? `
              <div class="total-row">
                <span class="total-label">Discount:</span>
                <span class="total-value" style="color: #059669;">-${formatCurrency(discountAmount)}</span>
              </div>
            ` : ''}
            <div class="total-row total">
              <span class="total-label">Total Amount:</span>
              <span class="total-value">${formatCurrency(totalAmount)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>For any inquiries, please contact your branch administrator.</p>
            <div class="barcode">
              ORD${order?.id}${new Date(order?.createdAt).getTime()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark dark:text-light mb-2">
            Failed to Load Order Details
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Unable to fetch order #{id}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary px-6 py-2"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No Order Data Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Order #{id} does not exist or has been deleted
          </p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary px-6 py-2"
          >
            Go Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Status colors for UI display
  const statusColor = order.status === "1" 
    ? { text: "text-green-600", bg: "bg-green-100", border: "border-green-200" }
    : { text: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" };

  return (
    <div className="p-3 sm:p-4 md:p-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="card mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-primary dark:text-dark-primary hover:underline flex items-center gap-2 text-sm md:text-base mt-1 md:mt-0"
              aria-label="Go back"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden xs:inline">Back to Orders</span>
              <span className="xs:hidden">Back</span>
            </button>
            
            <div className="space-y-1">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-dark dark:text-light break-words">
                  Order #ORD-{order.id}
                </h1>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border} md:hidden`}>
                  {statusLabel}
                </span>
              </div>
              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Branch: {order.branchId || "N/A"}</span>
                <span className="hidden xs:inline">•</span>
                <span>Tenant: {order.tenantId || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 mt-2 md:mt-0">
            <span className={`hidden md:inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
              {statusLabel.toUpperCase()}
            </span>
            
            <button
              onClick={handlePrint}
              className="btn-primary px-3 py-2 text-sm sm:text-base whitespace-nowrap w-full xs:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden sm:inline">Print Invoice</span>
                <span className="sm:hidden">Print</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column: Order Items (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-bold text-dark dark:text-light mb-4">
              Order Items
            </h2>

            {/* Items Table */}
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full min-w-[500px] sm:min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      Unit Price
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={item.itemId || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          <div className="font-medium text-primary dark:text-dark-primary text-sm">
                            #{item.itemId || "N/A"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:hidden">
                            {item.notes || "Unnamed Item"}
                          </div>
                          <div className="text-sm hidden sm:block">{item.notes || "Unnamed Item"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 sm:hidden">
                            {formatCurrency(item.unitPrice)} each
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3">
                          <div className="text-sm font-medium">
                            x {item.quantity || 1}
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 hidden sm:table-cell">
                          <div className="text-sm">{formatCurrency(item.unitPrice)}</div>
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-right">
                          <div className="text-sm font-bold">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                        No items found in this order
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="mt-6 md:mt-8">
              <h3 className="text-lg font-bold text-dark dark:text-light mb-4">
                Order Summary
              </h3>
              
              <div className="max-w-md ml-auto">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span className="text-gray-600 dark:text-gray-400">Tax (VAT 14%)</span>
                    <span className="text-gray-500 dark:text-gray-400">{formatCurrency(taxAmount)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="text-green-600 dark:text-green-400">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-lg font-bold text-dark dark:text-light">Total Amount</span>
                      <span className="text-xl md:text-2xl font-bold text-primary dark:text-dark-primary">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction & Customer Info */}
        <div className="space-y-4 md:space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-dark dark:text-light mb-4">
              Transaction Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Status</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                      {statusLabel}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Date</div>
                    <div className="text-sm font-medium break-words">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tenant ID</div>
                    <div className="text-sm font-medium">{order.tenantId || "N/A"}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Branch ID</div>
                    <div className="text-sm font-medium">{order.branchId || "N/A"}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Customer Details
                </h3>
                
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div className="font-bold text-blue-800 dark:text-blue-300 text-sm sm:text-base">Walking Customer</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Generic Customer Profile</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 leading-relaxed">
                    No specific customer information was recorded for this order.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gray-900 dark:bg-gray-800 border-0">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-gray-200 mb-1">Print Note</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Click "Print Invoice" to generate a clean, printer-friendly version with all order details.
                  The printed invoice will open in a new window with proper formatting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetails;