import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

const DriverAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      // Validation
      const newErrors: typeof errors = {};
      
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(email)) {
        newErrors.email = "Invalid email format";
      }
      
      if (!password) {
        newErrors.password = "Password is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        toast.error("Please fix the validation errors");
        return;
      }

      // Verify login credentials and role with backend
      const response = await fetch("http://localhost:8090/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const data = await response.json();
      
      // Check if user is a DRIVER role
      if (data.role !== "DRIVER") {
        toast.error("This login is for drivers only. Please use the Customer Login.");
        setIsLoading(false);
        return;
      }

      // Store the token and user data directly
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      }));

      // Redirect to driver dashboard
      window.location.href = "/dashboard/driver";
      toast.success(`Welcome back, ${data.name}!`);
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-gradient-hero opacity-5" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center space-x-2 mb-8"
        >
          <div className="flex flex-col items-center gap-2 group">
            <div className="flex items-center space-x-2">
              <Logo iconSize="h-6 w-6" />
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                DriveNow
              </span>
            </div>
            <span className="text-xs text-muted-foreground tracking-widest uppercase">Driver Portal</span>
          </div>
        </motion.div>

        <Card className="glass-card p-8 glow-primary">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Driver Login</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to access your driver dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driver-email" className={errors.email ? "text-destructive" : ""}>
                Email
              </Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.email ? "text-destructive" : "text-muted-foreground"}`} />
                <Input
                  id="driver-email"
                  name="email"
                  type="email"
                  placeholder="Enter your driver email"
                  className={`pl-10 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  required
                  onChange={() => setErrors(prev => ({ ...prev, email: undefined }))}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="driver-password" className={errors.password ? "text-destructive" : ""}>
                  Password
                </Label>
                <Link
                  to="/driver/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.password ? "text-destructive" : "text-muted-foreground"}`} />
                <Input
                  id="driver-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className={`pl-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  required
                  onChange={() => setErrors(prev => ({ ...prev, password: undefined }))}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In as Driver"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Not a driver?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link to="/auth" className="text-sm text-primary hover:underline font-medium">
                Customer Login
              </Link>
            </div>

            {/* Back to Home Link */}
            <div className="text-center">
              <Link 
                to="/" 
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300"
              >
                <Home className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="font-medium">Back to Home</span>
                <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground font-medium mb-2">
                Driver Access Information:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Contact admin to get your driver credentials</li>
                <li>• Ensure your license is up to date</li>
                <li>• Access trip assignments and earnings</li>
              </ul>
            </div>
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          Need help? Contact{" "}
          <a href="mailto:support@drivenow.com" className="text-primary hover:underline">
            support@drivenow.com
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DriverAuth;
