/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */
export interface MaterialDto {
  id?: number;
  name: string;
  description?: string;
  unit: string;
  currentQuantity: number;
  minQuantity: number;
  costPerUnit?: number;
  expiryDate?: string;
}

/* =======================
   Hook
======================= */
const useMaterial = (tenantId: number = 1) => {
  const queryClient = useQueryClient();

  // GET all materials
  const materialsQuery = useQuery({
    queryKey: ["materials", tenantId],
    queryFn: async () => {
      const res = await api.get(`${Urls.MATERIALS.GET_ALL}?tenantId=${tenantId}`);
      return res.data;
    },
  });

  // GET material by ID (dynamic query)
  const getMaterialById = (id: number) =>
    useQuery({
      queryKey: ["material", id],
      queryFn: async () => {
        const res = await api.get(`${Urls.MATERIALS.GET_BY_ID(id)}`);
        return res.data;
      },
      enabled: !!id, // only fetch if ID exists
    });

  // CREATE material
  const createMaterialMutation = useMutation({
    mutationFn: async (data: MaterialDto) => {
      const res = await api.post(Urls.MATERIALS.CREATE, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", tenantId] });
    },
  });

  // UPDATE material
  const updateMaterialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MaterialDto }) => {
      const res = await api.put(`${Urls.MATERIALS.UPDATE(id)}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", tenantId] });
    },
  });

  // DELETE material
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`${Urls.MATERIALS.DELETE(id)}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", tenantId] });
    },
  });

  return {
    // Queries
    materialsQuery,
    getMaterialById,

    // Mutations
    createMaterialMutation,
    updateMaterialMutation,
    deleteMaterialMutation,
  };
};

export default useMaterial;
