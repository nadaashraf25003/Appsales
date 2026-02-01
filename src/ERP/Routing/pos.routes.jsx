import { ROLES } from "@/Roles/roles";
import withRole from "@/Roles/withRole";
import { lazy } from "react";

const POSMain = lazy(() => import("../Views/POS/POSMain"));
const POSOrderDetails = lazy(() => import("../Views/POS/POSOrderDetails"));
const POSCustomerSelection = lazy(
  () => import("../Views/POS/POSCustomerSelection"),
); // Changed from POSCustomers

export const posRoutes = [
  {
    path: "sales/pos",
    element: withRole(POSMain, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
      ROLES.CASHIER,
      ROLES.ACCOUNTANT,
    ]),
  },
  { path: "sales/pos/order/:id", element: withRole(POSOrderDetails, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
      ROLES.CASHIER,
      ROLES.ACCOUNTANT,
    ]) },
  { path: "sales/pos/customers", element: withRole(POSCustomerSelection, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
      ROLES.CASHIER,
      ROLES.ACCOUNTANT,
    ]) },
];
