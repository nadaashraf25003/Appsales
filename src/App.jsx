import { Outlet } from "react-router-dom";

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

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
          {/* Global UI Elements */}
          <ThemeToggle />
          <ScrollToTop />

          {/* CRITICAL: This renders the child routes 
              defined in routes.jsx (ERP, E-commerce, etc.) 
          */}
          <Outlet />

          {/* Global Notifications */}
          <ConfirmToast />
          <Toaster toastOptions={{ duration: 5000 }} />
        </div>

        {/* Dev Tools (only shows during npm run dev) */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;