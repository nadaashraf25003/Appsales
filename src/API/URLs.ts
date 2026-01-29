const Urls = {
  AUTH: {
    LOGIN: "Auth/login",
    REGISTER: "Auth/register",
    VERIFY_EMAIL: "Auth/verify-email",
    FORGOT_PASSWORD: "Auth/forgot-password",
    RESET_PASSWORD: "Auth/reset-password",
    REFRESH_TOKEN: "Auth/refresh-token",
    RESEND_VERIFICATION: "Auth/resend-verification",
  },

  CUSTOMERS: {
    GET_ALL: "customers",
    GET_BY_ID: (id: number) => `customers/${id}`,
    CREATE: "customers",
    UPDATE: (id: number) => `customers/${id}`,
    DELETE: (id: number) => `customers/${id}`,
    STATEMENT: (id: number) => `customers/${id}/statement`,
  },

  EXPENSES: {
    GET_ALL: "Expenses",
    GET_BY_ID: (id: number) => `Expenses/${id}`,
    CREATE: "Expenses",
    UPDATE: (id: number) => `Expenses/${id}`,
    DELETE: (id: number) => `Expenses/${id}`,
  },

  USERS: {
    CREATE: "api/User/create",
    GET_BY_ID: (id: number) => `api/User/get/${id}`,
    GET_BY_TENANT: (tenantId: number) => `api/User/getByTenant/${tenantId}`,
    UPDATE: "api/User/update",
    DEACTIVATE: (id: number) => `api/User/deactivate/${id}`,
  },

  TENANTS: {
    CREATE: "api/Tenants/create",
    GET_BY_ID: (id: number) => `api/Tenants/get/${id}`,
    UPDATE: "api/Tenants/update",
    GET_ALL: "api/Tenants",
    DEACTIVATE: (id: number) => `api/Tenants/deactivate/${id}`,
  },

  SALES: {
    CREATE_ORDER: "sales/CreateOrder",
    UPDATE_ORDER: "sales/UpdateOrder",
    CANCEL_ORDER: "sales/cancelOrder",
    GET_ORDER_BY_ID: (id: number) => `sales/GetOrder/${id}`,
    GET_ORDERS_BY_BRANCH: (branchId: number) =>
      `sales/BranchOrders/${branchId}`,
    GET_ORDERS_BY_BRANCH_AND_STATUS: (branchId: number, status: string) =>
      `sales/Branch/${branchId}/Status/${status}`,
    GET_ORDERS_BY_TENANT: (tenantId: number) => `sales/Tenant/${tenantId}`,
    GET_ALL_ORDERS: "sales/AllOrders",
  },

  BRANCHES: {
    CREATE: "api/Branch/create",
    GET_BY_TENANT: (tenantId: number) =>
      `api/Branch/BranchesByTenant/${tenantId}`,
    UPDATE: "api/Branch/update",
    DEACTIVATE: (id: number) => `api/Branch/deactivate/${id}`,
  },

  ACCOUNTING: {
    CREATE_JOURNAL: "api/accounting/journal",
    GET_LEDGER: "api/accounting/ledger",
    GET_TRIAL_BALANCE: "api/accounting/trial-balance",
  },

  ITEMS: {
    GET_ALL: "api/item",
    GET_BY_ID: (id: number) => `api/item/${id}`,
    CREATE: "api/item",
    UPDATE: (id: number) => `api/item/${id}`,
    DELETE: (id: number) => `api/item/${id}`,
  },

  MATERIALS: {
    GET_ALL: "materials",
    GET_BY_ID: (id: number) => `materials/${id}`,
    CREATE: "materials",
    UPDATE: (id: number) => `materials/${id}`,
    DELETE: (id: number) => `materials/${id}`,
  },
  REPORTS: {
    INVENTORY: "reports/inventory",
    SALES: "reports/sales",
  },
};

export default Urls;
