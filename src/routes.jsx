import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import App from "./App";
import ERPLayout from "./ERP/Views/ERPLayout";
import ShopLayout from "./E-commerce/Views/Shop/ShopLayout";
import AuthLayout from "./ERP/Views/Auth/AuthLayout";

// ERP Route Modules
import { posRoutes } from "./ERP/Routing/pos.routes";
import { salesRoutes } from "./ERP/Routing/sales.routes";
import { customerRoutes } from "./ERP/Routing/customers.routes";
import { adminRoutes } from "./ERP/Routing/admin.routes";
import { authRoutes } from "./ERP/Routing/auth.routes";
import { accountingRoutes } from "./ERP/Routing/accounting.routes"; // 1. Added Accounting Import

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      // 1. Root Redirect
      { index: true, element: <Navigate to="/erp" replace /> },

      // 2. ERP Module (Wrapped in ERPLayout)
      {
        path: "erp",
        element: <ERPLayout />,
        children: [
          ...adminRoutes,      // Dashboard, Users
          ...posRoutes,        // POS Terminal
          ...salesRoutes,      // Sales & Returns
          ...customerRoutes,   // Customers List
          ...accountingRoutes, // 2. Added Accounting Spread
        ],
      },

      // 3. Auth Module (Nested under /erp/auth)
      {
        path: "erp/auth",
        element: <AuthLayout />, 
        children: authRoutes, 
      },

      // 4. E-commerce Module
      {
        path: "shop",
        element: <ShopLayout />,
        children: [
          // Add ecommerce routes here
        ],
      },

      // 5. Catch-all
      {
        path: "*",
        element: <Navigate to="/erp" replace />,
      },
    ],
  },
]);