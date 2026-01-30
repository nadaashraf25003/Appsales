import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "@/API/Config";
import Urls from "@/API/URLs";
import useTenants from "@/Hooks/useTenants";

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  currency: string;
  taxRate: number;
  isActive: boolean;
  createdAt: string;
  branchCount?: number;
  userCount?: number;
}

const TenantList = () => {
  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const { deleteTenantMutation } = useTenants();

  // React Query v5: use object syntax
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await api.get(Urls.TENANTS.GET_ALL);
      // console.log("tenants", res.data.data);
      return res.data.data;
    },
  });

  // Update local state when query data changes
  useEffect(() => {
    if (data) setTenants(data);
  }, [data]);
  // const handleDeactivate = async (id: number) => {
  //   if (!window.confirm("Are you sure you want to deactivate this tenant?"))
  //     return;

  //   try {
  //     const res = await deactivateTenantMutation.mutateAsync(id);
  //     console.log("Deactivate response:", res); // debug
  //     // Update local state instead of refetching (optional)
  //     setTenants((prev) =>
  //       prev.map((t) => (t.id === id ? { ...t, isActive: false } : t)),
  //     );
  //   } catch (error) {
  //     console.error("Failed to deactivate tenant:", error);
  //   }
  // };

  const handleActivate = async (id: number) => {
    if (!window.confirm("Are you sure you want to activate this tenant?"))
      return;

    try {
      // Note: You'll need to add an activateTenantMutation to your useTenants hook
      // For now, this is a placeholder
      console.log("Activate tenant:", id);
      refetch();
    } catch (error) {
      console.error("Failed to activate tenant:", error);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.phone?.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toString().includes(search);

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && t.isActive) ||
      (filterStatus === "inactive" && !t.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeTenants = tenants.filter((t) => t.isActive).length;
  const inactiveTenants = tenants.filter((t) => !t.isActive).length;

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-light mb-2">
              Tenant Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all tenant organizations in your ERP system
            </p>
          </div>
          <Link
            to="/erp/tenants/create"
            className="btn-primary flex items-center gap-2 px-6 py-3 mt-4 md:mt-0"
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
            Create New Tenant
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Tenants
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-light">
                  {isLoading ? "..." : tenants.length}
                </div>
              </div>
              <div className="text-primary dark:text-dark-primary">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Active
                </div>
                <div className="text-2xl font-bold text-success dark:text-dark-success">
                  {isLoading ? "..." : activeTenants}
                </div>
              </div>
              <div className="text-success dark:text-dark-success">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Inactive
                </div>
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {isLoading ? "..." : inactiveTenants}
                </div>
              </div>
              <div className="text-gray-400 dark:text-gray-600">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-light">
                  {isLoading ? "..." : filteredTenants.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  of {tenants.length}
                </div>
              </div>
              <div className="text-brand-info">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Tenants
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Filter
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "all"
                      ? "bg-primary text-white dark:bg-dark-primary"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                {/* <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'active'
                      ? 'bg-success text-white dark:bg-dark-success'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('inactive')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'inactive'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Inactive
                </button> */}
              </div>
            </div>

            {/* Export/Refresh */}
            <div className="flex items-end justify-end gap-2">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="btn-secondary flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tenants Table Card */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading tenants...
                </p>
              </div>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center p-12">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 dark:text-light mb-2">
                No tenants found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {search
                  ? "No tenants match your search criteria."
                  : "No tenants have been created yet."}
              </p>
              {!search && (
                <Link
                  to="/erp/tenants/create"
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
                  Create First Tenant
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-card">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tenant
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Contact
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Financial
                    </th>
                    {/* <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th> */}
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {tenant.logo ? (
                            <div className="w-10 h-10 bg-white dark:bg-dark-card rounded-lg flex items-center justify-center overflow-hidden">
                              <img
                                src={tenant.logo}
                                alt={`${tenant.name} logo`}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                  (
                                    e.target as HTMLImageElement
                                  ).parentElement!.innerHTML = `
                                    <div class="text-primary dark:text-dark-primary font-bold">
                                      ${tenant.name.charAt(0)}
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-primary/10 dark:bg-dark-primary/20 rounded-lg flex items-center justify-center">
                              <span className="font-bold text-primary dark:text-dark-primary">
                                {tenant.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-800 dark:text-light">
                              {tenant.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: #{tenant.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-800 dark:text-light">
                          {tenant.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {tenant.phone || "No phone"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                            {tenant.currency}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {tenant.taxRate}% tax
                          </span>
                        </div>
                        {/* <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Created {new Date(tenant.createdAt).toLocaleDateString()}
                        </div> */}
                      </td>
                      {/* <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          tenant.isActive 
                            ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {tenant.isActive ? (
                            <>
                              <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                              Active
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                              Inactive
                            </>
                          )}
                        </span>
                      </td> */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/erp/tenants/${tenant.id}`}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-primary hover:text-primary/80 dark:text-dark-primary dark:hover:text-dark-primary/80 transition-colors"
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
                            View
                          </Link>
                          <Link
                            to={`/erp/tenants/${tenant.id}/edit`}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-warning hover:text-warning/80 dark:text-dark-warning dark:hover:text-dark-warning/80 transition-colors"
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
                            Edit
                          </Link>
                          <button
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  "Are you sure you want to permanently delete this tenant?",
                                )
                              )
                                return;
                              try {
                                await deleteTenantMutation.mutateAsync(
                                  tenant.id,
                                );
                                setTenants((prev) =>
                                  prev.filter((t) => t.id !== tenant.id),
                                ); // remove from UI
                              } catch (error) {
                                console.error(
                                  "Failed to delete tenant:",
                                  error,
                                );
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination/Info Footer */}
        {filteredTenants.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="mb-4 sm:mb-0">
              Showing{" "}
              <span className="font-semibold">{filteredTenants.length}</span> of{" "}
              <span className="font-semibold">{tenants.length}</span> tenants
              {search && <span className="ml-2">(filtered by "{search}")</span>}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Inactive</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantList;
