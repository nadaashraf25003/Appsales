import { z } from "zod";

export const expenseSchema = z.object({
  description: z.string().min(3, "Description is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  tenantId: z.number().optional(),
  branchId: z.number().optional(),
  attachmentUrl: z.string().optional(),
});
