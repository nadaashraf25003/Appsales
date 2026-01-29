import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { expenseSchema } from './accounting.schema'; // Re-use or move to a specific expense.schema.ts

const AddEditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0] }
  });

  const onSubmit = (data) => {
    console.log("Expense Data:", data);
    // Mutation call goes here
    navigate("/erp/accounting/expenses");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-slideDown">
      <div className="card p-8">
        <h2 className="text-xl font-bold mb-6">{isEdit ? "Edit Expense" : "Record New Expense"}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <input {...register("description")} className="input" placeholder="e.g. Monthly Internet Bill" />
              {errors.description && <p className="error">{errors.description.message}</p>}
            </div>

            <div>
              <label className="label">Amount ($)</label>
              <input type="number" step="0.01" {...register("amount")} className="input" />
              {errors.amount && <p className="error">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="label">Date</label>
              <input type="date" {...register("date")} className="input" />
              {errors.date && <p className="error">{errors.date.message}</p>}
            </div>

            <div>
              <label className="label">Category</label>
              <select {...register("category")} className="input">
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Marketing">Marketing</option>
                <option value="Salaries">Salaries</option>
              </select>
            </div>

            <div>
              <label className="label">Branch</label>
              <select {...register("branchId")} className="input">
                <option value="1">Main Branch</option>
                <option value="2">Downtown Office</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="submit" className="btn-primary flex-1">Save Expense</button>
            <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditExpense;