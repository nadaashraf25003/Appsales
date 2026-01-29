import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useBranches, { BranchDto } from "@/Hooks/useBranches";

export default function BranchListPage() {
  const { getBranchesByTenantMutation, deactivateBranchMutation } = useBranches();
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [tenantId, setTenantId] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBranches = async () => {
    if (!tenantId) return;
    try {
      const res = await getBranchesByTenantMutation.mutateAsync(Number(tenantId));
      setBranches(res.data); 
    } catch (err) {
      console.error("Failed to fetch branches", err);
      setBranches([]);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm("Are you sure you want to deactivate this branch?")) return;
    try {
      await deactivateBranchMutation.mutateAsync(id);
      fetchBranches(); // refresh list
    } catch (err) {
      console.error("Failed to deactivate branch", err);
    }
  };

  useEffect(() => {
    if (tenantId) fetchBranches();
  }, [tenantId]);

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-light mb-2">
              Branch Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all branches across your organization
            </p>
          </div>
          <Link
            to="/erp/branches/create"
            className="btn-primary flex items-center gap-2 px-6 py-3 mt-4 md:mt-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Branch
          </Link>
        </div>

        {/* Filters Card */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tenant Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tenant ID
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter tenant ID"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value ? Number(e.target.value) : "")}
                  className="input flex-1"
                  min="1"
                />
                <button
                  onClick={fetchBranches}
                  disabled={!tenantId || getBranchesByTenantMutation.isPending}
                  className="btn-secondary px-4 whitespace-nowrap"
                >
                  {getBranchesByTenantMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Load Branches"
                  )}
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Branches
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, address, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 dark:bg-dark-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Branches</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-light">{filteredBranches.length}</p>
                </div>
                <div className="text-brand-success">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Branches Table Card */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
          {getBranchesByTenantMutation.isPending ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading branches...</p>
              </div>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-center p-12">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 dark:text-light mb-2">
                No branches found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {tenantId ? "No branches exist for this tenant ID" : "Enter a tenant ID to load branches"}
              </p>
              {!tenantId && (
                <button
                  onClick={() => setTenantId(1)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Load Sample Tenant
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-card">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Tenant ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Address</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBranches.map((branch) => (
                    <tr 
                      key={branch.id} 
                      className="hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-mono">
                        #{branch.id}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-light">{branch.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {branch.email && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {branch.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                          {branch.tenantId}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {branch.address || "No address"}
                        </div>
                        {branch.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {branch.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          branch.isActive 
                            ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {branch.isActive ? (
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
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/erp/branches/${branch.id}/edit`}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-warning hover:text-warning/80 dark:text-dark-warning dark:hover:text-dark-warning/80 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeactivate(branch.id)}
                            disabled={!branch.isActive}
                            className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              branch.isActive
                                ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {branch.isActive ? 'Deactivate' : 'Deactivated'}
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
        {filteredBranches.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="mb-4 sm:mb-0">
              Showing <span className="font-semibold">{filteredBranches.length}</span> of <span className="font-semibold">{branches.length}</span> branches
              {searchTerm && (
                <span className="ml-2">
                  (filtered by "{searchTerm}")
                </span>
              )}
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

        {/* Error State */}
        {getBranchesByTenantMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Failed to load branches. Please try again.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}