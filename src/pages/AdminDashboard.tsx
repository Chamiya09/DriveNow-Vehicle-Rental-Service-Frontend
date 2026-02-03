import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  UserCheck,
  BarChart3,
  Shield,
  Edit,
  Trash2,
  Star,
  CheckCircle,
  XCircle,
  Mail,
  UserCircle,
  MessageCircle,
  X,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Activity,
  PieChart,
  LineChart,
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddVehicleDialog from "@/components/AddVehicleDialog";
import AddDriverDialog from "@/components/AddDriverDialog";
import AssignDriverDialog from "@/components/AssignDriverDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  licenseNumber?: string;
  available?: boolean;
  createdAt?: string;
}

interface Vehicle {
  id: number;
  name: string;
  category: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  available: boolean;
  seats: number;
  transmission: string;
  fuelType: string;
  createdAt?: string;
}

interface Booking {
  id: number;
  bookingNumber: string;
  userId: number;
  vehicleId: number;
  driverId?: number | null;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus?: string;
  pickupLocation: string;
  dropoffLocation: string;
  createdAt?: string;
  userInfo?: {
    id: number;
    name: string;
    email: string;
  };
  vehicleInfo?: {
    id: number;
    name: string;
    category: string;
  };
}

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved';
  vehicleId: number;
  vehicleName: string;
  userId: number | null;
  userEmail: string | null;
}

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  status: string;
  role: string;
  available: boolean;
  driversLicense?: string;
  vehicleRegistration?: string;
  insuranceCertificate?: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
  repliedAt?: string;
  adminReply?: string;
  replies?: MessageReply[];
}

interface MessageReply {
  id: number;
  replyText: string;
  senderType: 'ADMIN' | 'USER';
  senderName: string;
  senderEmail: string;
  createdAt: string;
  isRead: boolean;
}

interface Complaint {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  complaintText: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  closedAt?: string;
  closedBy?: string;
  unreadCount: number;
  replies?: ComplaintReply[];
}

interface ComplaintReply {
  id: number;
  replyText: string;
  senderType: 'ADMIN' | 'USER';
  senderName: string;
  senderEmail: string;
  createdAt: string;
  isRead: boolean;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const { token, handleUnauthorized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    loadReviews();
    loadContactMessages();
  }, []);

  // Load Reviews from localStorage
  const loadReviews = () => {
    const storedReviews = localStorage.getItem('all_reviews');
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
  };

  // Load Contact Messages
  const loadContactMessages = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/contact", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const messages = await response.json();
        setContactMessages(messages);
      }
    } catch (error) {
      console.error("Error loading contact messages:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let usersData: User[] = [];
      let driversData: Driver[] = [];
      let vehiclesData: Vehicle[] = [];
      let bookingsData: Booking[] = [];

      // Fetch users
      try {
        const usersResponse = await fetch("http://localhost:8090/api/admin/users", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (usersResponse.status === 403 || usersResponse.status === 401) {
          handleUnauthorized();
          return;
        }

        if (usersResponse.ok) {
          usersData = await usersResponse.json();
          console.log("Users:", usersData);
        } else {
          // Enhanced error logging - show backend error details in console
          const errorData = await usersResponse.json().catch(() => null);
          console.error("=== BACKEND ERROR - Users Fetch ===");
          console.error("Status:", usersResponse.status);
          if (errorData) {
            console.error("Error Type:", errorData.error || "Unknown");
            console.error("Error Message:", errorData.message || "No message");
            console.error("Error Details:", errorData.errors || errorData.details || "No details");
          }
          console.error("=================================");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }

      // Fetch drivers
      try {
        const driversResponse = await fetch("http://localhost:8090/api/admin/drivers", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (driversResponse.ok) {
          driversData = await driversResponse.json();
          console.log("Drivers:", driversData);
          // Log driver availability for debugging
          driversData.forEach(driver => {
            console.log(`Driver ${driver.name} (ID: ${driver.id}): available=${driver.available}, status=${driver.status}`);
          });
        } else {
          console.error("Failed to fetch drivers:", driversResponse.status);
        }
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }

      // Fetch vehicles
      try {
        const vehiclesResponse = await fetch("http://localhost:8090/api/vehicles", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (vehiclesResponse.ok) {
          vehiclesData = await vehiclesResponse.json();
          console.log("Vehicles:", vehiclesData);
          console.log("Vehicles count:", vehiclesData.length);
        } else {
          console.error("Failed to fetch vehicles:", vehiclesResponse.status);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }

      // Fetch bookings
      try {
        const bookingsResponse = await fetch("http://localhost:8090/api/admin/bookings", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (bookingsResponse.ok) {
          bookingsData = await bookingsResponse.json();
          console.log("Bookings:", bookingsData);
        } else {
          // Enhanced error logging - show backend error details in console
          const errorData = await bookingsResponse.json().catch(() => null);
          console.error("=== BACKEND ERROR - Bookings Fetch ===");
          console.error("Status:", bookingsResponse.status);
          if (errorData) {
            console.error("Error Type:", errorData.error || "Unknown");
            console.error("Error Message:", errorData.message || "No message");
            console.error("Error Details:", errorData.errors || errorData.details || "No details");
          }
          console.error("====================================");
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }

      setUsers(usersData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setBookings(bookingsData);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleAdded = () => {
    setShowAddVehicle(false);
    fetchData();
    toast.success("Vehicle added successfully!");
  };

  const handleDriverAdded = () => {
    setShowAddDriver(false);
    fetchData();
    toast.success("Driver added successfully!");
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const response = await fetch(`http://localhost:8090/api/vehicles/${vehicleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Vehicle deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete vehicle");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Error deleting vehicle");
    }
  };

  const handleToggleDriverStatus = async (driverId: number, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await fetch(`http://localhost:8090/api/admin/drivers/${driverId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Driver status updated to ${newStatus}`);
        fetchData();
      } else {
        toast.error("Failed to update driver status");
      }
    } catch (error) {
      console.error("Error updating driver status:", error);
      toast.error("Error updating driver status");
    }
  };

  const handleDeleteDriver = async (driverId: number) => {
    if (!confirm("Are you sure you want to delete this driver? This action cannot be undone.")) return;

    try {
      const response = await fetch(`http://localhost:8090/api/admin/drivers/${driverId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Driver deleted successfully");
        fetchData();
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || `Failed to delete driver (Status: ${response.status})`;
        console.error("Delete driver failed:", response.status, errorData);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("Network error while deleting driver");
    }
  };

  // Calculate stats
  const totalUsers = users.filter(u => u.role === "USER").length;
  const totalDrivers = drivers.length;
  const totalVehicles = vehicles.length;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === "PENDING" || b.status === "CONFIRMED").length;
  
  // Calculate total revenue only from PAID bookings (where payment is completed)
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === "COMPLETED")
    .reduce((sum, b) => sum + b.totalPrice, 0);
  
  // Calculate driver commission (15% for paid bookings with drivers)
  const driverCommission = bookings
    .filter(b => b.paymentStatus === "COMPLETED" && b.driverId)
    .reduce((sum, b) => sum + (b.totalPrice * 0.15), 0);
  
  // Calculate net revenue after commission
  const netRevenue = totalRevenue - driverCommission;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats with percentage changes
  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) {
      return current > 0 ? "+100%" : "0%";
    }
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  // Get last month and previous month data
  const getMonthlyComparison = () => {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);

    // Users
    const lastMonthUsers = users.filter(u => {
      const createdDate = new Date(u.createdAt || '');
      return createdDate >= lastMonthStart && createdDate <= lastMonthEnd && u.role === 'USER';
    }).length;
    const prevMonthUsers = users.filter(u => {
      const createdDate = new Date(u.createdAt || '');
      return createdDate >= prevMonthStart && createdDate <= prevMonthEnd && u.role === 'USER';
    }).length;

    // Drivers
    const lastMonthDrivers = drivers.filter(d => {
      const createdDate = new Date(d.createdAt || '');
      return createdDate >= lastMonthStart && createdDate <= lastMonthEnd;
    }).length;
    const prevMonthDrivers = drivers.filter(d => {
      const createdDate = new Date(d.createdAt || '');
      return createdDate >= prevMonthStart && createdDate <= prevMonthEnd;
    }).length;

    // Vehicles
    const lastMonthVehicles = vehicles.filter(v => {
      const createdDate = new Date(v.createdAt || '');
      return createdDate >= lastMonthStart && createdDate <= lastMonthEnd;
    }).length;
    const prevMonthVehicles = vehicles.filter(v => {
      const createdDate = new Date(v.createdAt || '');
      return createdDate >= prevMonthStart && createdDate <= prevMonthEnd;
    }).length;

    // Bookings
    const lastMonthBookings = bookings.filter(b => {
      const createdDate = new Date(b.createdAt || b.startDate);
      return createdDate >= lastMonthStart && createdDate <= lastMonthEnd;
    }).length;
    const prevMonthBookings = bookings.filter(b => {
      const createdDate = new Date(b.createdAt || b.startDate);
      return createdDate >= prevMonthStart && createdDate <= prevMonthEnd;
    }).length;

    return {
      usersChange: calculatePercentageChange(lastMonthUsers, prevMonthUsers),
      driversChange: calculatePercentageChange(lastMonthDrivers, prevMonthDrivers),
      vehiclesChange: calculatePercentageChange(lastMonthVehicles, prevMonthVehicles),
      bookingsChange: calculatePercentageChange(lastMonthBookings, prevMonthBookings),
    };
  };

  const monthlyComparison = getMonthlyComparison();

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-primary",
      trend: monthlyComparison.usersChange,
    },
    {
      title: "Total Drivers",
      value: totalDrivers,
      icon: UserCheck,
      color: "bg-secondary",
      trend: monthlyComparison.driversChange,
    },
    {
      title: "Total Vehicles",
      value: totalVehicles,
      icon: Car,
      color: "bg-accent",
      trend: monthlyComparison.vehiclesChange,
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      color: "bg-success",
      trend: monthlyComparison.bookingsChange,
    },
  ];

  // Process Real Data - Group bookings and users by month
  const getMonthlyData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get last 6 months
    const monthlyData: { [key: string]: { revenue: number; bookings: number; users: number; commission: number } } = {};
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      const monthKey = monthNames[monthIndex];
      
      monthlyData[monthKey] = { revenue: 0, bookings: 0, users: 0, commission: 0 };
      
      // Calculate bookings and revenue for this month (only paid bookings)
      bookings.forEach(booking => {
        const bookingDate = new Date(booking.startDate);
        if (bookingDate.getMonth() === monthIndex && bookingDate.getFullYear() === year && booking.paymentStatus === 'COMPLETED') {
          monthlyData[monthKey].revenue += booking.totalPrice;
          monthlyData[monthKey].bookings += 1;
          if (booking.driverId) {
            monthlyData[monthKey].commission += booking.totalPrice * 0.15;
          }
        }
      });
      
      // Count users created in this month (if createdAt exists)
      const usersThisMonth = users.filter(u => u.role === "USER").length;
      monthlyData[monthKey].users = Math.floor(usersThisMonth / 6 * (i + 1)); // Distributed estimate
    }
    
    return monthlyData;
  };

  const monthlyData = getMonthlyData();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  // Generate last 6 months data
  const revenueGrowthData = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    const monthKey = monthNames[monthIndex];
    const data = monthlyData[monthKey] || { revenue: 0, bookings: 0, users: 0 };
    
    return {
      month: monthKey,
      revenue: Math.round(data.revenue),
      bookings: data.bookings,
      users: data.users
    };
  });

  const vehicleCategoryData = [
    { name: 'Sedan', value: vehicles.filter(v => v.category === 'SEDAN').length, color: '#3b82f6' },
    { name: 'SUV', value: vehicles.filter(v => v.category === 'SUV').length, color: '#10b981' },
    { name: 'Luxury', value: vehicles.filter(v => v.category === 'LUXURY').length, color: '#f59e0b' },
    { name: 'Van', value: vehicles.filter(v => v.category === 'VAN').length, color: '#8b5cf6' },
    { name: 'Sports', value: vehicles.filter(v => v.category === 'SPORTS').length, color: '#ef4444' },
  ].filter(item => item.value > 0); // Only show categories with vehicles

  const bookingStatusData = [
    { status: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length, color: '#10b981' },
    { status: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length, color: '#f59e0b' },
    { status: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length, color: '#3b82f6' },
    { status: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length, color: '#ef4444' },
  ].filter(item => item.count > 0); // Only show statuses that exist

  const monthlyPerformanceData = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    const monthKey = monthNames[monthIndex];
    const data = monthlyData[monthKey] || { revenue: 0, commission: 0 };
    
    return {
      month: monthKey,
      revenue: Math.round(data.revenue),
      commission: Math.round(data.commission),
      net: Math.round(data.revenue - data.commission)
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow flex pt-16">
        {/* Sidebar */}
        <aside
          style={{ willChange: 'width' }}
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg z-40 overflow-hidden transition-[width] duration-200 ease-out ${
            sidebarOpen ? 'w-72' : 'w-20'
          }`}
        >
          <div className={`${sidebarOpen ? 'p-6' : 'p-3'} transition-[padding] duration-200 ease-out will-change-[padding]`}>
            {sidebarOpen && (
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  <h2 className="font-bold text-lg">Management</h2>
                </div>
              </div>
            )}

            <nav className="space-y-2 mt-4">
              {/* Users */}
              <button
                onClick={() => navigate('/admin/users')}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 group`}
                title={!sidebarOpen ? "Users" : ""}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white group-hover:shadow-lg transition-shadow relative">
                  <Users className="w-4 h-4" />
                  {!sidebarOpen && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] w-5 h-5 flex items-center justify-center p-0">
                      {users.filter(u => u.role === "USER").length}
                    </Badge>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Users</p>
                      <p className="text-xs text-muted-foreground">Manage customers</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {users.filter(u => u.role === "USER").length}
                    </Badge>
                  </>
                )}
              </button>

              {/* Drivers */}
              <button
                onClick={() => navigate('/admin/drivers')}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-150 group`}
                title={!sidebarOpen ? "Drivers" : ""}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white group-hover:shadow-lg transition-shadow relative">
                  <UserCheck className="w-4 h-4" />
                  {!sidebarOpen && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] w-5 h-5 flex items-center justify-center p-0">
                      {drivers.length}
                    </Badge>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Drivers</p>
                      <p className="text-xs text-muted-foreground">Manage drivers</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {drivers.length}
                    </Badge>
                  </>
                )}
              </button>

              {/* Vehicles */}
              <button
                onClick={() => navigate('/admin/vehicles')}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-150 group`}
                title={!sidebarOpen ? "Vehicles" : ""}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white group-hover:shadow-lg transition-shadow relative">
                  <Car className="w-4 h-4" />
                  {!sidebarOpen && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] w-5 h-5 flex items-center justify-center p-0">
                      {vehicles.length}
                    </Badge>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Vehicles</p>
                      <p className="text-xs text-muted-foreground">Manage fleet</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {vehicles.length}
                    </Badge>
                  </>
                )}
              </button>

              {/* Bookings */}
              <button
                onClick={() => navigate('/admin/bookings')}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-150 group`}
                title={!sidebarOpen ? "Bookings" : ""}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white group-hover:shadow-lg transition-shadow relative">
                  <Calendar className="w-4 h-4" />
                  {!sidebarOpen && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] w-5 h-5 flex items-center justify-center p-0">
                      {bookings.length}
                    </Badge>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Bookings</p>
                      <p className="text-xs text-muted-foreground">View bookings</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {bookings.length}
                    </Badge>
                  </>
                )}
              </button>

              {/* Vehicle Reviews */}
              <button
                onClick={() => navigate('/admin/vehicle-reviews')}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 group`}
                title={!sidebarOpen ? "Vehicle Reviews" : ""}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white group-hover:shadow-lg transition-shadow relative">
                  <Car className="w-4 h-4" />
                  {!sidebarOpen && reviews.filter(r => r.status === 'pending').length > 0 && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] w-5 h-5 flex items-center justify-center p-0">
                      {reviews.filter(r => r.status === 'pending').length}
                    </Badge>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Vehicle Reviews</p>
                      <p className="text-xs text-muted-foreground">Customer vehicle feedback</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {reviews.filter(r => r.status === 'pending').length}
                    </Badge>
                  </>
                )}
              </button>

              {/* Driver Reviews */}
              <button
                onClick={() => navigate('/admin/driver-reviews')}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-150 group`}
                title={!sidebarOpen ? "Driver Reviews" : ""}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white group-hover:shadow-lg transition-shadow relative">
                  <Star className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Driver Reviews</p>
                      <p className="text-xs text-muted-foreground">Customer driver feedback</p>
                    </div>
                  </>
                )}
              </button>

              {/* Messages */}
              <button
                onClick={() => navigate('/admin/messages')}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-150 group`}
                title={!sidebarOpen ? "Messages" : ""}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white group-hover:shadow-lg transition-shadow relative">
                  <Mail className="w-4 h-4" />
                  {contactMessages.filter(m => m.status === 'NEW').length > 0 && (
                    <span className={`absolute ${sidebarOpen ? '-top-1 -right-1' : '-top-1 -right-1'} bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse`}>
                      {contactMessages.filter(m => m.status === 'NEW').length}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Messages</p>
                      <p className="text-xs text-muted-foreground">Customer support</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {contactMessages.length}
                    </Badge>
                  </>
                )}
              </button>

              {/* Complaints */}
              <button
                onClick={() => navigate('/admin/complaints')}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 group`}
                title={!sidebarOpen ? "Complaints" : ""}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white group-hover:shadow-lg transition-shadow relative">
                  <AlertCircle className="w-4 h-4" />
                  {!sidebarOpen && complaints.filter(c => c.status === 'OPEN').length > 0 && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] w-5 h-5 flex items-center justify-center p-0">
                      {complaints.filter(c => c.status === 'OPEN').length}
                    </Badge>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Complaints</p>
                      <p className="text-xs text-muted-foreground">Resolve issues</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {complaints.filter(c => c.status === 'OPEN').length}
                    </Badge>
                  </>
                )}
              </button>
            </nav>
          </div>
        </aside>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ willChange: 'left' }}
          className={`fixed top-20 z-50 p-2 bg-primary text-primary-foreground rounded-r-lg shadow-lg hover:bg-primary/90 transition-[left] duration-200 ease-out ${
            sidebarOpen ? 'left-72' : 'left-20'
          }`}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Main Content */}
        <div 
          style={{ willChange: 'margin-left' }}
          className={`flex-1 pb-16 transition-[margin-left] duration-200 ease-out ${
            sidebarOpen ? 'ml-72' : 'ml-20'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Manage your entire platform</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => fetchData()}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Refresh Now
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/settings/admin")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setShowAddVehicle(true)}
                    className="flex items-center gap-2 h-auto py-4"
                  >
                    <Car className="w-4 h-4" />
                    Add Vehicle
                  </Button>
                  <Button
                    onClick={() => setShowAddDriver(true)}
                    variant="secondary"
                    className="flex items-center gap-2 h-auto py-4"
                  >
                    <UserCheck className="w-4 h-4" />
                    Add Driver
                  </Button>
                  <Button
                    onClick={() => navigate("/admin/bookings")}
                    variant="outline"
                    className="flex items-center gap-2 h-auto py-4"
                  >
                    <Calendar className="w-4 h-4" />
                    View Bookings
                  </Button>
                  <Button
                    onClick={() => navigate("/admin/reviews")}
                    variant="outline"
                    className="flex items-center gap-2 h-auto py-4"
                  >
                    <Star className="w-4 h-4" />
                    Moderate Reviews
                  </Button>
                </div>
              </Card>
            </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Revenue Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Total Revenue */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</h3>
                  <p className="text-2xl font-bold text-primary">
                    ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">From all bookings</p>
            </Card>

            {/* Driver Commission */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Driver Commission</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    ${driverCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <UserCheck className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">20% commission paid</p>
            </Card>

            {/* Net Revenue */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Net Revenue</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ${netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge className="bg-success text-success-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  After commission
                </Badge>
                <Badge variant="secondary">{activeBookings} active</Badge>
              </div>
            </Card>
          </motion.div>

          {/* Company Growth Analytics - Multiple Graph Perspectives */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Company Growth Analytics</h2>
            </div>
            
            {/* Revenue & Business Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Growth Over Time */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <LineChart className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg">Revenue & Business Growth</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={revenueGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                      formatter={(value: any) => [`$${value}`, '']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Revenue ($)"
                      dot={{ fill: '#3b82f6', r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Bookings"
                      dot={{ fill: '#10b981', r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      name="Users"
                      dot={{ fill: '#f59e0b', r: 5 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </Card>

              {/* Monthly Financial Performance */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-lg">Monthly Financial Performance</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                      formatter={(value: any) => [`$${value}`, '']}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Total Revenue" />
                    <Bar dataKey="commission" fill="#f59e0b" name="Commission" />
                    <Bar dataKey="net" fill="#10b981" name="Net Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehicle Category Distribution */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-lg">Fleet Distribution by Category</h3>
                </div>
                <div className="flex items-center justify-between">
                  <ResponsiveContainer width="50%" height={280}>
                    <RechartsPieChart>
                      <Pie
                        data={vehicleCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {vehicleCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 w-1/2">
                    {vehicleCategoryData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Booking Status Breakdown */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-bold text-lg">Booking Status Overview</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={bookingStatusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="status" type="category" stroke="#666" width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                      {bookingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </motion.div>

          {/* Recent Management Tables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Quick Management</h2>
            
            {/* Recent Users */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Recent Users
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/users")}>
                  View All
                </Button>
              </div>
              {users.filter(u => u.role === "USER").length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(u => u.role === "USER")
                        .slice(0, 5)
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>
                              <Badge
                                variant={user.status === "ACTIVE" ? "default" : "secondary"}
                                className={user.status === "ACTIVE" ? "bg-green-600" : ""}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No users yet</p>
              )}
            </Card>

            {/* Recent Drivers */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                  Recent Drivers
                  <Badge variant="outline" className="text-xs ml-2">
                    {drivers.filter(d => d.available).length} Available
                  </Badge>
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/drivers")}>
                  View All
                </Button>
              </div>
              {drivers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.slice(0, 5).map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">{driver.name}</TableCell>
                          <TableCell>{driver.email}</TableCell>
                          <TableCell>{driver.licenseNumber || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {driver.driversLicense && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs cursor-pointer bg-green-50 hover:bg-green-100"
                                  onClick={() => window.open(driver.driversLicense, '_blank')}
                                >
                                  DL
                                </Badge>
                              )}
                              {driver.vehicleRegistration && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs cursor-pointer bg-blue-50 hover:bg-blue-100"
                                  onClick={() => window.open(driver.vehicleRegistration, '_blank')}
                                >
                                  VR
                                </Badge>
                              )}
                              {driver.insuranceCertificate && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs cursor-pointer bg-purple-50 hover:bg-purple-100"
                                  onClick={() => window.open(driver.insuranceCertificate, '_blank')}
                                >
                                  IC
                                </Badge>
                              )}
                              {!driver.driversLicense && !driver.vehicleRegistration && !driver.insuranceCertificate && (
                                <span className="text-xs text-muted-foreground">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={driver.available ? "default" : "secondary"}
                              className={driver.available ? "bg-green-600" : ""}
                            >
                              {driver.available ? "Available" : "Busy"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={driver.status === "ACTIVE" ? "default" : "secondary"}
                            >
                              {driver.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleDriverStatus(driver.id, driver.status)}
                              >
                                {driver.status === "ACTIVE" ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDriver(driver.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No drivers yet</p>
              )}
            </Card>

            {/* Recent Vehicles */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Car className="w-5 h-5 text-purple-600" />
                  Recent Vehicles
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/vehicles")}>
                  View All
                </Button>
              </div>
              {vehicles.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price/Day</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.slice(0, 5).map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {vehicle.category.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>${vehicle.pricePerDay}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {vehicle.rating.toFixed(1)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={vehicle.available ? "default" : "destructive"}
                              className={vehicle.available ? "bg-green-600" : ""}
                            >
                              {vehicle.available ? "Available" : "Rented"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No vehicles yet</p>
              )}
            </Card>
          </motion.div>

          {/* Recent Activity Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Recent Bookings</h3>
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div>
                          <p className="font-medium">{booking.bookingNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.startDate} - {booking.endDate}
                          </p>
                        </div>
                        <Badge className="capitalize">{booking.status.toLowerCase()}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No bookings yet</p>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Recent Drivers</h3>
                {drivers.length > 0 ? (
                  <div className="space-y-3">
                    {drivers.slice(0, 5).map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {driver.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {driver.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={driver.available ? "default" : "secondary"}
                            className={driver.available ? "bg-green-600" : ""}
                          >
                            {driver.available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No drivers yet</p>
                )}
              </Card>
            </div>
          </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Dialogs */}
      <AddVehicleDialog
        open={showAddVehicle}
        onOpenChange={setShowAddVehicle}
        onSuccess={handleVehicleAdded}
      />

      <AddDriverDialog
        open={showAddDriver}
        onOpenChange={setShowAddDriver}
        onDriverAdded={handleDriverAdded}
      />
    </div>
  );
};

export default AdminDashboard;
