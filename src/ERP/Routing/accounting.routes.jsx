import { lazy } from "react";

// All files are in the same directory: src/ERP/Views/Accounting/
const AccountingDashboard = lazy(() => import("../Views/Accounting/AccountingDashboard"));
const ExpensesList = lazy(() => import("../Views/Accounting/ExpensesList"));
const AddEditExpense = lazy(() => import("../Views/Accounting/AddEditExpense"));
const ReportsDashboard = lazy(() => import("../Views/Accounting/ReportsDashboard"));
const FinancialStatements = lazy(() => import("../Views/Accounting/FinancialStatements"));

export const accountingRoutes = [
  {
    path: "accounting",
    element: <AccountingDashboard />,
  },
  {
    path: "accounting/expenses",
    element: <ExpensesList />,
  },
  {
    path: "accounting/expenses/add",
    element: <AddEditExpense />,
  },
  {
    path: "accounting/expenses/:id/edit",
    element: <AddEditExpense />,
  },
  {
    path: "accounting/reports",
    element: <ReportsDashboard />,
  },
  {
    path: "accounting/statements",
    element: <FinancialStatements />,
  },
];