/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  // add other fields from your DTO
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateCustomerData {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
}

/* =======================
   Hook
======================= */

const useCustomers = () => {
  // Create Customer
  const createCustomerMutation = useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      const res = await api.post(Urls.CUSTOMERS.CREATE, data);
      return res.data;
    },
  });

  // Update Customer
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: UpdateCustomerData) => {
      const { id, ...rest } = data;
      const res = await api.put(Urls.CUSTOMERS.UPDATE(id), rest);
      return res.data;
    },
  });

  // Delete Customer
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(Urls.CUSTOMERS.DELETE(id));
      return { success: true };
    },
  });

  // Get Customer by ID
  const getCustomerByIdMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.get(Urls.CUSTOMERS.GET_BY_ID(id));
      return res.data;
    },
  });

  // Get Customer Statement
  const getCustomerStatementMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.get(Urls.CUSTOMERS.STATEMENT(id));
      return res.data;
    },
  });

  // Get All Customers
  const getAllCustomersMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get(Urls.CUSTOMERS.GET_ALL);
      return res.data;
    },
  });
  const getAllCustomersQuery = () =>
    useQuery({
      queryKey: ["customers"],
      queryFn: async () => {
        const res = await api.get(Urls.CUSTOMERS.GET_ALL);
        return res.data;
      },
    });
  return {
    createCustomerMutation,
    updateCustomerMutation,
    deleteCustomerMutation,
    getCustomerByIdMutation,
    getCustomerStatementMutation,
    getAllCustomersMutation,

    getAllCustomersQuery,
  };
};

export default useCustomers;
