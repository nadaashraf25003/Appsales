// TopNavLanding.jsx
import { Link } from "react-router-dom";
import { getToken } from "@/API/token";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function TopNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);

    const handleStorageChange = () => setIsLoggedIn(!!getToken());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  // Get user role from localStorage
  const user = localStorage.getItem("user");
  const role = user ? JSON.parse(user).role : null;

  const navLinks = [
    { label: "Features", href: "#benefits" },
    { label: "Modules", href: "#modules" },
    // { label: "Pricing", href: "/pricing" },
    // { label: "Customers", href: "#customers" },
    // { label: "Resources", href: "#resources" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-primary dark:text-dark-primary">
                AppSales
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-dark-primary transition-colors font-medium text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              {!isLoggedIn && (
                <>
                  <Link
                    to="/erp/auth/login"
                    className="text-primary dark:text-dark-primary hover:text-primary/80 dark:hover:text-dark-primary/80 transition-colors font-medium text-sm px-4 py-2"
                  >
                    Sign In
                  </Link>
                  
                  <Link
                    to="/erp/auth/register"
                    className="btn-primary px-6 py-2 text-sm"
                  >
                    Get Started Free
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <>
                  <Link
                    to="/erp/dashboard/home"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-dark-primary transition-colors font-medium text-sm px-4 py-2"
                  >
                    Visit Store
                  </Link>
                  <Link
                    to={role === "Cashier" ? "/erp/profile" : "/erp/dashboard/home"}
                    className="btn-primary px-6 py-2 text-sm"
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-dark-primary transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-dark-primary transition-colors py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              {!isLoggedIn ? (
                <div className="space-y-3">
                  <Link
                    to="/erp/auth/login"
                    className="block text-center text-primary dark:text-dark-primary font-medium py-3 border border-primary dark:border-dark-primary rounded-xl hover:bg-primary/5 dark:hover:bg-dark-primary/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/erp/auth/register"
                    className="block text-center btn-primary py-3 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </div>
              ) : (

                <div className="space-y-3">
                  <Link
                    to={role === "Cashier" ? "/erp/profile" : "/erp/dashboard/home"}
                    className="block text-center btn-primary py-3 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/erp/sales/pos"
                    className="block text-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-dark-primary transition-colors py-3 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Visit Store
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
