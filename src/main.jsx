// React
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Styles
import "./index.css";

// Router
import { router } from "./routes.jsx";

// UI
import Loader from "./Components/Global/Loader.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);
