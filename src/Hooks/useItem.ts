/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */
export interface ItemDto {
  id: number;
  name: string;
  sellingPrice: number;
  currentStock: number;
  minStockLevel?: number;
  isActive: boolean;
}

export interface CreateItemDto {
  tenantId: number;
  branchId: number;
  name: string;
  sellingPrice: number;
  currentStock: number;
  minStockLevel?: number;
  categoryId?: number;
  description?: string;
  sku?: string;
  barcode?: string;
  image?: string;
  costPrice?: number;
}

export interface UpdateItemDto {
  name: string;
  sellingPrice: number;
  currentStock: number;
  minStockLevel?: number;
  categoryId?: number;
  description?: string;
  sku?: string;
  barcode?: string;
  image?: string;
  costPrice?: number;
  isActive: boolean;
}

/* =======================
   Hook
======================= */
const useItem = () => {
  const queryClient = useQueryClient();

  // Fetch all items
  const getItemsQuery = (tenantId: number) =>
    useQuery({
      queryKey: ["items", tenantId],
      queryFn: async () => {
        const res = await api.get(`${Urls.ITEMS.GET_ALL}?tenantId=${tenantId}`);
        return res.data as ItemDto[];
      },
    });

  // Fetch single item by ID with options
  const getItemQuery = (id: number, options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: ["item", id],
      queryFn: async () => {
        const res = await api.get(`${Urls.ITEMS.GET_BY_ID(id)}`);
        return res.data as ItemDto;
      },
      ...options,
    });

  // Create item
  const createItemMutation = useMutation({
    mutationFn: async (data: CreateItemDto) => {
      const res = await api.post(Urls.ITEMS.CREATE, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items", variables.tenantId] });
    },
  });

  // Update item
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateItemDto }) => {
      const res = await api.put(Urls.ITEMS.UPDATE(id), data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", (variables as any).id] });
    },
  });

  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(Urls.ITEMS.DELETE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  return {
    getItemsQuery,
    getItemQuery,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
  };
};

export default useItem;
