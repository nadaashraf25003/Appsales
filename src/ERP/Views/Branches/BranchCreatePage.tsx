// src/ERP/Views/Branches/BranchCreatePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useBranches from "@/Hooks/useBranches";

export default function BranchCreatePage() {
  const { createBranchMutation } = useBranches();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenantId: "",
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBranchMutation.mutateAsync({
      tenantId: Number(form.tenantId),
      name: form.name,
    });
    navigate("/erp/branches");
  };

  const handleCancel = () => {
    navigate("/erp/branches");
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-2xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-light">
              Create New Branch
            </h1>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to Branches
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new branch to your organization. Fill in the required details below.
          </p>
        </div>

        {/* Form Card */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tenant ID Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tenant ID
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                name="tenantId"
                value={form.tenantId}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter tenant ID"
                required
                min="1"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Unique identifier for the tenant associated with this branch.
              </p>
            </div>

            {/* Branch Name Field */}
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
                className="input w-full"
                placeholder="Enter branch name (e.g., 'Downtown Office')"
                required
                maxLength={100}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Descriptive name for the branch location or department.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={createBranchMutation.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl"
              >
                {createBranchMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Branch</span>
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
            <div className="text-brand-info mt-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-light mb-1">
                About Branches
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Branches represent different locations or departments within your organization. 
                Each branch can have its own inventory, employees, and operations while sharing 
                the same tenant configuration.
              </p>
            </div>
          </div>
        </div>

        {/* Loading/Error States */}
        {createBranchMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error creating branch:</span>
              <span>{(createBranchMutation.error as Error)?.message || "Unknown error"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}