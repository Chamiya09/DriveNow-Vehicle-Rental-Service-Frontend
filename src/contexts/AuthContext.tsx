import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  profileImage?: string;
  licenseNumber?: string;
  joinDate?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  handleUnauthorized: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing auth on mount and validate token
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (storedToken && storedUser) {
        try {
          // Fetch fresh user data from backend to ensure all fields are present
          const response = await fetch("http://localhost:8090/api/auth/me", {
            headers: {
              "Authorization": `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            const updatedUser = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              phone: userData.phone,
              licenseNumber: userData.licenseNumber,
              profileImage: userData.profileImage,
              joinDate: userData.joinDate,
            };
            
            // Update localStorage with fresh data
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            setToken(storedToken);
            setUser(updatedUser);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Session validation failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Call backend API
      const response = await fetch("http://localhost:8090/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        profileImage: data.profileImage,
      }));
      
      setToken(data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        profileImage: data.profileImage,
      });

      toast.success(`Welcome back, ${data.name}!`);
      
      // Navigate based on role
      if (data.role === "ADMIN") {
        navigate("/dashboard/admin");
      } else if (data.role === "DRIVER") {
        navigate("/dashboard/driver");
      } else {
        navigate("/dashboard/user");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      setIsLoading(true);
      
      // Call backend API
      const response = await fetch("http://localhost:8090/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone: phone || "" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        profileImage: data.profileImage,
      }));
      
      setToken(data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        profileImage: data.profileImage,
      });

      toast.success("Account created successfully!");
      navigate("/dashboard/user");
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.error("Session expired. Please login again.");
    navigate("/auth");
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    handleUnauthorized,
    updateUser,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
