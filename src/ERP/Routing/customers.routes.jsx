import { ROLES } from "@/Roles/roles";
import withRole from "@/Roles/withRole";
import { lazy } from "react";

const CustomersList = lazy(() => import("../Views/Customers/CustomersList"));
const CustomerDetails = lazy(() => import("../Views/Customers/CustomerDetails"));
const AddEditCustomer = lazy(() => import("../Views/Customers/AddEditCustomer.jsx"));

export const customerRoutes = [
  { path: "sales/customers", element: withRole(CustomersList, [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER, ROLES.TENANT_OWNER, ROLES.ACCOUNTANT , ROLES.CASHIER]) },
  { path: "sales/customers/:id", element: withRole(CustomerDetails, [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER, ROLES.TENANT_OWNER , ROLES.ACCOUNTANT , ROLES.CASHIER]) },
  { path: "sales/customers/:id/edit", element: withRole(AddEditCustomer, [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER, ROLES.TENANT_OWNER , ROLES.ACCOUNTANT , ROLES.CASHIER]) },
  { path: "sales/customers/add", element: withRole(AddEditCustomer, [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER, ROLES.TENANT_OWNER, ROLES.ACCOUNTANT , ROLES.CASHIER]) },

];