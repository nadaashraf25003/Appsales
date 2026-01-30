import DefaultProfilePic from "@/assets/default-avatar.png";

/* =======================
   Types
======================= */

export type Role =
  | "SuperAdmin"
  | "TenantOwner"
  | "BranchManager"
  | "Cashier"
  | "Accountant";

interface User {
  name: string;
  email: string;
  role: Role;
}

interface NavItem {
  title: string;
  icon: string;
  url: string;
  roles?: Role[]; // 👈 allowed roles
}

interface NavSection {
  section: string;
  icon: string;
  items: NavItem[];
}

/* =======================
   Get user from localStorage
======================= */

let user: User | null = null;

try {
  const userString = localStorage.getItem("user");
  user = userString ? JSON.parse(userString) : null;
  // console.log("Parsed user from localStorage:", user);
} catch (error) {
  console.error("Error parsing user from localStorage:", error);
}

const userName = user?.name || "shadcn";
const userEmail = user?.email || "m@example.com";
const userRole: Role = user?.role || "SuperAdmin";

/* =======================
   Role-based filter
======================= */

function filterSideNavByRole(
  sideNav: NavSection[],
  role: Role
): NavSection[] {
  return sideNav
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(role)
      ),
    }))
    .filter((section) => section.items.length > 0);
}

/* =======================
   Base navigation config
======================= */

const sideNav: NavSection[] = [
  {
    section: "Main",
    icon: "Dashboard",
    items: [
      {
        title: "Profile",
        icon: "AccountCircle",
        url: "/erp/profile",
      },
      {
        title: "Activities",
        icon: "Notifications",
        url: "/erp/dashboard/activities",
      },
      {
        title: "Customers",
        icon: "People",
        url: "/erp/sales/customers",
        roles: ["SuperAdmin", "TenantOwner", "BranchManager", "Accountant", "Cashier"],
      },
    ],
  },

  {
    section: "Dashboard",
    icon: "Dashboard",
    items: [
      {
        title: "Home",
        icon: "PointOfSale",
        url: "/erp/dashboard/home",
        roles: ["SuperAdmin", "TenantOwner", "Accountant", "BranchManager"],
      },
      {
        title: "Sales Chart",
        icon: "ShoppingCart",
        url: "/erp/dashboard/sales-chart",
        roles: ["SuperAdmin", "TenantOwner", "Accountant"],
      },
      {
        title: "Recent Orders",
        icon: "AssignmentReturn",
        url: "/erp/dashboard/recent-orders",
      },
    ],
  },

  {
    section: "Sales",
    icon: "ShoppingCart",
    items: [
      {
        title: "POS",
        icon: "PointOfSale",
        url: "/erp/sales/pos",
        roles: ["Cashier", "BranchManager","SuperAdmin"],
      },
      {
        title: "Orders",
        icon: "ShoppingCart",
        url: "/erp/sales/orders",
        roles: ["BranchManager", "TenantOwner", "SuperAdmin"],
      },
      {
        title: "Returns",
        icon: "AssignmentReturn",
        url: "/erp/sales/returns",
        roles: ["BranchManager", "SuperAdmin"],
      },
    ],
  },

  {
    section: "Inventory",
    icon: "Inventory",
    items: [
      {
        title: "Products",
        icon: "Inventory",
        url: "/erp/inventory/items",
        roles: ["SuperAdmin", "TenantOwner", "BranchManager"],
      },
      {
        title: "Categories",
        icon: "Category",
        url: "/erp/inventory/categories",
      },
      {
        title: "Suppliers",
        icon: "LocalShipping",
        url: "/erp/inventory/suppliers",
      },
    ],
  },

  {
    section: "Accounting",
    icon: "AccountBalance",
    items: [
      {
        title: "Dashboard",
        icon: "AccountBalance",
        url: "/erp/accounting",
        roles: ["SuperAdmin", "Accountant"],
      },
      {
        title: "Expenses",
        icon: "Receipt",
        url: "/erp/accounting/expenses",
        roles: ["Accountant"],
      },
      {
        title: "Reports",
        icon: "Assessment",
        url: "/erp/accounting/reports",
        roles: ["SuperAdmin", "Accountant"],
      },
      {
        title: "Statements",
        icon: "BarChart",
        url: "/erp/accounting/statements",
        roles: ["SuperAdmin", "Accountant"],
      },
    ],
  },

  {
    section: "Organization",
    icon: "Apartment",
    items: [
      {
        title: "Users",
        icon: "Group",
        url: "/erp/users",
        roles: ["SuperAdmin"],
      },
      {
        title: "Branches",
        icon: "Domain",
        url: "/erp/branches",
        roles: ["SuperAdmin", "TenantOwner", "BranchManager"],
      },
      {
        title: "Create Branch",
        icon: "Add",
        url: "/erp/branches/create",
        roles: ["SuperAdmin", "TenantOwner", "BranchManager"],
      },
      {
        title: "Tenants",
        icon: "Domain",
        url: "/erp/tenants",
        roles: ["SuperAdmin", "TenantOwner"],
      },
      {
        title: "Create Tenant",
        icon: "Add",
        url: "/erp/tenants/create",
        roles: ["SuperAdmin", "TenantOwner"],
      },
    ],
  },
];

/* =======================
   Exported user data
======================= */

export const userData = {
  admin: {
    userTopNav: {
      name: userName,
      email: userEmail,
      avatar: DefaultProfilePic,
      role: userRole,
      items: [
        { title: "Profile", url: "/erp/profile" },
        { title: "Logout", url: "/logout" },
      ],
    },

    sideNav: filterSideNavByRole(sideNav, userRole),

    routes: {
      auth: [
        { path: "/erp/auth/login", name: "Login" },
        { path: "/erp/auth/register", name: "Register" },
      ],
    },
  },
};
