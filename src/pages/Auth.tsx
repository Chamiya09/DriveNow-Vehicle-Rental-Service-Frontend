import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowLeft, Phone, Home, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Logo from "@/components/Logo";

const Auth = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    address?: string;
    confirmPassword?: string;
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

      // First verify login credentials and role with backend
      const checkResponse = await fetch("http://localhost:8090/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!checkResponse.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const checkData = await checkResponse.json();
      
      // Check if user is DRIVER role - redirect them
      if (checkData.role === "DRIVER") {
        toast.error("This login is for customers only. Please use the Driver Login.");
        setIsLoading(false);
        return;
      }

      // If role is correct (USER or ADMIN), store the token and user data
      localStorage.setItem("token", checkData.token);
      localStorage.setItem("user", JSON.stringify({
        id: checkData.id,
        name: checkData.name,
        email: checkData.email,
        role: checkData.role,
      }));

      // Redirect based on role: ADMIN to dashboard, USER to home
      window.location.href = checkData.role === "ADMIN" ? "/dashboard/admin" : "/";
      toast.success(`Welcome back, ${checkData.name}!`);
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;
      const phone = formData.get("phone") as string;
      const address = formData.get("address") as string;

      // Validation
      const newErrors: typeof errors = {};
      
      if (!name || name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }
      
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(email)) {
        newErrors.email = "Invalid email format";
      }
      
      if (!phone) {
        newErrors.phone = "Phone number is required";
      } else {
        // Remove all non-digit characters except leading +
        const cleanPhone = phone.replace(/[\s\-()]/g, "");
        // Check if it's a valid phone number (8-15 digits, optionally starting with +)
        if (!/^(\+?[1-9]\d{7,14})$/.test(cleanPhone)) {
          newErrors.phone = "Phone must be 8-15 digits (e.g., +1234567890 or 0712345678)";
        }
      }
      
      if (!address || address.trim().length < 5) {
        newErrors.address = "Address must be at least 5 characters";
      }
      
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        toast.error("Please fix the validation errors");
        return;
      }

      await register(name, email, password, phone.replace(/[\s-]/g, ""), address);
      toast.success("Account created successfully!");
      
      // Send welcome notification (will be delivered after login)
      // Store intent to send welcome notification
      localStorage.setItem("pendingWelcome", JSON.stringify({ name, email, role: "USER" }));
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
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
          className="flex items-center justify-center space-x-2 mb-8 group"
        >
          <Logo iconSize="h-6 w-6" />
          <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            DriveNow
          </span>
        </motion.div>

        <Card className="glass-card p-8 glow-primary">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className={errors.email ? "text-destructive" : ""}>
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.email ? "text-destructive" : "text-muted-foreground"}`} />
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
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
                        <Label htmlFor="login-password" className={errors.password ? "text-destructive" : ""}>
                          Password
                        </Label>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.password ? "text-destructive" : "text-muted-foreground"}`} />
                        <Input
                          id="login-password"
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
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Are you a driver?{" "}
                      <Link to="/driver/auth" className="text-primary hover:underline font-medium">
                        Driver Login
                      </Link>
                    </p>
                    
                    {/* Back to Home Link */}
                    <div className="mt-4">
                      <Link 
                        to="/" 
                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300"
                      >
                        <Home className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        <span className="font-medium">Back to Home</span>
                        <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className={errors.name ? "text-destructive" : ""}>
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.name ? "text-destructive" : "text-muted-foreground"}`} />
                        <Input
                          id="signup-name"
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          className={`pl-10 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          required
                          minLength={2}
                          onChange={() => setErrors(prev => ({ ...prev, name: undefined }))}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className={errors.email ? "text-destructive" : ""}>
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.email ? "text-destructive" : "text-muted-foreground"}`} />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
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
                      <Label htmlFor="signup-phone" className={errors.phone ? "text-destructive" : ""}>
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.phone ? "text-destructive" : "text-muted-foreground"}`} />
                        <Input
                          id="signup-phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter phone (e.g., 0712345678 or +94712345678)"
                          className={`pl-10 ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          required
                          onChange={() => setErrors(prev => ({ ...prev, phone: undefined }))}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-address" className={errors.address ? "text-destructive" : ""}>
                        Address
                      </Label>
                      <div className="relative">
                        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.address ? "text-destructive" : "text-muted-foreground"}`} />
                        <Input
                          id="signup-address"
                          name="address"
                          type="text"
                          placeholder="Enter your address"
                          className={`pl-10 ${errors.address ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          required
                          minLength={5}
                          onChange={() => setErrors(prev => ({ ...prev, address: undefined }))}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className={errors.password ? "text-destructive" : ""}>
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.password ? "text-destructive" : "text-muted-foreground"}`} />
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          placeholder="Create a password (min 6 characters)"
                          className={`pl-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          required
                          minLength={6}
                          onChange={() => setErrors(prev => ({ ...prev, password: undefined }))}
                        />
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className={errors.confirmPassword ? "text-destructive" : ""}>
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.confirmPassword ? "text-destructive" : "text-muted-foreground"}`} />
                        <Input
                          id="signup-confirm-password"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          className={`pl-10 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          required
                          minLength={6}
                          onChange={() => setErrors(prev => ({ ...prev, confirmPassword: undefined }))}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </form>
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
