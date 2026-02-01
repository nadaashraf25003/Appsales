import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useMaterial from "@/Hooks/useMaterial";
import Loader from "@/Components/Global/Loader";

const AddEditMaterial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get logged-in user for defaults
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const defaultTenantId = user.tenantId || 1;
  const defaultBranchId = user.branchId || 0;

  const {
    getMaterialById,
    createMaterialMutation,
    updateMaterialMutation,
  } = useMaterial(defaultTenantId);

  // Fetch material for edit
  const { data: existingMaterial, isLoading: isFetching } = getMaterialById(Number(id));

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    tenantId: defaultTenantId.toString(),
    branchId: defaultBranchId.toString(),
    unit: "kg",
    currentQuantity: "",
    minQuantity: "5",
    costPerUnit: "",
    expiryDate: "",
    description: "",
    category: "",
    supplier: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existingMaterial) {
      setFormData({
        name: existingMaterial.name || "",
        tenantId: existingMaterial.tenantId?.toString() || defaultTenantId.toString(),
        branchId: existingMaterial.branchId?.toString() || defaultBranchId.toString(),
        unit: existingMaterial.unit || "kg",
        currentQuantity: existingMaterial.currentQuantity?.toString() || "0",
        minQuantity: existingMaterial.minQuantity?.toString() || "5",
        costPerUnit: existingMaterial.costPerUnit?.toString() || "",
        expiryDate: existingMaterial.expiryDate ? existingMaterial.expiryDate.split('T')[0] : "",
        description: existingMaterial.description || "",
        category: existingMaterial.category || "",
        supplier: existingMaterial.supplier || "",
      });
    }
  }, [isEdit, existingMaterial, defaultTenantId, defaultBranchId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      tenantId: parseInt(formData.tenantId) || defaultTenantId,
      branchId: parseInt(formData.branchId) || defaultBranchId,
      unit: formData.unit,
      currentQuantity: parseFloat(formData.currentQuantity) || 0,
      minQuantity: parseInt(formData.minQuantity) || 5,
      costPerUnit: parseFloat(formData.costPerUnit) || 0,
      expiryDate: formData.expiryDate || null,
      description: formData.description.trim(),
      category: formData.category.trim(),
      supplier: formData.supplier.trim(),
    };

    try {
      if (isEdit) {
        await updateMaterialMutation.mutateAsync({ id: Number(id), data: payload });
        // Success handled by Toast in hook
      } else {
        await createMaterialMutation.mutateAsync(payload);
        // Success handled by Toast in hook
      }
      navigate("/erp/inventory/materials");
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate stock value
  const calculateStockValue = () => {
    const quantity = parseFloat(formData.currentQuantity) || 0;
    const cost = parseFloat(formData.costPerUnit) || 0;
    return quantity * cost;
  };

  const handleCancel = () => {
    const hasChanges = Object.keys(formData).some(key => {
      const defaultValue = isEdit ? existingMaterial : {};
      return formData[key] !== (defaultValue[key]?.toString() || "");
    });
    
    if (hasChanges && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
    navigate("/erp/inventory/materials");
  };

  if (isEdit && isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  const isLoading = isSubmitting || createMaterialMutation.isPending || updateMaterialMutation.isPending;
  const stockValue = calculateStockValue();

  // Unit options
  const unitOptions = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "L", label: "Liters (L)" },
    { value: "g", label: "Grams (g)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
    { value: "roll", label: "Roll" },
    { value: "meter", label: "Meter" },
    { value: "sheet", label: "Sheet" },
  ];

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
              Back to Materials Inventory
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-dark dark:text-light flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {isEdit ? `Edit Material` : "Register New Material"}
            </h1>
            {isEdit && existingMaterial && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Editing: <span className="font-medium">{existingMaterial.name}</span>
              </p>
            )}
          </div>
          
          {isEdit && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Material ID:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                #{id}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Material Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input text-sm md:text-base"
              placeholder="e.g., Whole Milk, Arabica Coffee Beans, Packaging Box"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Enter a descriptive name for the raw material
            </p>
          </div>

          {/* Tenant & Branch IDs */}
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
                min="0"
                name="branchId"
                value={formData.branchId}
                onChange={handleInputChange}
                className="input text-sm md:text-base"
                placeholder="0"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Unit & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Unit of Measurement *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="input text-sm md:text-base"
                required
                disabled={isLoading}
              >
                {unitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Select how this material is measured
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input text-sm md:text-base"
                placeholder="e.g., Dairy, Spices, Packaging"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Optional category for grouping materials
              </p>
            </div>
          </div>

          {/* Stock Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Stock */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span>Opening Stock *</span>
                {isEdit && (
                  <span className="text-xs text-gray-500" title="Stock should be adjusted via Inventory Logs for accuracy">
                    (Read-only)
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentQuantity}
                  onChange={(e) => handleNumberInputChange("currentQuantity", e.target.value)}
                  className="input text-sm md:text-base pr-12"
                  placeholder="0.00"
                  required
                  disabled={isLoading || isEdit}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {formData.unit}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Initial stock quantity
              </p>
            </div>

            {/* Min Stock Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Low Stock Alert *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={formData.minQuantity}
                  onChange={(e) => handleNumberInputChange("minQuantity", e.target.value)}
                  className="input text-sm md:text-base pr-12"
                  placeholder="5"
                  required
                  disabled={isLoading}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {formData.unit}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Get notified when stock falls below this level
              </p>
            </div>

            {/* Stock Value */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock Value
              </label>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {new Intl.NumberFormat('en-EG', {
                      style: 'currency',
                      currency: 'EGP',
                      minimumFractionDigits: 0
                    }).format(stockValue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Current stock value
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost & Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost per Unit */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cost Per Unit (EGP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  EGP
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerUnit}
                  onChange={(e) => handleNumberInputChange("costPerUnit", e.target.value)}
                  className="input text-sm md:text-base pl-12"
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Cost for one unit of measurement
              </p>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="input text-sm md:text-base"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Optional expiry date for perishable items
              </p>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Supplier Information
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              className="input text-sm md:text-base"
              placeholder="e.g., Supplier name, contact details"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Optional supplier or vendor information
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes / Special Instructions
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
              placeholder="Storage requirements, handling instructions, quality notes, or special remarks..."
              disabled={isLoading}
            />
          </div>

          {/* Expiry Warning */}
          {formData.expiryDate && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Expiry Date Set: {new Date(formData.expiryDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    This material will be flagged when approaching expiry date
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  disabled={isLoading}
                  className={`btn-primary px-4 py-3 text-sm md:text-base flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
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
                      {isEdit ? 'Update Material' : 'Save Material'}
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
            <h3 className="text-sm font-semibold">Material Management Tips</h3>
          </div>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">✓</span>
              <span>Always set accurate unit measurements for consistency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">✓</span>
              <span>Set realistic low-stock thresholds to avoid production delays</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">✓</span>
              <span>Include expiry dates for perishable items to minimize waste</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">✓</span>
              <span>Record supplier info for easy reordering and quality tracking</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddEditMaterial;