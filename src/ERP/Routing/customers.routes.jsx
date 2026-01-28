import { lazy } from "react";

const CustomersList = lazy(() => import("../Views/Customers/CustomersList"));
const CustomerDetails = lazy(() => import("../Views/Customers/CustomerDetails"));
const AddEditCustomer = lazy(() => import("../Views/Customers/AddEditCustomer.jsx"));

export const customerRoutes = [
  { path: "sales/customers", element: <CustomersList /> },
  { path: "sales/customers/:id", element: <CustomerDetails /> },
  { path: "sales/customers/:id/edit", element: <AddEditCustomer /> },
];