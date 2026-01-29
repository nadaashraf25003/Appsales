/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";

/* =======================
   Types
======================= */

export interface JournalLineDto {
  accountId: number;
  debit?: number;
  credit?: number;
  description?: string;
}

export interface CreateJournalEntryDto {
  date: string; // ISO string
  reference: string;
  lines: JournalLineDto[];
}

/* =======================
   Hook
======================= */

const useAccounting = () => {
  const queryClient = useQueryClient();

  // Create Journal Entry
  const createJournalMutation = useMutation({
    mutationFn: async (data: CreateJournalEntryDto) => {
      const res = await api.post(`api/accounting/journal`, data);
      return res.data;
    },
    onSuccess: () => {
      // invalidate ledger and trial balance queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      queryClient.invalidateQueries({ queryKey: ["trialBalance"] });
    },
  });

  // Get General Ledger
  const getLedgerQuery = (tenantId: number) =>
    useQuery({
      queryKey: ["ledger", tenantId],
      queryFn: async () => {
        const res = await api.get(`api/accounting/ledger?tenantId=${tenantId}`);
        return res.data;
      },
    });

  // Get Trial Balance
  const getTrialBalanceQuery = (tenantId: number) =>
    useQuery({
      queryKey: ["trialBalance", tenantId],
      queryFn: async () => {
        const res = await api.get(`api/accounting/trial-balance?tenantId=${tenantId}`);
        return res.data;
      },
    });

  return {
    createJournalMutation,
    getLedgerQuery,
    getTrialBalanceQuery,
  };
};

export default useAccounting;
