import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(3, "Title is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});