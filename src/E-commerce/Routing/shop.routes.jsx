import { lazy } from "react";

const ShopHome = lazy(() => import("@/E-commerce/Views/Shop/Home"));
const ProductDetails = lazy(() => import("@/E-commerce/Views/Shop/ProductDetails"));

export const shopRoutes = [
  { index: true, element: <ShopHome /> },
  { path: "product/:id", element: <ProductDetails /> },
];
