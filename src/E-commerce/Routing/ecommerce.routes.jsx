import { lazy } from "react";
import { shopRoutes } from "./shop.routes";
import { ecommerceAuthRoutes as authRoutes } from "./auth.routes";


const ShopLayout = lazy(() => import("@/E-commerce/Views/Shop/ShopLayout"));

export const ecommerceRoutes = [
  {
    path: "/",
    element: <ShopLayout />,
    children: [...shopRoutes, ...authRoutes],
  },
];
