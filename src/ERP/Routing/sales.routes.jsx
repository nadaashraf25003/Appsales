import { ROLES } from "@/Roles/roles";
import withRole from "@/Roles/withRole";
import { lazy } from "react";

const SalesList = lazy(() => import("../Views/Sales/SalesList")); // Changed from SalesOrdersList
const SalesOrderDetails = lazy(
  () => import("../Views/Sales/SalesOrderDetails"),
);
const SalesReturns = lazy(() => import("../Views/Sales/SalesReturns"));

export const salesRoutes = [
  {
    path: "sales/orders",
    element: withRole(SalesList, [
     ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
      ROLES.CASHIER,
      ROLES.ACCOUNTANT,
    ]),
  },
  { path: "sales/orders/:id", element: withRole(SalesOrderDetails, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
      ROLES.CASHIER,
      ROLES.ACCOUNTANT,
    ]) },
  { path: "sales/returns", element: withRole(SalesReturns, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
      ROLES.CASHIER,
      ROLES.ACCOUNTANT,
    ]) },
];
