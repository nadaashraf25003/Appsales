import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useBranches, { BranchDto } from "@/Hooks/useBranches";

export default function BranchUpdatePage() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const { getBranchesByTenantMutation, updateBranchMutation } = useBranches();

  const [branch, setBranch] = useState<BranchDto | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        // Note: Using tenant 0 might not be correct in production
        // Consider getting tenantId from context or props
        const res = await getBranchesByTenantMutation.mutateAsync(0);
        const allBranches: BranchDto[] = res.data;
        const b = allBranches.find((b) => b.id === Number(branchId));
        if (b) {
          setBranch(b);
          setForm({
            name: b.name || "",
            address: (b as any).address || "",
            phone: (b as any).phone || "",
            email: (b as any).email || "",
          });
        } else {
          navigate("/erp/branches", { replace: true });
        }
      } catch (error) {
        console.error("Failed to fetch branch:", error);
        navigate("/erp/branches", { replace: true });
      }
    };
    
    if (branchId) {
      fetchBranch();
    }
  }, [branchId, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) {
      newErrors.name = "Branch name is required";
    }
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (form.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(form.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await updateBranchMutation.mutateAsync({
        branchId: Number(branchId),
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
      });
      navigate("/erp/branches");
    } catch (error) {
      console.error("Failed to update branch:", error);
    }
  };

  const handleCancel = () => {
    navigate("/erp/branches");
  };

  if (getBranchesByTenantMutation.isPending) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading branch details...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 dark:text-light mb-2">Branch not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The branch you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/erp/branches")}
            className="btn-primary"
          >
            Back to Branches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-2xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-light">
              Edit Branch
            </h1>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to Branches
            </button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
              ID: {branch.id}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              branch.isActive 
                ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {branch.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Update branch information for {branch.name}
          </p>
        </div>

        {/* Form Card */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Branch Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Branch Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter branch name"
                required
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="branch@company.com"
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="input"
                placeholder="123 Main Street, City, State ZIP"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Physical location of the branch
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`input ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="(123) 456-7890"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Primary contact number for this branch
              </p>
            </div>

            {/* Read-only Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Tenant ID
                </label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-800 dark:text-light font-medium">{branch.tenantId}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className={`inline-flex items-center ${
                    branch.isActive ? 'text-success dark:text-dark-success' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      branch.isActive ? 'bg-success dark:bg-dark-success' : 'bg-gray-400'
                    }`}></div>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={updateBranchMutation.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl"
              >
                {updateBranchMutation.isPending ? (
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
                Editing Branch Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Changes to branch details will be reflected across the entire system. 
                Make sure contact information is accurate for proper communication.
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {updateBranchMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error updating branch:</span>
              <span>{(updateBranchMutation.error as Error)?.message || "Unknown error"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}