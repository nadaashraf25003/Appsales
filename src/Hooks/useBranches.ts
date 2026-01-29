/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */

export interface BranchDto {
  id: number;
  name: string;
  tenantId: number;
  isActive: boolean;
  address: string;
  phone: string;
  email: string;
  // add other branch fields if needed
}

export interface CreateBranchData {
  name: string;
  tenantId: number;
}

export interface UpdateBranchData {
  branchId: number; // matches backend
  name: string;
  address: string;
  phone: string;
  email: string;
}
/* =======================
   Hook
======================= */

const useBranches = () => {
  // Create Branch
  const createBranchMutation = useMutation({
    mutationFn: async (data: CreateBranchData) => {
      const res = await api.post(Urls.BRANCHES.CREATE, data);
      return res.data;
    },
  });

  // Get Branches by Tenant
  const getBranchesByTenantMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const res = await api.get(Urls.BRANCHES.GET_BY_TENANT(tenantId));
      return res.data;
    },
  });

  // Update Branch
  const updateBranchMutation = useMutation({
    mutationFn: async (data: UpdateBranchData) => {
      const res = await api.put(Urls.BRANCHES.UPDATE, data);
      return res.data;
    },
  });

  // Deactivate Branch
  const deactivateBranchMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(Urls.BRANCHES.DEACTIVATE(id));
      return res.data;
    },
  });

  return {
    createBranchMutation,
    getBranchesByTenantMutation,
    updateBranchMutation,
    deactivateBranchMutation,
  };
};

export default useBranches;

