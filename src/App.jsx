import { useState } from "react";
import { Outlet } from "react-router-dom";

// Layout & Theme
import NavbarLayout from "@/Components/Navbar/NavbarLayout";
import { ThemeProvider } from "@/utils/ThemeProvider";
import ThemeToggle from "@/Components/UI/ThemeToggle";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Notifications & UX
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@/utils/ScrollToTop";

// Initialize Query Client with performance-minded defaults
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
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {/* Core Layout Container */}
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground dark:bg-gray-900 transition-colors duration-300">
          
          {/* Global UX Helpers */}
          <ScrollToTop />
          <ThemeToggle />

          {/* NavbarLayout acts as the shell. 
              It internally manages TopNav and SideNav visibility based on the URL.
          */}
          <NavbarLayout>
            <Outlet /> 
          </NavbarLayout>

          {/* Global Notifications */}
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              duration: 5000,
              className: "dark:bg-gray-800 dark:text-white border dark:border-gray-700",
            }} 
          />
        </div>

        {/* Query DevTools - Visible only in development mode */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}