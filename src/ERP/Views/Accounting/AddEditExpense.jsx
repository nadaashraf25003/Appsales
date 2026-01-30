import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useExpenses from '@/Hooks/useExpenses';
import { expenseSchema } from './accounting.schema';
import Loader from '@/Components/Global/Loader';

const AddEditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // 1. Hook Integration
  const { 
    createExpenseMutation, 
    updateExpenseMutation, 
    getExpenseByIdMutation 
  } = useExpenses();

  // Retrieve tenant context from LocalStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user.tenantId || 1; 

  // 2. Form Initialization with React Hook Form
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { 
      date: new Date().toISOString().split('T')[0],
      description: "",
      amount: 0,
      category: "Utilities",
      branchId: 1
    }
  });

  // 3. Fetch Data if in Edit Mode
  useEffect(() => {
    if (isEdit) {
      getExpenseByIdMutation.mutate(Number(id), {
        onSuccess: (data) => {
          // Format ISO date (2023-01-01T00:00:00) to (2023-01-01) for HTML input
          const formattedData = {
            ...data,
            date: data.date ? data.date.split('T')[0] : ""
          };
          reset(formattedData);
        },
        onError: () => {
          toast.error("Failed to load expense details.");
          navigate("/erp/accounting/expenses");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, reset]);

  // 4. Submit Logic
  const onSubmit = (data) => {
    const payload = {
      ...data,
      amount: Number(data.amount),
      tenantId: tenantId,
      branchId: data.branchId ? Number(data.branchId) : undefined,
    };

    if (isEdit) {
      updateExpenseMutation.mutate({ ...payload, id: Number(id) }, {
        onSuccess: () => {
          toast.success("Expense updated successfully!");
          navigate("/erp/accounting/expenses");
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Update failed");
        }
      });
    } else {
      createExpenseMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Expense recorded successfully!");
          navigate("/erp/accounting/expenses");
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Creation failed");
        }
      });
    }
  };

  // 5. Loading State
  if (isEdit && getExpenseByIdMutation.isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto animate-slideDown">
      <div className="card p-8 shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEdit ? `Edit Expense #${id}` : "Record New Expense"}
          </h2>
          <p className="text-gray-500 text-sm">Update your financial records accurately.</p>
        </header>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold mb-1 block text-gray-700 dark:text-gray-300">Description</label>
              <input 
                {...register("description")} 
                className={`input w-full ${errors.description ? 'border-red-500 focus:ring-red-500/20' : ''}`} 
                placeholder="e.g. Monthly Office Rent" 
              />
              {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description.message}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700 dark:text-gray-300">Amount (EGP)</label>
              <input 
                type="number" 
                step="0.01" 
                {...register("amount", { valueAsNumber: true })} 
                className={`input w-full ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount.message}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700 dark:text-gray-300">Date</label>
              <input 
                type="date" 
                {...register("date")} 
                className={`input w-full ${errors.date ? 'border-red-500' : ''}`} 
              />
              {errors.date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700 dark:text-gray-300">Category</label>
              <select 
                {...register("category")} 
                className={`input w-full ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Marketing">Marketing</option>
                <option value="Salaries">Salaries</option>
                <option value="Supplies">Supplies</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category.message}</p>}
            </div>

            {/* Branch */}
            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700 dark:text-gray-300">Branch</label>
              <select {...register("branchId")} className="input w-full">
                <option value="1">Main Branch</option>
                <option value="2">Downtown Office</option>
                <option value="3">Warehouse</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
              className="btn-primary flex-1 py-3 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {createExpenseMutation.isPending || updateExpenseMutation.isPending 
                ? "Processing..." 
                : isEdit ? "Update Changes" : "Save Expense"}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="btn-outline flex-1 py-3 border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditExpense;