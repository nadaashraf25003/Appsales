/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */

export interface TenantDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  // Add other tenant fields if needed
}

export interface CreateTenantData {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateTenantData extends CreateTenantData {
  id: number;
}

/* =======================
   Hook
======================= */

const useTenants = () => {
  // Create Tenant
  const createTenantMutation = useMutation({
    mutationFn: async (data: CreateTenantData) => {
      const res = await api.post(Urls.TENANTS.CREATE, data);
      return res.data;
    },
  });

  // Get Tenant by ID
  const getTenantByIdMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.get(Urls.TENANTS.GET_BY_ID(id));
      return res.data;
    },
  });

  // Update Tenant
  const updateTenantMutation = useMutation({
    mutationFn: async (data: UpdateTenantData) => {
      const res = await api.put(Urls.TENANTS.UPDATE, data);
      return res.data;
    },
  });

  // Deactivate Tenant
  const deleteTenantMutation  = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(Urls.TENANTS.DEACTIVATE(id));
      return res.data;
    },
  });

  return {
    createTenantMutation,
    getTenantByIdMutation,
    updateTenantMutation,
    deleteTenantMutation ,
  };
};

export default useTenants;
