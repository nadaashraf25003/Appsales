import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTenants from "@/Hooks/useTenants";

const TenantCreate = () => {
  const navigate = useNavigate();
  const { createTenantMutation } = useTenants();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    logo: "",
    currency: "USD",
    taxRate: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Tenant name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    if (formData.taxRate < 0 || formData.taxRate > 100) {
      newErrors.taxRate = "Tax rate must be between 0 and 100";
    }
    
    if (formData.logo && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i.test(formData.logo)) {
      newErrors.logo = "Please enter a valid image URL (jpg, png, gif, svg)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await createTenantMutation.mutateAsync(formData);
      navigate("/erp/tenants");
    } catch (error) {
      console.error("Failed to create tenant:", error);
    }
  };

  const handleCancel = () => {
    navigate("/erp/tenants");
  };

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
  ];

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-light">
              Create New Tenant
            </h1>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to Tenants
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new tenant organization to your ERP system. Tenants represent separate businesses or entities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tenant Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tenant Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter tenant organization name"
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="admin@tenant.com"
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="(123) 456-7890"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input"
                    placeholder="123 Main Street, City, State ZIP"
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    className={`input ${errors.logo ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="https://example.com/logo.png"
                  />
                  {errors.logo && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.logo}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Optional. URL to the tenant's logo image (PNG, JPG, SVG)
                  </p>
                </div>

                {/* Financial Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      className="input"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tax Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleChange}
                        className={`input pl-12 ${errors.taxRate ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max="100"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </div>
                    </div>
                    {errors.taxRate && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.taxRate}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={createTenantMutation.isPending}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl"
                  >
                    {createTenantMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Create Tenant</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary flex-1 py-3 px-6 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Error State */}
            {createTenantMutation.isError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Error creating tenant:</span>
                  <span>{(createTenantMutation.error as Error)?.message || "Unknown error"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
              <h3 className="font-semibold text-gray-800 dark:text-light mb-4">
                Tenant Preview
              </h3>
              
              {formData.logo && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Logo Preview</div>
                  <div className="w-full h-32 bg-gray-100 dark:bg-dark-card rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={formData.logo} 
                      alt="Logo preview" 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                  <div className="font-medium text-gray-800 dark:text-light">
                    {formData.name || "Not specified"}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                  <div className="font-medium text-gray-800 dark:text-light">
                    {formData.email || "Not specified"}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Financial Settings</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 dark:text-light">
                      {formData.currency}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="font-medium text-gray-800 dark:text-light">
                      {formData.taxRate}% Tax
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
              <div className="flex items-start gap-3">
                <div className="text-brand-info mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-light mb-1">
                    About Tenants
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tenants represent separate organizations or businesses in your ERP system. 
                    Each tenant operates independently with its own branches, users, and data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantCreate;