import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import useExpenses from "@/Hooks/useExpenses";
import { expenseSchema } from "./accounting.schema";
import Loader from "@/Components/Global/Loader";

const AddEditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const {
    createExpenseMutation,
    updateExpenseMutation,
    getExpenseByIdMutation,
  } = useExpenses();

  // 1. Form Initialization
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
      category: "Utilities",
      tenantId: 1,
      branchId: 1,
      attachmentUrl: "",
    },
  });

  // 2. Fetch Expense Data if Editing
  useEffect(() => {
    if (isEdit) {
      getExpenseByIdMutation.mutate(Number(id), {
        onSuccess: (data) => {
          reset({
            ...data,
            date: data.date?.split("T")[0],
            amount: Number(data.amount),
          });
        },
        onError: () => {
          toast.error("Failed to load expense.");
          navigate("/erp/accounting/expenses");
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, reset]);

  // 3. Submit Logic
  const onSubmit = (data) => {
    const payload = {
      ...data,
      amount: Number(data.amount),
      tenantId: Number(data.tenantId),
      branchId: Number(data.branchId),
    };

    if (isEdit) {
      updateExpenseMutation.mutate(
        { ...payload, id: Number(id) },
        {
          onSuccess: () => {
            toast.success("Expense updated successfully!");
            navigate("/erp/accounting/expenses");
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || "Update failed");
          },
        },
      );
    } else {
      createExpenseMutation.mutate(payload, {
        onSuccess: (data) => {
          console.log("Expense created:", data); // <-- see the backend response
          toast.success("Expense created successfully!");
          navigate("/erp/accounting/expenses");
        },
        onError: (error) => {
          console.error("Create Expense Error:", error);
          toast.error(error?.response?.data?.message || "Creation failed");
        },
      });
    }
  };

  if (isEdit && getExpenseByIdMutation.isLoading) {
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
          <h2 className="text-2xl font-bold">
            {isEdit ? `Edit Expense #${id}` : "Record New Expense"}
          </h2>
          <p className="text-gray-500 text-sm">
            Update your financial records accurately.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Description */}
            <div className="md:col-span-2">
              <label>Description</label>
              <input
                {...register("description")}
                className={`input w-full ${errors.description ? "border-red-500" : ""}`}
                placeholder="e.g. Office Rent"
              />
              {errors.description && (
                <p className="text-red-500 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label>Amount (EGP)</label>
              <input
                type="number"
                step="0.01"
                {...register("amount", {
                  setValueAs: (v) => (v === "" ? 0 : Number(v)),
                })}
                className={`input w-full ${errors.amount ? "border-red-500" : ""}`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs">{errors.amount.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label>Date</label>
              <input
                type="date"
                {...register("date")}
                className={`input w-full ${errors.date ? "border-red-500" : ""}`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs">{errors.date.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label>Category</label>
              <select {...register("category")} className="input w-full">
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Marketing">Marketing</option>
                <option value="Salaries">Salaries</option>
                <option value="Supplies">Supplies</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Tenant ID */}
            <div>
              <label>Tenant ID</label>
              <input
                type="number"
                {...register("tenantId")}
                className="input w-full"
              />
            </div>

            {/* Branch ID */}
            <div>
              <label>Branch ID</label>
              <input
                type="number"
                {...register("branchId")}
                className="input w-full"
              />
            </div>

            {/* Attachment URL */}
            <div className="md:col-span-2">
              <label>Attachment URL (Optional)</label>
              <input
                type="text"
                {...register("attachmentUrl")}
                className="input w-full"
                placeholder="https://example.com/invoice.pdf"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 flex gap-3">
            <button
              type="submit"
              disabled={
                createExpenseMutation.isLoading ||
                updateExpenseMutation.isLoading
              }
              className="btn-primary flex-1"
            >
              {createExpenseMutation.isLoading ||
              updateExpenseMutation.isLoading
                ? "Processing..."
                : isEdit
                  ? "Update Expense"
                  : "Save Expense"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-outline flex-1"
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
