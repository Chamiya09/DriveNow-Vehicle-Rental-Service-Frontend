import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import VehicleDetail from "./pages/VehicleDetail";
import Auth from "./pages/Auth";
import DriverAuth from "./pages/DriverAuth";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminDrivers from "./pages/AdminDrivers";
import AdminVehicles from "./pages/AdminVehicles";
import AdminBookings from "./pages/AdminBookings";
import AdminReviews from "./pages/AdminReviews";
import AdminDriverReviews from "./pages/AdminDriverReviews";
import AdminVehicleReviews from "./pages/AdminVehicleReviews";
import AdminMessages from "./pages/AdminMessages";
import AdminComplaints from "./pages/AdminComplaints";
import DriverDashboard from "./pages/DriverDashboard";
import BookingFlow from "./pages/BookingFlow";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Reviews from "./pages/Reviews";
import DriverReviews from "./pages/DriverReviews";
import AdminSettings from "./pages/AdminSettings";
import DriverSettings from "./pages/DriverSettings";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/driver-reviews" element={<DriverReviews />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/driver/auth" element={<DriverAuth />} />
              <Route path="/booking/:id" element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
              <Route path="/dashboard/user" element={<ProtectedRoute requiredRole="USER"><UserDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="ADMIN"><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/drivers" element={<ProtectedRoute requiredRole="ADMIN"><AdminDrivers /></ProtectedRoute>} />
              <Route path="/admin/vehicles" element={<ProtectedRoute requiredRole="ADMIN"><AdminVehicles /></ProtectedRoute>} />
              <Route path="/admin/bookings" element={<ProtectedRoute requiredRole="ADMIN"><AdminBookings /></ProtectedRoute>} />
              <Route path="/admin/reviews" element={<ProtectedRoute requiredRole="ADMIN"><AdminReviews /></ProtectedRoute>} />
              <Route path="/admin/driver-reviews" element={<ProtectedRoute requiredRole="ADMIN"><AdminDriverReviews /></ProtectedRoute>} />
              <Route path="/admin/vehicle-reviews" element={<ProtectedRoute requiredRole="ADMIN"><AdminVehicleReviews /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute requiredRole="ADMIN"><AdminMessages /></ProtectedRoute>} />
              <Route path="/admin/complaints" element={<ProtectedRoute requiredRole="ADMIN"><AdminComplaints /></ProtectedRoute>} />
              <Route path="/dashboard/driver" element={<ProtectedRoute requiredRole="DRIVER"><DriverDashboard /></ProtectedRoute>} />
              <Route path="/settings/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminSettings /></ProtectedRoute>} />
              <Route path="/settings/driver" element={<ProtectedRoute requiredRole="DRIVER"><DriverSettings /></ProtectedRoute>} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/help" element={<Help />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
