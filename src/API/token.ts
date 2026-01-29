let accessToken: string | null = null;

// token.ts
export const getToken = () => localStorage.getItem("accessToken");

export const setToken = (token: string | null) => {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
};

export const clearToken = () => localStorage.removeItem("accessToken");