/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */

export interface CreateOrderItemDto {
  itemId: number;
  itemVariantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface CreateOrderData {
  tenantId: number;
  branchId: number;
  shiftId: number;
  customerId: number;
  orderType: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  createdByUserId: number;
  items: CreateOrderItemDto[];
}

export interface UpdateOrderData {
  orderId: number;
  newStatus: string;
  paidAmount: number;
  newDetails: Array<{
    id: number;
    itemId: number;
    itemVariantId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes: string;
  }>;
}

export interface CancelOrderData {
  id: number;
  reason: string;
}

export interface OrderDto {
  id: number;
  tenantId: number;
  branchId: number;
  status: string;
  totalAmount: number;
  items: Array<{ productId: number; quantity: number; price: number }>;
  // add other fields from OrderDto
}

export interface OrderSummaryDto {
  id: number;
  status: string;
  totalAmount: number;
  date: string;
  // add other summary fields
}

/* =======================
   Hook
======================= */

const useSales = () => {
  // Create Order
  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const res = await api.post(Urls.SALES.CREATE_ORDER, data);
      return res.data;
    },
  });

  // Update Order
  const updateOrderMutation = useMutation({
    mutationFn: async (data: UpdateOrderData) => {
      const res = await api.put(Urls.SALES.UPDATE_ORDER, data);
      return res.data;
    },
  });

  // Cancel Order
  const cancelOrderMutation = useMutation({
    mutationFn: async (data: CancelOrderData) => {
      const res = await api.post(Urls.SALES.CANCEL_ORDER, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    },
  });

  // Get Order by ID
  const getOrderByIdMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.get(Urls.SALES.GET_ORDER_BY_ID(id));
      return res.data;
    },
  });

  // Get Orders by Branch
  const getOrdersByBranchMutation = useMutation({
    mutationFn: async (branchId: number) => {
      const res = await api.get(Urls.SALES.GET_ORDERS_BY_BRANCH(branchId));
      return res.data;
    },
  });

  // Get Orders by Branch and Status
  const getOrdersByBranchAndStatusMutation = useMutation({
    mutationFn: async (params: { branchId: number; status: string }) => {
      const res = await api.get(
        Urls.SALES.GET_ORDERS_BY_BRANCH_AND_STATUS(
          params.branchId,
          params.status,
        ),
      );
      return res.data;
    },
  });

  // Get Orders by Tenant
  const getOrdersByTenantMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const res = await api.get(Urls.SALES.GET_ORDERS_BY_TENANT(tenantId));
      return res.data;
    },
  });

  // Get All Orders
  const getAllOrdersMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get(Urls.SALES.GET_ALL_ORDERS);
      return res.data;
    },
  });

  const getOrdersByTenantQuery = (tenantId: number) =>
  useQuery({
    queryKey: ["orders", "tenant", tenantId],
    queryFn: async () => {
      const res = await api.get(Urls.SALES.GET_ORDERS_BY_TENANT(tenantId));
      return res.data;
    },
    enabled: !!tenantId,
  });

  const getOrderByIdQuery = (id: number) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await api.get(Urls.SALES.GET_ORDER_BY_ID(id));
      return res.data;
    },
    enabled: !!id,
  });
  return {
    createOrderMutation,
    updateOrderMutation,
    cancelOrderMutation,
    getOrderByIdMutation,
    getOrdersByBranchMutation,
    getOrdersByBranchAndStatusMutation,
    getOrdersByTenantMutation,
    getAllOrdersMutation,

    getOrdersByTenantQuery,
    getOrderByIdQuery
  };
};

export default useSales;
  