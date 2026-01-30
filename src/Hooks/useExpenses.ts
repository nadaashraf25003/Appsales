/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */

export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  attachmentUrl?: string;
  tenantId: number;
  branchId?: number;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  date: string;
  category: string;
  attachmentUrl?: string;
  tenantId: number;
  branchId?: number;
}

export interface UpdateExpenseData extends CreateExpenseData {
  id: number;
}

/* =======================
   Hook
======================= */

const useExpenses = () => {
  // Get All Expenses
  const getAllExpensesMutation = useMutation({
    mutationFn: async (params: { tenantId: number; branchId?: number }) => {
      const res = await api.get(Urls.EXPENSES.GET_ALL, { params });
      return res.data;
    },
  });

  // Get Expense by ID
  const getExpenseByIdMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.get(Urls.EXPENSES.GET_BY_ID(id));
      return res.data;
    },
  });

  // Create Expense
  const createExpenseMutation = useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      const res = await api.post(Urls.EXPENSES.CREATE, data);
      return res.data;
    },
  });

  // Update Expense
  const updateExpenseMutation = useMutation({
    mutationFn: async (data: UpdateExpenseData) => {
      const { id, ...rest } = data;
      const res = await api.put(Urls.EXPENSES.UPDATE(id), rest);
      return res.data;
    },
  });

  // Delete Expense
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(Urls.EXPENSES.DELETE(id));
      return { success: true };
    },
  });

  const getAllExpensesQuery = (tenantId: number) =>
  useQuery({
    queryKey: ["expenses", tenantId],
    queryFn: async () => {
      const res = await api.get(Urls.EXPENSES.GET_ALL, {
        params: { tenantId },
      });
      return res.data;
    },
    enabled: !!tenantId,
  });
  return {
    getAllExpensesMutation,
    getExpenseByIdMutation,
    createExpenseMutation,
    updateExpenseMutation,
    deleteExpenseMutation,
    getAllExpensesQuery,
  };
};

export default useExpenses;
