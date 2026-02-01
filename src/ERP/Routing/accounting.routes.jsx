import { ROLES } from "@/Roles/roles";
import withRole from "@/Roles/withRole";
import { lazy } from "react";

// All files are in the same directory: src/ERP/Views/Accounting/
const AccountingDashboard = lazy(() => import("../Views/Accounting/AccountingDashboard"));
const ExpensesList = lazy(() => import("../Views/Accounting/ExpensesList"));
const AddEditExpense = lazy(() => import("../Views/Accounting/AddEditExpense"));
const ReportsDashboard = lazy(() => import("../Views/Accounting/ReportsDashboard"));
const FinancialStatements = lazy(() => import("../Views/Accounting/FinancialStatements"));

export const accountingRoutes = [
  {
    path: "accounting/dashboard",
    element: withRole(AccountingDashboard, [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  },
  {
    path: "accounting/expenses",
    element: withRole(ExpensesList, [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  },
  {
    path: "accounting/expenses/add",
    element: withRole(AddEditExpense, [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  },
  {
    path: "accounting/expenses/:id/edit",
    element: withRole(AddEditExpense, [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  },
  {
    path: "accounting/reports",
    element: withRole(ReportsDashboard, [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  },
  {
    path: "accounting/statements",
    element: withRole(FinancialStatements, [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  },
];