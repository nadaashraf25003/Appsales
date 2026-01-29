import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(3),
  role: z.enum(["SuperAdmin", "TenantOwner", "BranchManager", "Cashier", "Accountant"]), // add role
  tenantId: z.number().min(1),
  branchId: z.number().min(1),
  phoneNumber: z.string().min(8).optional(),
  address: z.string().min(5).optional(),
  country: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
});

export const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6),
});