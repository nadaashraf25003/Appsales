import { Link } from "react-router-dom";
import TopNav from "./TopNavLanding";
import {
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  CreditCard,
  Receipt,
  Settings,
  Database,
  ArrowRight,
  Cpu,
  Rocket,
  CheckCircle,
  ShieldCheck,
  Headphones,
  Globe,
  Sparkles,
  Zap,
  BarChart,
  Building,
  Cloud,
  Lock,
  RefreshCw,
} from "lucide-react";

export default function ERPLandingPage() {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  // Get user role from localStorage
  const user = localStorage.getItem("user");
  const role = user ? JSON.parse(user).role : null;

  const erpFeatures = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "POS System",
      desc: "Modern point-of-sale with offline mode, receipt printing, and fast checkout",
      link: "/erp/sales/pos",
      color: "from-primary to-secondary",
      stats: "Fast checkout",
      highlight: true,
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Inventory",
      desc: "Real-time stock tracking, low inventory alerts, bundles management",
      link: "/erp/dashboard/home",
      color: "from-info to-primary",
      stats: "Real-time",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics",
      desc: "Advanced sales analytics, financial reports, and business insights",
      link: "/erp/accounting/expenses",
      color: "from-success to-info",
      stats: "AI Insights",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "CRM",
      desc: "Complete customer management with loyalty programs and segmentation",
      link: "/erp/sales/customers",
      color: "from-warning to-success",
      stats: "360° View",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Accounting",
      desc: "Full accounting suite, expense tracking, tax calculations, payroll",
      link: "/erp/accounting/dashboard",
      color: "from-primary to-info",
      stats: "Auto Tax",
    },
    {
      icon: <Receipt className="w-8 h-8" />,
      title: "Billing",
      desc: "Automated invoicing, recurring billing, payment tracking",
      link: "/erp/dashboard/home",
      color: "from-info to-success",
      stats: "Auto Invoice",
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Configuration",
      desc: "System settings, user roles, permissions, and custom workflows",
      link: "/erp/users",
      color: "from-gray-500 to-gray-700",
      stats: "Flexible",
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Data Management",
      desc: "Import/export tools, automated backups, data migration",
      link: "/erp/dashboard/home",
      color: "from-secondary to-warning",
      stats: "Secure",
    },
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized for performance with instant load times",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Bank-Level Security",
      description: "End-to-end encryption and GDPR compliance",
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Auto Updates",
      description: "Always on the latest version with zero downtime",
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud & On-Premise",
      description: "Choose your deployment method",
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: "Enterprise Ready",
      description: "Scale from startup to enterprise seamlessly",
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Smart Insights",
      description: "AI-powered business intelligence",
    },
  ];

  return (
    <div className="font-sans bg-gradient-to-b from-light/50 via-white to-light/30 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg text-gray-900 dark:text-light min-h-screen">
      {/* TOP NAV */}
      <TopNav />

      {/* HERO SECTION */}
      <section className="pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 dark:from-dark-primary/5 dark:to-dark-secondary/5 -skew-y-6"></div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-full px-4 py-2 mb-6 animate-pulse border border-primary/20 dark:border-dark-primary/30">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                All-in-One ERP Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="block bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent dark:from-dark-primary dark:via-purple-400 dark:to-dark-secondary">
                AppSales ERP
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl text-gray-600 dark:text-gray-300 mt-4">
                Your Business, Unified
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10 px-4">
              Streamline your entire business operations from sales and
              inventory to accounting and customer management – all in one
              powerful, intuitive ERP suite.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              {!isLoggedIn && (
                <>
                  <Link
                    to="/erp/auth/register"
                    className="group relative bg-gradient-to-r from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary text-white font-bold px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-3 overflow-hidden"
                  >
                    <span className="relative">Create New Account</span>
                    <Rocket className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Link>

                  <Link
                    to="/erp/auth/login"
                    className="group card bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 font-bold px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-3 hover:border-primary/30 dark:hover:border-dark-primary/50"
                  >
                    <span>Existing User? Login</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}

              {isLoggedIn &&
                (role === "Cashier" ? (
                  <Link
                    to="/erp/profile"
                    className="btn-primary group px-8 py-4 flex items-center gap-3"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    to="/erp/dashboard/home"
                    className="btn-primary group px-8 py-4 flex items-center gap-3"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
            </div>

            {/* Preview Image/Placeholder */}
            <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-dark-card p-2">
              <div className="aspect-video bg-gradient-to-r from-primary/20 via-info/20 to-secondary/20 dark:from-dark-primary/20 dark:via-dark-info/20 dark:to-dark-secondary/20 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-20 h-20 mx-auto text-primary/40 dark:text-dark-primary/40 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    ERP Dashboard Preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-16 px-4 sm:px-6" id="benefits">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="card p-6 hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-dark-primary/20 dark:to-dark-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-primary dark:text-dark-primary">
                      {benefit.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ERP FEATURES */}
      <section
        className="py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50 dark:from-dark-bg dark:to-dark-card"
        id="modules"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary rounded-full px-4 py-2 mb-4">
              <Cpu className="w-4 h-4" />
              <span className="text-sm font-semibold">Complete ERP Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Everything Your Business Needs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful, integrated tools that work together seamlessly to
              streamline your operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {erpFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className={`card group relative overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border ${
                  feature.highlight
                    ? "border-primary/30 dark:border-dark-primary/50"
                    : "border-gray-100 dark:border-gray-800"
                }`}
              >
                <div className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white mb-6`}
                  >
                    {feature.icon}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-dark-primary transition-colors">
                        {feature.title}
                      </h3>
                      {feature.highlight && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {feature.stats}
                    </span>
                    <div className="flex items-center text-primary dark:text-dark-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm">Explore</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4 sm:px-6" id="cta">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card bg-gradient-to-r from-primary/5 via-info/5 to-secondary/5 dark:from-dark-primary/10 dark:via-dark-info/10 dark:to-dark-secondary/10 border border-primary/20 dark:border-dark-primary/30 p-8 sm:p-12 rounded-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that have streamlined their
              operations with AppSales ERP
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={
                  !isLoggedIn
                    ? "/erp/auth/register" // not logged in -> go to register
                    : role === "Cashier"
                      ? "/erp/profile" // Cashier -> go to profile
                      : "/erp/dashboard/home" // Other logged-in roles -> dashboard
                }
                className="btn-primary px-8 py-4 text-lg font-bold"
              >
                {isLoggedIn ? "Go to Dashboard" : "Create New Account"}
              </Link>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
              No credit card required • 30-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
