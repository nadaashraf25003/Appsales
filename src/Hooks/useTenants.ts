  /* eslint-disable @typescript-eslint/no-explicit-any */
  import { useMutation, useQuery } from "@tanstack/react-query";
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
    address?: string;
    logo?: string;
    currency?: string;
    taxRate?: number;
    createdAt?: string;
  }

  export interface CreateTenantData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    logo?: string;
    currency?: string;
    taxRate?: number;
  }

  export interface UpdateTenantData extends CreateTenantData {
    id: number;
  }

  /* =======================
    Hook
  ======================= */

  const useTenants = () => {
    // Get All Tenants
  const getTenantsQuery = useQuery({
  queryKey: ["tenants"],
  queryFn: async (): Promise<TenantDto[]> => {
    const res = await api.get(Urls.TENANTS.GET_ALL);
    return res.data.data; // your API wraps it in "data"
  },
});

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
    const deleteTenantMutation = useMutation({
      mutationFn: async (id: number) => {
        const res = await api.delete(Urls.TENANTS.DEACTIVATE(id));
        return res.data;
      },
    });

    return {
      getTenantsQuery,
      createTenantMutation,
      getTenantByIdMutation,
      updateTenantMutation,
      deleteTenantMutation,
    };
  };

  export default useTenants;
