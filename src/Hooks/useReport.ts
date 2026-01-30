/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */
export interface InventoryReportDto {
  itemId: number;
  itemName: string;
  currentStock: number;
  minStockLevel: number;
  isLowStock: boolean;
}

/* =======================
   Hook
======================= */
const useReports = (tenantId: number = 1) => {
  const inventoryReportQuery = useQuery({
    queryKey: ["inventoryReport", tenantId],
    queryFn: async () => {
      const res = await api.get(
        `${Urls.REPORTS.INVENTORY}?tenantId=${tenantId}`
      );
      return res.data as InventoryReportDto[];
    },

    placeholderData: (previousData) => previousData,

    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    inventoryReportQuery,
  };
};

export default useReports;

