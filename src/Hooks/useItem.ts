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
  categoryId?: number;
  description?: string;
  sku?: string;
  barcode?: string;
  image?: string;
  category?: any;
  createdAt?: string;
  updatedAt?: string;

}

export interface CreateItemDto {
  name: string;
  sellingPrice: number;
  currentStock: number;
  minStockLevel?: number;
  categoryId?: number;
  description?: string;
  sku?: string;
  barcode?: string;
  image?: string;
}

export interface UpdateItemDto extends CreateItemDto {
  isActive: boolean;
   currentStock: number;

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

  // Fetch single item by ID
  const getItemQuery = (id: number) =>
    useQuery({
      queryKey: ["item", id],
      queryFn: async () => {
        const res = await api.get(`${Urls.ITEMS.GET_BY_ID(id)}`);
        return res.data as ItemDto;
      },
    });

  // Create item
  const createItemMutation = useMutation({
    mutationFn: async (data: CreateItemDto) => {
      const res = await api.post(Urls.ITEMS.CREATE, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  // Update item
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateItemDto }) => {
      const res = await api.put(Urls.ITEMS.UPDATE(id), data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
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
