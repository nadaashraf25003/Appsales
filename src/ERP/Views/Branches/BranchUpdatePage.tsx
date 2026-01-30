import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useBranches, { BranchDto } from "@/Hooks/useBranches";
import { toast } from "react-hot-toast";

export default function BranchUpdatePage() {
  const { branchId } = useParams<{ branchId: string }>();
  const branchIdNum = Number(branchId);
  const navigate = useNavigate();
  const { getBranchByIdQuery, updateBranchMutation } = useBranches();

  const { data, isLoading, error } = getBranchByIdQuery(branchIdNum);

  const [branch, setBranch] = useState<BranchDto | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set form state when branch data is loaded
  useEffect(() => {
    if (data?.data) {
      const b = data.data as BranchDto;
      setBranch(b);
      setForm({
        name: b.name || "",
        address: b.address || "",
        phone: b.phone || "",
        email: b.email || "",
        isActive: b.isActive,
      });
      toast.success("Branch loaded successfully");
    }
  }, [data]);

  // Show error toast if data fails to load
  useEffect(() => {
    if (error) {
      toast.error("Failed to load branch details");
    }
  }, [error]);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = "Branch name is required";
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (form.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(form.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid phone number (minimum 10 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBranchMutation.mutateAsync({
        branchId: branchIdNum,
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
        isActive: form.isActive,
      });
      toast.success("Branch updated successfully!");
      navigate("/erp/branches");
    } catch (err) {
      console.error("Failed to update branch:", err);
      toast.error("Failed to update branch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/erp/branches");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary dark:border-dark-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading branch details...</p>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="card text-center p-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-secondary/10 dark:bg-dark-secondary/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary dark:text-dark-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-light mb-2">Branch Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ? "Failed to load branch details." : "The branch you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/erp/branches")}
            className="btn-primary w-full"
          >
            Back to Branches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <button
              onClick={() => navigate("/erp/branches")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Branches</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${branch.isActive ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                {branch.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">ID: #{branch.id}</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            {/* Branch Icon */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-primary dark:text-dark-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Title Section */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-light mb-2">
                Edit Branch
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Update branch information for <span className="font-semibold text-primary dark:text-dark-primary">{branch.name}</span>
              </p>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Tenant ID: {branch.tenantId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
          {/* Form Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-info/5 dark:from-dark-primary/10 dark:to-dark-info/10">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-light">Branch Information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update the branch details below</p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Branch Name *</span>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.name ? "!border-red-500 !ring-red-500" : ""}`}
                        placeholder="Enter branch name"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </label>
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Email Address *</span>
                    <div className="relative mt-1">
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.email ? "!border-red-500 !ring-red-500" : ""}`}
                        placeholder="branch@example.com"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </label>
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Address Field */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Address</span>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="Enter full address"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Phone Number</span>
                    <div className="relative mt-1">
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.phone ? "!border-red-500 !ring-red-500" : ""}`}
                        placeholder="+1 (555) 123-4567"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                  </label>
                  {errors.phone && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Status Field */}
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Status</span>
                    <div className="mt-3">
                      <label className="flex items-center cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                            className="sr-only"
                            id="statusToggle"
                          />
                          <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${form.isActive ? 'bg-success dark:bg-dark-success' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                          <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 transform ${form.isActive ? 'translate-x-6' : ''}`}></div>
                        </div>
                        <div className="ml-4 flex items-center">
                          <span className={`text-lg font-medium ${form.isActive ? 'text-success dark:text-dark-success' : 'text-gray-500 dark:text-gray-400'}`}>
                            {form.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <div className={`ml-2 w-2 h-2 rounded-full ${form.isActive ? 'bg-success animate-pulse dark:bg-dark-success' : 'bg-gray-400'}`}></div>
                        </div>
                      </label>
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {form.isActive 
                      ? 'This branch is currently active and visible' 
                      : 'This branch is inactive and hidden'}
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || updateBranchMutation.isPending}
                    className="btn-primary flex-1 py-3 text-sm md:text-base relative"
                  >
                    {isSubmitting || updateBranchMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Saving Changes...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting || updateBranchMutation.isPending}
                    className="btn-secondary flex-1 py-3 text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (branch) {
                        setForm({
                          name: branch.name || "",
                          address: branch.address || "",
                          phone: branch.phone || "",
                          email: branch.email || "",
                          isActive: branch.isActive,
                        });
                        setErrors({});
                        toast.success("Form reset to original values");
                      }
                    }}
                    disabled={isSubmitting || updateBranchMutation.isPending}
                    className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm md:text-base"
                  >
                    Reset
                  </button>
                </div>

                {/* Form Validation Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                        <ul className="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                          {errors.name && <li>{errors.name}</li>}
                          {errors.email && <li>{errors.email}</li>}
                          {errors.phone && <li>{errors.phone}</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Current Information Card */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-light mb-4">Current Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Branch Name</p>
                <p className="font-medium text-gray-800 dark:text-light">{branch.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-800 dark:text-light">{branch.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                <p className="font-medium text-gray-800 dark:text-light">{branch.address || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-800 dark:text-light">{branch.phone || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className={`font-medium ${branch.isActive ? 'text-success dark:text-dark-success' : 'text-gray-600 dark:text-gray-400'}`}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tenant ID</p>
                <p className="font-medium text-gray-800 dark:text-light">{branch.tenantId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}