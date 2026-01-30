import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useTenants from "@/Hooks/useTenants";

interface TenantFormData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  currency: string;
  taxRate: number;
  isActive?: boolean;
  createdAt?: string;
}

const TenantEdit = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { getTenantByIdMutation, updateTenantMutation } = useTenants();
  
  const [formData, setFormData] = useState<TenantFormData>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    address: "",
    logo: "",
    currency: "USD",
    taxRate: 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!tenantId) return;
      
      try {
        setIsLoading(true);
        const res = await getTenantByIdMutation.mutateAsync(Number(tenantId));
        setFormData(res.data);
      } catch (error) {
        console.error("Failed to fetch tenant:", error);
        navigate("/erp/tenants", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTenant();
  }, [tenantId, navigate]);

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
  ];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await updateTenantMutation.mutateAsync(formData);
      navigate(`/erp/tenants/${tenantId}`);
    } catch (error) {
      console.error("Failed to update tenant:", error);
    }
  };

  const handleCancel = () => {
    navigate(`/erp/tenants/${tenantId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-light">
              Edit Tenant
            </h1>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to Tenant
            </button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
              ID: {formData.id}
            </span>
            {formData.isActive !== undefined && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                formData.isActive 
                  ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Update tenant information for {formData.name}
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
                    URL to the tenant's logo image (PNG, JPG, SVG)
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
                      onChange={handleChange}
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

                {/* Read-only Fields */}
                {formData.createdAt && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Created Date
                        </label>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-800 dark:text-light">
                            {new Date(formData.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Tenant Status
                        </label>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className={`inline-flex items-center ${
                            formData.isActive ? 'text-success dark:text-dark-success' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              formData.isActive ? 'bg-success dark:bg-dark-success' : 'bg-gray-400'
                            }`}></div>
                            {formData.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={updateTenantMutation.isPending}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl"
                  >
                    {updateTenantMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
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
            {updateTenantMutation.isError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Error updating tenant:</span>
                  <span>{(updateTenantMutation.error as Error)?.message || "Unknown error"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
              <h3 className="font-semibold text-gray-800 dark:text-light mb-4">
                Preview Changes
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
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `
                          <div class="text-gray-400 dark:text-gray-600">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                  <div className="font-medium text-gray-800 dark:text-light truncate">
                    {formData.name || "Not specified"}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                  <div className="font-medium text-gray-800 dark:text-light truncate">
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
                <div className="text-brand-warning mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-light mb-1">
                    Update Tenant Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Changes to tenant details will affect all associated branches and users. 
                    Financial settings updates may impact existing transactions.
                  </p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6 border-2 border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-gray-800 dark:text-light mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These actions are permanent and cannot be undone.
              </p>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to ${formData.isActive ? 'deactivate' : 'activate'} this tenant?`)) {
                      // Implement activation/deactivation logic
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium ${
                    formData.isActive 
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' 
                      : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                  }`}
                >
                  {formData.isActive ? 'Deactivate Tenant' : 'Activate Tenant'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this tenant? This will also delete all associated branches and users.')) {
                      // Implement delete logic
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete Tenant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantEdit;