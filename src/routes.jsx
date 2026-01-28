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
import { authRoutes } from "./ERP/Routing/auth.routes"; // Import the lazy-loaded array

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App usually contains your NavbarLayout
    children: [
      // 1. Root Redirect: Sends users to ERP by default
      { index: true, element: <Navigate to="/erp" replace /> },

      // 2. ERP Module (Wrapped in ERPLayout)
      {
        path: "erp",
        element: <ERPLayout />,
        children: [
          ...adminRoutes,    // Dashboard, Users
          ...posRoutes,      // POS Terminal
          ...salesRoutes,    // Sales & Returns
          ...customerRoutes, // Customers List
        ],
      },

      // 3. Auth Module (Nested under /erp/auth)
      {
        path: "erp/auth",
        element: <AuthLayout />, // Wraps the login/register/verify forms
        children: authRoutes,    // Spreads: login, register, verify-email, etc.
      },

      // 4. E-commerce Module
      {
        path: "shop",
        element: <ShopLayout />,
        children: [
          // { path: "products", element: <Products /> },
        ],
      },

      // 5. Catch-all: Redirects any unknown route back to ERP
      {
        path: "*",
        element: <Navigate to="/erp" replace />,
      },
    ],
  },
]);