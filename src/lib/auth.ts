// Authentication utility functions

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Treat as expired if we can't parse it
  }
};

export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error("Error getting token expiration:", error);
    return null;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  if (isTokenExpired(token)) {
    clearAuthData();
    throw new Error("Token expired");
  }
  
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};
