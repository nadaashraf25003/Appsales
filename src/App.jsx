import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useState } from "react";

// Layout components
import NavbarLayout from "@/Components/Navbar/NavbarLayout";
// Theme
import { ThemeProvider } from "@/utils/ThemeProvider";
import ThemeToggle from "@/Components/UI/ThemeToggle";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Toasts
import { ConfirmToast } from "@/Components/Global/ConfirmToast";
import { Toaster } from "react-hot-toast";

// UX
import ScrollToTop from "@/utils/ScrollToTop";

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground dark:bg-gray-800 m-0">
          {/* Global UI Elements */}
          <ThemeToggle />
          <ScrollToTop />

          {/* Dashboard Layout */}
          <NavbarLayout>
            <Outlet /> {/* Routes render here */}
          </NavbarLayout>

          {/* Global Notifications */}
          {/* <ConfirmToast /> */}
          <Toaster toastOptions={{ duration: 5000 ,  className: "dark:bg-dark dark:text-light", }} position="top-right"  />
        </div>

        {/* Dev Tools (only shows during npm run dev) */}
        {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
