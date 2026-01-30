import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useCustomers from "@/Hooks/useCustomers";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerStatementMutation } = useCustomers();

  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("transactions");
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getCustomerStatementMutation.mutate(+id, {
      onSuccess: (data) => {
        setCustomer(data.customer);
        setTransactions(data.transactions || []);
        setLoading(false);
        toast.success("Customer details loaded");
      },
      onError: () => {
        setLoading(false);
        toast.error("Failed to load customer details");
      },
    });
  }, [id]);

  const totalDebit = useMemo(
    () => transactions.reduce((sum, t) => sum + (t.debit || 0), 0),
    [transactions],
  );

  const totalCredit = useMemo(
    () => transactions.reduce((sum, t) => sum + (t.credit || 0), 0),
    [transactions],
  );

  const balanceAfterTransaction = useMemo(() => {
    let balance = 0;
    return transactions
      .map((transaction) => {
        if (transaction.type === "invoice" || transaction.debit) {
          balance -= transaction.debit || 0;
        } else {
          balance += transaction.credit || 0;
        }
        return { ...transaction, runningBalance: balance };
      })
      .reverse();
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary dark:border-dark-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="card text-center p-6 md:p-8 max-w-md w-full">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 dark:bg-dark-secondary/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-secondary dark:text-dark-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-light mb-2">
            Customer Not Found
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">
            The customer you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/erp/sales/customers")}
            className="btn-primary w-full py-3"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const customerTypeColor = customer.type === "premium" ? "warning" : "primary";
  const initials = customer.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // Get color class for badges
  const getColorClass = (type) => {
    if (type === "premium") {
      return "bg-warning/10 dark:bg-dark-warning/20 text-warning dark:text-dark-warning";
    }
    return "bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary";
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <button
              onClick={() => navigate("/erp/sales/customers")}
              className="flex items-center gap-1 md:gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors group self-start"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="hidden sm:inline">Back to Customers</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${getColorClass(customer.type)}`}
              >
                {customer.type === "premium"
                  ? "Premium Customer"
                  : "Regular Customer"}
              </div>
              <button
                onClick={() => navigate(`/erp/sales/customers/${id}/edit`)}
                className="btn-primary flex items-center gap-1 md:gap-2 text-xs md:text-sm py-1.5 md:py-2 px-3 md:px-4"
              >
                <svg
                  className="w-3 h-3 md:w-4 md:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="hidden sm:inline">Edit Customer</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>
          </div>

          {/* Customer Profile */}
          <div className="card rounded-xl md:rounded-2xl shadow-card dark:shadow-card-dark p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
              {/* Customer Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                  <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-light mb-1 md:mb-2 truncate">
                      {customer.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        ID:{" "}
                        <span className="font-semibold text-primary dark:text-dark-primary">
                          #{customer.id}
                        </span>
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Balance:{" "}
                        <span
                          className={`font-semibold ${customer.currentBalance >= 0 ? "text-success dark:text-dark-success" : "text-red-600 dark:text-red-400"}`}
                        >
                          {customer.currentBalance} EGP
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-right">
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Credit Limit
                      </div>
                      <div className="text-base md:text-lg font-bold text-gray-800 dark:text-light">
                        {customer.creditLimit || 0} EGP
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Mobile Stacked, Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="card rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                  Current Balance
                </div>
                <div
                  className={`text-lg md:text-xl lg:text-2xl font-bold ${customer.currentBalance >= 0 ? "text-success dark:text-dark-success" : "text-red-600 dark:text-red-400"}`}
                >
                  {customer.currentBalance} EGP
                </div>
              </div>
              <div
                className={`p-2 md:p-3 rounded-lg md:rounded-xl ml-2 ${customer.currentBalance >= 0 ? "bg-success/10 dark:bg-dark-success/20 text-success dark:text-dark-success" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                  Total Debit
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
                  {totalDebit} EGP
                </div>
              </div>
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 ml-2">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                  Total Credit
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-success dark:text-dark-success">
                  {totalCredit} EGP
                </div>
              </div>
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-success/10 dark:bg-dark-success/20 text-success dark:text-dark-success ml-2">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                  Credit Limit
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-primary dark:text-dark-primary">
                  {customer.creditLimit || 0} EGP
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  Available:{" "}
                  {Math.max(
                    0,
                    (customer.creditLimit || 0) - customer.currentBalance,
                  )}{" "}
                  EGP
                </div>
              </div>
              <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary ml-2">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Responsive */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6">
          <nav className="flex space-x-3 md:space-x-4 lg:space-x-8 overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-2 md:py-3 lg:py-4 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex items-center ${
                activeTab === "transactions"
                  ? "border-primary text-primary dark:border-dark-primary dark:text-dark-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <svg
                className="w-3 h-3 md:w-4 md:h-4 inline-block mr-1 md:mr-2"
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
              <span className="hidden sm:inline">Account Statement</span>
              <span className="sm:hidden">Statement</span>
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`py-2 md:py-3 lg:py-4 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex items-center ${
                activeTab === "info"
                  ? "border-primary text-primary dark:border-dark-primary dark:text-dark-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <svg
                className="w-3 h-3 md:w-4 md:h-4 inline-block mr-1 md:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">Customer Info</span>
              <span className="sm:hidden">Info</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "transactions" && (
          <div className="card rounded-xl md:rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-light">
                    Transaction History
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {transactions.length} transaction
                    {transactions.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-success"></div>
                    <span>Credit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500"></div>
                    <span>Debit</span>
                  </div>
                </div>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="p-6 md:p-8 lg:p-12 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-gray-400"
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
                <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Transactions
                </h3>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                  This customer hasn't made any transactions yet.
                </p>
              </div>
            ) : isMobile ? (
              // Mobile Card View
              <div className="p-4 space-y-4">
                {balanceAfterTransaction.map((transaction, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-dark-card rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-light">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                          transaction.type === "invoice" || transaction.debit
                            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                            : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        }`}
                      >
                        {transaction.type
                          ? transaction.type.toUpperCase()
                          : "PAYMENT"}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-800 dark:text-light truncate">
                        {transaction.description || "Transaction"}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Debit
                        </div>
                        <div
                          className={`text-sm font-medium ${transaction.debit ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}
                        >
                          {transaction.debit ? `${transaction.debit} EGP` : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Credit
                        </div>
                        <div
                          className={`text-sm font-medium ${transaction.credit ? "text-success dark:text-dark-success" : "text-gray-400"}`}
                        >
                          {transaction.credit
                            ? `${transaction.credit} EGP`
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Balance
                        </div>
                        <div
                          className={`text-sm font-semibold ${transaction.runningBalance >= 0 ? "text-success dark:text-dark-success" : "text-red-600 dark:text-red-400"}`}
                        >
                          {transaction.runningBalance} EGP
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop Table View
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-3 md:px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="py-3 px-3 md:px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="py-3 px-3 md:px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="py-3 px-3 md:px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="py-3 px-3 md:px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Credit
                      </th>
                      <th className="py-3 px-3 md:px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {balanceAfterTransaction.map((transaction, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-3 md:px-4">
                          <div className="text-sm text-gray-800 dark:text-light">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-3 md:px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === "invoice" ||
                              transaction.debit
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            }`}
                          >
                            {transaction.type
                              ? transaction.type.toUpperCase()
                              : "PAYMENT"}
                          </span>
                        </td>
                        <td className="py-3 px-3 md:px-4">
                          <div className="text-sm text-gray-800 dark:text-light truncate max-w-xs">
                            {transaction.description || "Transaction"}
                          </div>
                        </td>
                        <td className="py-3 px-3 md:px-4">
                          {transaction.debit ? (
                            <div className="text-sm font-medium text-red-600 dark:text-red-400">
                              {transaction.debit} EGP
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">-</div>
                          )}
                        </td>
                        <td className="py-3 px-3 md:px-4">
                          {transaction.credit ? (
                            <div className="text-sm font-medium text-success dark:text-dark-success">
                              {transaction.credit} EGP
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">-</div>
                          )}
                        </td>
                        <td className="py-3 px-3 md:px-4">
                          <div
                            className={`text-sm font-semibold ${transaction.runningBalance >= 0 ? "text-success dark:text-dark-success" : "text-red-600 dark:text-red-400"}`}
                          >
                            {transaction.runningBalance} EGP
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "info" && (
          <div className="card rounded-xl md:rounded-2xl shadow-card dark:shadow-card-dark p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-light mb-3 md:mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Phone Number
                      </div>
                      <div className="font-medium text-gray-800 dark:text-light text-sm md:text-base">
                        {customer.phone || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Email Address
                      </div>
                      <div className="font-medium text-gray-800 dark:text-light text-sm md:text-base">
                        {customer.email || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Billing Address
                      </div>
                      <div className="font-medium text-gray-800 dark:text-light text-sm md:text-base whitespace-pre-line break-words">
                        {customer.address || "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-light mb-3 md:mb-4">
                    Financial Information
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Tax ID / National ID
                      </div>
                      <div className="font-medium text-gray-800 dark:text-light text-sm md:text-base">
                        {customer.taxId || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Customer Type
                      </div>
                      <div className="font-medium text-gray-800 dark:text-light text-sm md:text-base">
                        {customer.type === "premium"
                          ? "Premium / VIP"
                          : "Regular"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Account Status
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${customer.currentBalance < (customer.creditLimit || 0) * 0.8 ? "bg-success" : "bg-warning"}`}
                        ></div>
                        <span className="font-medium text-gray-800 dark:text-light text-sm md:text-base">
                          {customer.currentBalance <
                          (customer.creditLimit || 0) * 0.8
                            ? "Active - Good Standing"
                            : "Warning - High Utilization"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
