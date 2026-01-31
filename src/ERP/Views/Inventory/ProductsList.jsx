import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useItem from "@/Hooks/useItem";
import Loader from "@/Components/Global/Loader";

const ProductsList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [inputTenantId, setInputTenantId] = useState("8");
  const [tenantId, setTenantId] = useState(8);
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

  // API hook
  const { getItemsQuery, deleteItemMutation } = useItem();
  const { data: products, isLoading, isError, refetch, isFetching } = getItemsQuery(tenantId);

  // Load tenant ID
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

  // Delete product
  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteItemMutation.mutate(deleteId, {
      onSuccess: () => {
        // Success handled by Toast in hook
        setDeleteId(null);
        refetch();
      },
      onError: () => {
        setDeleteId(null);
      },
    });
  };

  // Filter products by search term
  const filteredData = useMemo(() => {
    if (!products) return [];
    const query = search.toLowerCase();
    return products.filter((item) =>
      item.name?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  }, [products, search]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!filteredData.length) return {
      totalItems: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0
    };

    return {
      totalItems: filteredData.length,
      totalValue: filteredData.reduce((sum, item) => sum + ((item.costPerUnit || 0) * (item.currentQuantity || 0)), 0),
      lowStock: filteredData.filter(item => {
        const stock = item.currentQuantity || 0;
        const minStock = item.minQuantity || 5;
        return stock > 0 && stock <= minStock;
      }).length,
      outOfStock: filteredData.filter(item => (item.currentQuantity || 0) === 0).length
    };
  }, [filteredData]);

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
            Error Loading Inventory
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Unable to fetch products for tenant {tenantId}
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
  const getStockBadge = (stock, minStock = 5) => {
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
              Products Inventory
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your product catalog and stock levels
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

            {/* Add Product Button */}
            <button
              onClick={() => navigate("/erp/inventory/items/new")}
              className="btn-primary px-4 py-2 text-sm sm:text-base whitespace-nowrap"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="card p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            Total Products
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold text-dark dark:text-light">
            {stats.totalItems}
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
                placeholder="Search products by name or category..."
                className="input text-sm pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
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

      {/* Products Table */}
      {isMobile ? (
        /* Mobile Cards View */
        <div className="space-y-3">
          {filteredData.length > 0 ? (
            filteredData.map((item) => {
              const stockBadge = getStockBadge(item.currentQuantity || 0, item.minQuantity || 5);
              return (
                <div key={item.id} className="card p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm md:text-base text-dark dark:text-light truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-dark-info/20 text-blue-800 dark:text-dark-info">
                          {item.category || "Uncategorized"}
                        </span>
                        {item.branchId && (
                          <span className="text-xs text-gray-500">Branch #{item.branchId}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(item.costPerUnit || 0)}
                      </div>
                      <div className="text-xs text-gray-500">per unit</div>
                    </div>
                  </div>
                  
                  {/* Stock Info */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stock: {item.currentQuantity || 0} {item.unit || "units"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {item.minQuantity || 5} {item.unit || "units"}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockBadge.bg} ${stockBadge.color} ${stockBadge.border}`}>
                      {stockBadge.text}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">
                      ID: #{item.id}
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate(`/erp/inventory/items/${item.id}/edit`)}
                        className="text-primary dark:text-dark-primary text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-base font-medium mb-1">No products found</p>
                <p className="text-xs mb-4">
                  {search ? 'Try a different search term' : 'Add your first product'}
                </p>
                {!search && (
                  <button
                    onClick={() => navigate("/erp/inventory/items/new")}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Add Product
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
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const stockBadge = getStockBadge(item.currentQuantity || 0, item.minQuantity || 5);
                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm md:text-base text-dark dark:text-light">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: #{item.id}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-dark-info/20 text-blue-800 dark:text-dark-info">
                            {item.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {item.branchId ? (
                            <span className="text-sm">Branch #{item.branchId}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(item.costPerUnit || 0)}
                          </div>
                          <div className="text-xs text-gray-500">per {item.unit || "unit"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {item.currentQuantity || 0} {item.unit || "units"}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockBadge.bg} ${stockBadge.color}`}>
                                {stockBadge.text}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: {item.minQuantity || 5} {item.unit || "units"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/erp/inventory/items/${item.id}/edit`)}
                              className="text-primary dark:text-dark-primary hover:underline text-sm font-medium px-3 py-1 rounded hover:bg-primary/5 dark:hover:bg-dark-primary/10"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(item.id)}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-sm sm:text-base font-medium mb-1 sm:mb-2">No products found</p>
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                          {search ? 'Try a different search term' : 'Add your first product to get started'}
                        </p>
                        {!search && (
                          <button
                            onClick={() => navigate("/erp/inventory/items/new")}
                            className="btn-primary px-4 sm:px-6 py-2 text-sm"
                          >
                            Add Your First Product
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
                  <span className="font-semibold">{products?.length || 0}</span> products
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
              <h3 className="text-lg font-bold text-dark dark:text-light">Delete Product</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this product? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 flex-1 sm:flex-none"
                disabled={deleteItemMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteItemMutation.isPending}
                className="btn-secondary px-4 py-2 bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none flex items-center justify-center gap-2"
              >
                {deleteItemMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;