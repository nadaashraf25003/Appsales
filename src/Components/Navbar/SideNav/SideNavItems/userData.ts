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
        { title: "Dashboard", url: "/erp" },
        { title: "Profile", url: "/erp/profile" },
        { title: "Notifications", url: "/erp/notifications" },
        { title: "Logout", url: "/logout" },
      ],
    },

    sideNav: [
      {
        section: "Main",
        icon: "Dashboard",
        items: [
          { title: "Dashboard", icon: "Dashboard", url: "/erp" },
          { title: "Profile", icon: "AccountCircle", url: "/erp/profile" },
          { title: "Analytics", icon: "Analytics", url: "/erp/dashboard/analytics" },
          { title: "Activities", icon: "Notifications", url: "/erp/dashboard/activities" },
        ],
      },

      {
        section: "Sales",
        icon: "ShoppingCart",
        items: [
          { title: "POS", icon: "PointOfSale", url: "/erp/sales/pos" },
          { title: "Orders", icon: "ShoppingCart", url: "/erp/sales/orders" },
          { title: "Returns", icon: "AssignmentReturn", url: "/erp/sales/returns" },
          { title: "Customers", icon: "People", url: "/erp/sales/customers" },
        ],
      },

      {
        section: "Inventory",
        icon: "Inventory",
        items: [
          { title: "Products", icon: "Inventory", url: "/erp/inventory/items" },
          { title: "Categories", icon: "Category", url: "/erp/inventory/categories" },
          { title: "Suppliers", icon: "LocalShipping", url: "/erp/inventory/suppliers" },
        ],
      },

      {
        section: "Accounting",
        icon: "AccountBalance",
        items: [
          { title: "Dashboard", icon: "AccountBalance", url: "/erp/accounting" },
          { title: "Expenses", icon: "Receipt", url: "/erp/accounting/expenses" },
          { title: "Reports", icon: "Assessment", url: "/erp/accounting/reports" },
          { title: "Statements", icon: "BarChart", url: "/erp/accounting/statements" },
        ],
      },

      {
        section: "Settings",
        icon: "Settings",
        items: [
          { title: "General", icon: "Settings", url: "/erp/settings/general" },
          { title: "Financial", icon: "Paid", url: "/erp/settings/financial" },
          { title: "Users", icon: "Group", url: "/erp/settings/users" },
          { title: "Organization", icon: "Apartment", url: "/erp/settings/organization" },
        ],
      },
    ],

    /* Reference mapping for breadcrumbs or lookups */
    routes: {
      auth: [
        { path: "/erp/auth/login", name: "Login" },
        { path: "/erp/auth/register", name: "Register" },
      ],
      sales: [
        { path: "/erp/sales/pos", name: "POS" },
        { path: "/erp/sales/pos/order/:id", name: "POS Order Details" },
        { path: "/erp/sales/orders", name: "Orders" },
        { path: "/erp/sales/orders/:id", name: "Order Details" },
        { path: "/erp/sales/returns", name: "Returns" },
        { path: "/erp/sales/customers", name: "Customers" },
        { path: "/erp/sales/customers/:id", name: "Customer Details" },
        { path: "/erp/sales/customers/:id/edit", name: "Edit Customer" },
      ],
      inventory: [
        { path: "/erp/inventory/items", name: "Products" },
        { path: "/erp/inventory/categories", name: "Categories" },
        { path: "/erp/inventory/suppliers", name: "Suppliers" },
      ],
      accounting: [
        { path: "/erp/accounting", name: "Accounting Dashboard" },
        { path: "/erp/accounting/expenses", name: "Expenses" },
        { path: "/erp/accounting/expenses/add", name: "Add Expense" },
        { path: "/erp/accounting/expenses/:id/edit", name: "Edit Expense" },
        { path: "/erp/accounting/reports", name: "Reports" },
        { path: "/erp/accounting/statements", name: "Financial Statements" },
      ],
    },
  },
};
