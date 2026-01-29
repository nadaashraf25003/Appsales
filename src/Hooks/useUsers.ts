/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  role: string;
  tenantId: number;
  branchId?: number;
  isActive: boolean;
}

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  tenantId: number;
  branchId?: number;
}

export interface UpdateUserData {
  id: number;
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
  tenantId?: number;
  branchId?: number;
  isActive?: boolean;
}

/* =======================
   Hook
======================= */

const useUsers = () => {
  // Create User
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const res = await api.post(Urls.USERS.CREATE, data);
      return res.data;
    },
  });

  // Get User by ID
  const getUserByIdMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.get(Urls.USERS.GET_BY_ID(id));
      return res.data;
    },
  });

  // Get Users by Tenant
  const getUsersByTenantMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const res = await api.get(Urls.USERS.GET_BY_TENANT(tenantId));
      return res.data;
    },
  });

  // Update User
  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const res = await api.put(Urls.USERS.UPDATE, data);
      return res.data;
    },
  });

  // Deactivate User
  const deactivateUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(Urls.USERS.DEACTIVATE(id));
      return res.data;
    },
  });

  return {
    createUserMutation,
    getUserByIdMutation,
    getUsersByTenantMutation,
    updateUserMutation,
    deactivateUserMutation,
  };
};

export default useUsers;
