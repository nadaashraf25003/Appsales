import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useCustomers from "@/Hooks/useCustomers";

const CustomersList = () => {
  const navigate = useNavigate();
  const { getAllCustomersQuery, deleteCustomerMutation } = useCustomers();
  
  const {
    data: customers,
    isLoading,
    isError,
    refetch,
  } = getAllCustomersQuery();

  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    customer: null,
  });
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'overdue'

  const filteredData = customers?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.taxId || "").includes(search),
  );
// console.log('Filtered Data:', filteredData);
  // Filter by status
  const filteredByStatus = filteredData?.filter((customer) => {
    if (statusFilter === "active")
      return customer.currentBalance < (customer.creditLimit || 0) * 0.8;
    if (statusFilter === "overdue")
      return customer.currentBalance >= (customer.creditLimit || 0);
    return true;
  });

  const handleDelete = () => {
    if (!deleteModal.customer) return;

    deleteCustomerMutation.mutate(deleteModal.customer.id, {
      onSuccess: () => {
        toast.success(
          `Customer "${deleteModal.customer.name}" deleted successfully`,
        );
        refetch();
        setDeleteModal({ show: false, customer: null });
      },
      onError: () => {
        toast.error("Failed to delete customer");
        setDeleteModal({ show: false, customer: null });
      },
    });
  };

  const showDeleteConfirm = (customer) => {
    setDeleteModal({ show: true, customer });
  };

  const getBalanceStatus = (balance, creditLimit = 0) => {
    if (balance >= creditLimit)
      return {
        text: "Overdue",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: "⚠️",
      };
    if (balance >= creditLimit * 0.8)
      return {
        text: "Warning",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        icon: "⚠️",
      };
    return {
      text: "Active",
      color:
        "bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success",
      icon: "✓",
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary dark:border-dark-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading customers...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="card text-center p-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-secondary/10 dark:bg-dark-secondary/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-secondary dark:text-dark-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-light mb-2">
            Failed to Load
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to load customer data. Please try again.
          </p>
          <button onClick={() => refetch()} className="btn-primary w-full">
            Retry
          </button>
        </div>
      </div>
    );
  }
const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;

const allowedRoles = ["SuperAdmin", "TenantOwner", "BranchManager"];

const hasAccess =
  user && allowedRoles.includes(user.role);
  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-light mb-2">
                Customer Directory
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all your customers, view balances, and track transactions
              </p>
            </div>
             <button
              onClick={() => navigate('/erp/sales/customers/add')}
              className="btn-primary flex items-center gap-2 text-sm md:text-base py-3 px-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Customer
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full"
                placeholder="Search by name, phone, email, or ID..."
              />
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input py-2.5 px-4"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-800 dark:text-light">
                {filteredByStatus?.length || 0}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800 dark:text-light">
                {customers?.length || 0}
              </span>{" "}
              customers
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
          {filteredByStatus?.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Customers Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {search
                  ? "Try adjusting your search terms"
                  : "No customers available. Add your first customer to get started."}
              </p>
              {!search && (
                <button
                  onClick={() => navigate("/erp/sales/customers/add")}
                  className="btn-primary inline-flex items-center gap-2"
                >
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add First Customer
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      {/* <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Balance
                      </th> */}
                   
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredByStatus?.map((customer) => {
                      const balanceStatus = getBalanceStatus(
                        customer.currentBalance,
                        customer.creditLimit,
                      );
                      return (
                        <tr
                          key={customer.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                           <td className="py-4 px-6">
                            <div className="text-sm text-gray-800 dark:text-light">
                              {customer.id || "No ID"}
                            </div>
                           
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-primary dark:text-dark-primary font-semibold">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 dark:text-light">
                                  {customer.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {customer.id}
                                </div>
                              </div>
                            </div>
                          </td>
                         
                          {/* <td className="py-4 px-6">
                            <div
                              className={`font-bold ${customer.currentBalance >= 0 ? "text-success dark:text-dark-success" : "text-red-600 dark:text-red-400"}`}
                            >
                              {customer.currentBalance} EGP
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Limit: {customer.creditLimit || 0} EGP
                            </div>
                          </td> */}
                        
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                customer.type === "premium"
                                  ? "bg-warning/10 text-warning dark:bg-dark-warning/20 dark:text-dark-warning"
                                  : "bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary"
                              }`}
                            >
                              {customer.type === "premium"
                                ? "Premium"
                                : "Regular"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/erp/sales/customers/${customer.id}`,
                                  )
                                }
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="View Details"
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              {hasAccess && (
                                <>
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/erp/sales/customers/${customer.id}/edit`,
                                      )
                                    }
                                    className="p-2 rounded-lg bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary hover:bg-primary/20 dark:hover:bg-dark-primary/30 transition-colors"
                                    title="Edit"
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
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => showDeleteConfirm(customer)}
                                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                                    title="Delete"
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden p-4 space-y-4">
                {filteredByStatus?.map((customer) => {
                  const balanceStatus = getBalanceStatus(
                    customer.currentBalance,
                    customer.creditLimit,
                  );
                  return (
                    <div
                      key={customer.id}
                      className="bg-gray-50 dark:bg-dark-card rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center mr-3">
                            <span className="text-primary dark:text-dark-primary font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-light">
                              {customer.name}
                            </h4>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {customer.id}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${balanceStatus.color}`}
                        >
                          {balanceStatus.icon} {balanceStatus.text}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Phone
                          </div>
                          <div className="text-sm text-gray-800 dark:text-light">
                            {customer.phone || "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Balance
                          </div>
                          <div
                            className={`text-sm font-bold ${customer.currentBalance >= 0 ? "text-success dark:text-dark-success" : "text-red-600 dark:text-red-400"}`}
                          >
                            {customer.currentBalance} EGP
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            customer.type === "premium"
                              ? "bg-warning/10 text-warning dark:bg-dark-warning/20 dark:text-dark-warning"
                              : "bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary"
                          }`}
                        >
                          {customer.type === "premium" ? "Premium" : "Regular"}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/erp/sales/customers/${customer.id}`)
                            }
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            title="View"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          {hasAccess && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/erp/sales/customers/${customer.id}/edit`,
                                  )
                                }
                                className="p-2 rounded-lg bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary"
                                title="Edit"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => showDeleteConfirm(customer)}
                                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                title="Delete"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.customer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-black/70 z-50 animate-slideDown p-4">
          <div className="card max-w-md w-full mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 dark:bg-dark-secondary/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-secondary dark:text-dark-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-light mb-2">
                Delete Customer
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-primary dark:text-dark-primary">
                  {deleteModal.customer.name}
                </span>
                ?
              </p>
              <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    This action cannot be undone. All customer data including
                    transactions will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, customer: null })}
                className="px-6 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                disabled={deleteCustomerMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteCustomerMutation.isPending}
                className="btn-secondary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteCustomerMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Deleting...
                  </span>
                ) : (
                  "Delete Customer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;
