import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useMaterial from '@/Hooks/useMaterial';
import Loader from '@/Components/Global/Loader';

const MaterialsList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [inputTenantId, setInputTenantId] = useState("1");
  const [tenantId, setTenantId] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch data for selected tenant
  const { materialsQuery, deleteMaterialMutation, refetch } = useMaterial(tenantId);
  const { data: materials, isLoading, isError, isFetching } = materialsQuery;

  // Initialize tenant ID input
  useEffect(() => {
    setInputTenantId(tenantId.toString());
  }, [tenantId]);

  // Load tenant data
  const handleLoadTenant = () => {
    const newTenantId = parseInt(inputTenantId);
    if (newTenantId > 0) {
      setTenantId(newTenantId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLoadTenant();
    }
  };

  // Delete material
  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteMaterialMutation.mutate(deleteId, {
      onSuccess: () => {
        // Success handled by Toast in hook
        setDeleteId(null);
        // refetch();
      },
      onError: () => {
        setDeleteId(null);
      },
    });
  };

  // Filtered data
  const filteredData = useMemo(() => {
    if (!materials) return [];
    const query = search.toLowerCase();
    return materials.filter(m => 
      m.name?.toLowerCase().includes(query) ||
      m.description?.toLowerCase().includes(query) ||
      m.category?.toLowerCase().includes(query)
    );
  }, [materials, search]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!materials?.length) return {
      total: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0
    };

    const total = materials.length;
    const lowStock = materials.filter(m => {
      const stock = m.currentQuantity || 0;
      const minStock = m.minQuantity || 10;
      return stock > 0 && stock <= minStock;
    }).length;
    const outOfStock = materials.filter(m => (m.currentQuantity || 0) === 0).length;
    const totalValue = materials.reduce((sum, m) => 
      sum + ((m.costPerUnit || 0) * (m.currentQuantity || 0)), 0
    );

    return { total, lowStock, outOfStock, totalValue };
  }, [materials]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4 md:p-6">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark dark:text-light mb-2">
            Failed to Load Materials
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Unable to fetch materials for tenant {tenantId}
          </p>
          <button 
            onClick={() => refetch()} 
            className="btn-primary px-6 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Get stock status badge
  const getStockBadge = (stock, minStock = 10) => {
    if (stock === 0) {
      return {
        text: "Out of Stock",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800"
      };
    }
    if (stock <= minStock) {
      return {
        text: "Low Stock",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-100 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800"
      };
    }
    return {
      text: "In Stock",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800"
    };
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 animate-fadeIn max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">
              Raw Materials Inventory
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track ingredients and supplies used in production
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
                onClick={handleLoadTenant}
                className="btn-secondary px-3 py-2 text-sm whitespace-nowrap"
                disabled={isFetching}
              >
                {isFetching ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : "Load"}
              </button>
            </div>

            {/* Add Material Button */}
            <button
              onClick={() => navigate('/erp/inventory/materials/new')}
              className="btn-primary px-4 py-2 text-sm sm:text-base whitespace-nowrap"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Material
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="card p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Materials
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-dark dark:text-light">
            {stats.total}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {filteredData.length} shown
          </div>
        </div>

        <div className="card p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            Inventory Value
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
            {formatCurrency(stats.totalValue)}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Total stock value
          </div>
        </div>

        <div className="card p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            Low Stock
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.lowStock}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Needs attention
          </div>
        </div>

        <div className="card p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            Out of Stock
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.outOfStock}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Needs restocking
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center justify-between w-full text-sm font-medium text-primary dark:text-dark-primary p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </span>
            <span className="text-xs bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary px-2 py-1 rounded">
              {isFilterOpen ? '▼' : '▶'}
            </span>
          </button>

          {/* Search & Filters */}
          <div className={`${isFilterOpen ? 'block' : 'hidden md:flex'} flex-1 flex-col md:flex-row gap-4 w-full`}>
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search materials by name, description, or category..."
                className="input text-sm pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search materials"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSearch("")}
                className="px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm whitespace-nowrap"
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      {isMobile ? (
        /* Mobile Cards View */
        <div className="space-y-3">
          {filteredData.length > 0 ? (
            filteredData.map((material) => {
              const stockBadge = getStockBadge(material.currentQuantity || 0, material.minQuantity || 10);
              return (
                <div key={material.id} className="card p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm md:text-base text-dark dark:text-light truncate">
                        {material.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                          {material.unit || "units"}
                        </span>
                        {material.branchId && (
                          <span className="text-xs text-gray-500">Branch #{material.branchId}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(material.costPerUnit || 0)}
                      </div>
                      <div className="text-xs text-gray-500">per unit</div>
                    </div>
                  </div>
                  
                  {/* Stock Info */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stock: {material.currentQuantity || 0} {material.unit || "units"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {material.minQuantity || 10} {material.unit || "units"}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockBadge.bg} ${stockBadge.color} ${stockBadge.border}`}>
                      {stockBadge.text}
                    </span>
                  </div>
                  
                  {/* Description */}
                  {material.description && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {material.description}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">
                      ID: #{material.id}
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate(`/erp/inventory/materials/${material.id}/edit`)}
                        className="text-primary dark:text-dark-primary text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(material.id)}
                        className="text-secondary dark:text-dark-secondary text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card p-6 text-center">
              <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <p className="text-base font-medium mb-1">No materials found</p>
                <p className="text-xs mb-4">
                  {search ? 'Try a different search term' : 'Add your first raw material'}
                </p>
                {!search && (
                  <button
                    onClick={() => navigate('/erp/inventory/materials/new')}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Add Material
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Material Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Cost/Unit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredData.length > 0 ? (
                  filteredData.map((material) => {
                    const stockBadge = getStockBadge(material.currentQuantity || 0, material.minQuantity || 10);
                    return (
                      <tr 
                        key={material.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-sm md:text-base text-dark dark:text-light">
                              {material.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: #{material.id}
                              {material.description && (
                                <span className="ml-2 truncate max-w-[200px] inline-block">
                                  {material.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                            {material.unit || "units"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {material.branchId ? (
                            <span className="text-sm">Branch #{material.branchId}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {material.currentQuantity || 0} {material.unit || "units"}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockBadge.bg} ${stockBadge.color}`}>
                                {stockBadge.text}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: {material.minQuantity || 10} {material.unit || "units"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(material.costPerUnit || 0)}
                          </div>
                          <div className="text-xs text-gray-500">per {material.unit || "unit"}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/erp/inventory/materials/${material.id}/edit`)}
                              className="text-primary dark:text-dark-primary hover:underline text-sm font-medium px-3 py-1 rounded hover:bg-primary/5 dark:hover:bg-dark-primary/10"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(material.id)}
                              className="text-secondary dark:text-dark-secondary hover:underline text-sm font-medium px-3 py-1 rounded hover:bg-secondary/5 dark:hover:bg-dark-secondary/10"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 sm:py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">No materials found</p>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                          {search ? 'Try a different search term' : 'Add your first raw material to get started'}
                        </p>
                        {!search && (
                          <button
                            onClick={() => navigate('/erp/inventory/materials/new')}
                            className="btn-primary px-4 sm:px-6 py-2 text-sm"
                          >
                            Add Your First Material
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredData.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-semibold">{filteredData.length}</span> of{' '}
                  <span className="font-semibold">{materials?.length || 0}</span> materials
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Value: <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(stats.totalValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-slideDown">
          <div className="card w-full max-w-sm md:max-w-md mx-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-50 dark:bg-dark-secondary/20">
                <svg className="w-6 h-6 text-red-600 dark:text-dark-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark dark:text-light">Delete Material</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This material may be used in recipes. Deleting it will affect production calculations.
            </p>
            <p className="text-sm font-medium text-dark dark:text-light mb-6">
              Are you sure you want to delete this material?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 flex-1 sm:flex-none"
                disabled={deleteMaterialMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMaterialMutation.isPending}
                className="btn-secondary px-4 py-2 bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none flex items-center justify-center gap-2"
              >
                {deleteMaterialMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : "Delete Material"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsList;