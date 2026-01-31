import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useItem from "@/Hooks/useItem";
import Loader from "@/Components/Global/Loader";

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [skuError, setSkuError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replace with actual tenantId & branchId from auth/user context
  const tenantId = 1;
  const branchId = 1;

  const {
    getItemsQuery,
    getItemQuery,
    createItemMutation,
    updateItemMutation,
  } = useItem();

  // Fetch all items for SKU validation
  const { data: allItems = [] } = getItemsQuery(tenantId);

  // Fetch existing product if editing
  const { data: existingProduct, isLoading: isFetching } = getItemQuery(
    Number(id),
    {
      enabled: isEdit && !isNaN(Number(id)),
    },
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    costPrice: "",
    sellingPrice: "",
    currentStock: "",
    minStockLevel: "5",
    tenantId: tenantId.toString(),
    branchId: branchId.toString(),
    categoryId: "",
    barcode: "",
    image: "",
    isActive: true,
  });

  // Pre-fill form when data arrives
  useEffect(() => {
    if (isEdit && existingProduct) {
      setFormData({
        name: existingProduct.name || "",
        sku: existingProduct.sku || "",
        description: existingProduct.description || "",
        costPrice: existingProduct.costPrice?.toString() || "",
        sellingPrice: existingProduct.sellingPrice?.toString() || "",
        currentStock: existingProduct.currentStock?.toString() || "0",
        minStockLevel: existingProduct.minStockLevel?.toString() || "5",
        tenantId: existingProduct.tenantId?.toString() || tenantId.toString(),
        branchId: existingProduct.branchId?.toString() || branchId.toString(),
        categoryId: existingProduct.categoryId?.toString() || "",
        barcode: existingProduct.barcode || "",
        image: existingProduct.image || "",
        isActive: existingProduct.isActive ?? true,
      });
    }
  }, [isEdit, existingProduct]);

  // SKU validation
  const validateSku = (sku) => {
    const trimmed = sku?.trim();
    if (!trimmed) {
      setSkuError("");
      return;
    }

    const duplicate = allItems.some(
      (item) => item.sku === trimmed && (!isEdit || item.id !== Number(id)),
    );

    setSkuError(duplicate ? "This SKU already exists" : "");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'sku') {
      validateSku(value);
    }
  };

  const handleNumberInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (skuError) {
      alert("Please fix SKU error before submitting");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim(),
      costPrice: parseFloat(formData.costPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      currentStock: parseInt(formData.currentStock) || 0,
      minStockLevel: parseInt(formData.minStockLevel) || 5,
      tenantId: parseInt(formData.tenantId) || tenantId,
      branchId: parseInt(formData.branchId) || branchId,
      categoryId: parseInt(formData.categoryId) || 0,
      barcode: formData.barcode.trim(),
      image: formData.image.trim(),
      isActive: formData.isActive,
    };

    try {
      if (isEdit) {
        await updateItemMutation.mutateAsync(
          { id: Number(id), data: payload },
          {
            onSuccess: () => {
              // Success handled by Toast in hook
              navigate("/erp/inventory/items");
            },
          }
        );
      } else {
        await createItemMutation.mutateAsync(payload, {
          onSuccess: () => {
            // Success handled by Toast in hook
            navigate("/erp/inventory/items");
          },
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate profit margin
  const calculateMargin = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    if (cost === 0) return 0;
    return ((selling - cost) / cost * 100).toFixed(1);
  };

  const handleCancel = () => {
    const hasChanges = Object.keys(formData).some(key => {
      const defaultValue = isEdit ? existingProduct : {};
      return formData[key] !== (defaultValue[key]?.toString() || "");
    });
    
    if (hasChanges && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
    navigate("/erp/inventory/items");
  };

  if (isEdit && isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  const isLoading = isSubmitting || createItemMutation.isPending || updateItemMutation.isPending;
  const margin = calculateMargin();

  return (
    <div className="p-3 sm:p-4 md:p-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="card mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={handleCancel}
              className="text-primary dark:text-dark-primary hover:underline text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Inventory
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">
              {isEdit ? `Edit Product` : "Create New Product"}
            </h1>
            {isEdit && existingProduct && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Editing: <span className="font-medium">{existingProduct.name}</span>
              </p>
            )}
          </div>
          
          {isEdit && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Product ID:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-dark-info/20 text-blue-800 dark:text-dark-info">
                #{id}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input text-sm md:text-base"
                placeholder="e.g., Arabica Coffee Beans"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Enter a descriptive product name
              </p>
            </div>
          </div>

          {/* SKU & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SKU */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                SKU / Product Code
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                onBlur={() => validateSku(formData.sku)}
                className={`input text-sm md:text-base ${skuError ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="e.g., PROD-001"
                disabled={isLoading}
              />
              {skuError && (
                <p className="text-xs text-red-600 dark:text-red-400">{skuError}</p>
              )}
              <p className="text-xs text-gray-500">
                Unique identifier for inventory tracking
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category ID
              </label>
              <input
                type="number"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="input text-sm md:text-base"
                placeholder="0"
                min="0"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Optional category identifier
              </p>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cost Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cost Price (EGP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  EGP
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => handleNumberInputChange("costPrice", e.target.value)}
                  className="input text-sm md:text-base pl-12"
                  placeholder="0.00"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selling Price (EGP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  EGP
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => handleNumberInputChange("sellingPrice", e.target.value)}
                  className="input text-sm md:text-base pl-12"
                  placeholder="0.00"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Profit Margin */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profit Margin
              </label>
              <div className={`p-3 rounded-xl border ${
                margin >= 30 ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' :
                margin >= 10 ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10' :
                'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'
              }`}>
                <div className="text-center">
                  <div className="text-lg font-bold text-dark dark:text-light">
                    {margin}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {margin >= 30 ? 'Excellent' : margin >= 10 ? 'Good' : 'Low'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Stock */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span>Opening Stock Quantity *</span>
                {isEdit && (
                  <span className="text-xs text-gray-500" title="Stock should be adjusted via Inventory Logs for accuracy">
                    (Read-only)
                  </span>
                )}
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => handleNumberInputChange("currentStock", e.target.value)}
                className="input text-sm md:text-base"
                placeholder="0"
                required
                disabled={isLoading || isEdit}
              />
              <p className="text-xs text-gray-500">
                Initial stock quantity
              </p>
            </div>

            {/* Min Stock Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Low Stock Alert Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => handleNumberInputChange("minStockLevel", e.target.value)}
                className="input text-sm md:text-base"
                placeholder="5"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Get notified when stock falls below this level
              </p>
            </div>

            {/* Status Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Status
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="isActive"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      formData.isActive 
                        ? 'bg-green-500 dark:bg-green-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
                <span className={`text-sm font-medium ${formData.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Active products are available for sale
              </p>
            </div>
          </div>

          {/* Tenant & Branch (Create only) */}
          {!isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tenant ID *
                </label>
                <input
                  type="number"
                  min="1"
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleInputChange}
                  className="input text-sm md:text-base"
                  placeholder="1"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Branch ID *
                </label>
                <input
                  type="number"
                  min="1"
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleInputChange}
                  className="input text-sm md:text-base"
                  placeholder="1"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Barcode */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Barcode
            </label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              className="input text-sm md:text-base"
              placeholder="Scan or enter barcode number"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Optional barcode for scanning
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Description
              </label>
              <span className="text-xs text-gray-500">
                {formData.description.length}/500
              </span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={500}
              rows={4}
              className="input text-sm md:text-base resize-none"
              placeholder="Enter detailed product specifications, ingredients, or notes..."
              disabled={isLoading}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="input text-sm md:text-base"
              placeholder="https://example.com/product-image.jpg"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Optional product image URL
            </p>
            
            {/* Image Preview */}
            {formData.image && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Image Preview:</p>
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      `;
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                * Required fields
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm md:text-base transition-colors flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || skuError}
                  className={`btn-primary px-4 py-3 text-sm md:text-base flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                    (isLoading || skuError) ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isEdit ? 'Update Product' : 'Create Product'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Help Card (Desktop only) */}
      <div className="hidden lg:block mt-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-primary dark:text-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-semibold">Product Management Tips</h3>
          </div>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Use descriptive names for easy search and identification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Keep SKUs unique for accurate inventory tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Set realistic stock levels to avoid overstocking or shortages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Use barcodes for efficient inventory management</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddEditProduct;