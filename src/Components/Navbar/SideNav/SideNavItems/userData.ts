import DefaultProfilePic from "@/assets/default-avatar.png";

const UserName = "shadcn";
const userEmail = "m@example.com";
const userRole = "Admin";

export const userData = {
  admin: {
    userTopNav: {
      name: UserName,
      email: userEmail,
      avatar: DefaultProfilePic,
      role: userRole,
      items: [
        { title: "Dashboard", url: "/dashboard" },
        { title: "Profile", url: "/profile" },
        { title: "Notifications", url: "/notifications" },
        { title: "Logout", url: "/logout" },
      ],
    },

    sideNav: [
      {
        section: "Main",
        icon: "Dashboard",
        items: [
          // { title: "Dashboard", icon: "Dashboard", url: "/erp/dashboard" },
          { title: "Profile", icon: "AccountCircle", url: "/profile" },
          {
            title: "Analytics",
            icon: "Analytics",
            url: "/dashboard/analytics",
          },
          {
            title: "Activities",
            icon: "Notifications",
            url: "/dashboard/activities",
          },
        ],
      },

      {
        section: "Dashboard",
        icon: "Dashboard",
        items: [
          { title: "Home", icon: "PointOfSale", url: "/erp/dashboard/home" },
          { title: "Sales Chart", icon: "ShoppingCart", url: "/erp/dashboard/sales-chart" },
          { title: "Recent Orders", icon: "AssignmentReturn", url: "/erp/dashboard/recent-orders" },
          { title: "Activities", icon: "People", url: "/erp/dashboard/activities" },
        ],
      },
      {
        section: "Sales",
        icon: "ShoppingCart",
        items: [
          { title: "POS", icon: "PointOfSale", url: "/sales/pos" },
          { title: "Orders", icon: "ShoppingCart", url: "/sales/orders" },
          { title: "Returns", icon: "AssignmentReturn", url: "/sales/returns" },
          { title: "Customers", icon: "People", url: "/sales/customers" },
        ],
      },

      {
        section: "Inventory",
        icon: "Inventory",
        items: [
          { title: "Products", icon: "Inventory", url: "/inventory/items" },
          {
            title: "Categories",
            icon: "Category",
            url: "/inventory/categories",
          },
          {
            title: "Suppliers",
            icon: "LocalShipping",
            url: "/inventory/suppliers",
          },
        ],
      },

      {
        section: "Accounting",
        icon: "AccountBalance",
        items: [
          { title: "Dashboard", icon: "AccountBalance", url: "/accounting" },
          { title: "Expenses", icon: "Receipt", url: "/accounting/expenses" },
          { title: "Reports", icon: "Assessment", url: "/accounting/reports" },
          {
            title: "Statements",
            icon: "BarChart",
            url: "/accounting/statements",
          },
        ],
      },

      {
        section: "Settings",
        icon: "Settings",
        items: [
          { title: "General", icon: "Settings", url: "/settings/general" },
          { title: "Financial", icon: "Paid", url: "/settings/financial" },
          { title: "Users", icon: "Group", url: "/settings/users" },
          {
            title: "Organization",
            icon: "Apartment",
            url: "/settings/organization",
          },
        ],
      },
    ],

    routes: {
      auth: [
        { path: "/login", name: "Login" },
        { path: "/register", name: "Register" },
        { path: "/register/verify", name: "Verify Email" },
        { path: "/register/success", name: "Verification Success" },
      ],

      setup: [
        { path: "/setup", name: "Basic Info" },
        { path: "/setup/address", name: "Address Info" },
        { path: "/setup/financial", name: "Financial Info" },
      ],

      dashboard: [
        { path: "/dashboard", name: "Main Dashboard" },
        { path: "/dashboard/sales-chart", name: "Sales Chart" },
        { path: "/dashboard/recent-orders", name: "Recent Orders" },
        { path: "/dashboard/activities", name: "Activities" },
      ],

      sales: [
        { path: "/sales/pos", name: "POS" },
        { path: "/sales/pos/order/:id", name: "POS Order Details" },
        { path: "/sales/orders", name: "Orders" },
        { path: "/sales/orders/:id", name: "Order Details" },
        { path: "/sales/returns", name: "Returns" },
        { path: "/sales/customers", name: "Customers" },
        { path: "/sales/customers/:id", name: "Customer Details" },
        { path: "/sales/customers/:id/edit", name: "Edit Customer" },
      ],

      inventory: [
        { path: "/inventory/items", name: "Products" },
        { path: "/inventory/items/:id/edit", name: "Edit Product" },
        { path: "/inventory/categories", name: "Categories" },
        { path: "/inventory/suppliers", name: "Suppliers" },
      ],

      accounting: [
        { path: "/accounting", name: "Accounting Dashboard" },
        { path: "/accounting/expenses", name: "Expenses" },
        { path: "/accounting/expenses/:id/edit", name: "Edit Expense" },
        { path: "/accounting/reports", name: "Reports" },
        { path: "/accounting/statements", name: "Financial Statements" },
      ],

      common: [
        { path: "/loading", name: "Loading" },
        { path: "/error", name: "Error" },
        { path: "*", name: "Not Found" },
      ],
    },
  },
};
