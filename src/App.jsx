import { Outlet } from "react-router-dom";

// Theme
import { ThemeProvider } from "@/utils/ThemeProvider";
import ThemeToggle from "@/Components/UI/ThemeToggle";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Toasts
import ConfirmToast from "@/Components/Global/ConfirmToast.jsx";
import { Toaster } from "react-hot-toast";

// UX
import ScrollToTop from "@/utils/ScrollToTop";

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
          <ThemeToggle />
          <ScrollToTop />

          {/* Routes render here */}
          <Outlet />

          {/* Global UI */}
          <ConfirmToast />
          <Toaster toastOptions={{ duration: 5000 }} />
        </div>

        {/* Dev only */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
