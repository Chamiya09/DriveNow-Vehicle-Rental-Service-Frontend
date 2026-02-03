import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Calendar,
  MapPin,
  Star,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Heart,
  MessageSquare,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import UserBookings from "./dashboard/UserBookings";
import UserProfile from "./dashboard/UserProfile";
import UserReviews from "./dashboard/UserReviews";
import UserDriverReviews from "./dashboard/UserDriverReviews";
import UserMessages from "./dashboard/UserMessages";
import UserSettings from "./dashboard/UserSettings";

interface Booking {
  id: number;
  bookingNumber: string;
  vehicleName: string;
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
}

interface UserStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalSpent: number;
  favoriteVehicles: number;
  reviews: number;
  pendingBookings: number;
  messages: number;
}

const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    favoriteVehicles: 0,
    reviews: 0,
    pendingBookings: 0,
    messages: 0,
  });
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "USER") {
      toast.error("Access denied. User account required.");
      navigate("/auth");
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      if (!token) {
        console.error("No token found");
        toast.error("Please login again");
        navigate("/auth");
        return;
      }

      console.log("Fetching bookings for user ID:", user?.id);

      // Fetch user's bookings using user-specific endpoint
      const bookingsResponse = await fetch(
        `http://localhost:8090/api/bookings/user/${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", bookingsResponse.status);

      if (bookingsResponse.status === 403) {
        console.error("403 Forbidden - Token expired or invalid");
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
        return;
      }

      if (bookingsResponse.ok) {
        const userBookings = await bookingsResponse.json();
        console.log("User bookings:", userBookings);
        
        const processedBookings = userBookings.map((booking: any) => ({
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          vehicleName: booking.vehicle?.name || booking.vehicleName || "Unknown Vehicle",
          driverName: booking.driver?.name || booking.driverName,
          driverPhone: booking.driver?.phone || booking.driverPhone,
          driverEmail: booking.driver?.email || booking.driverEmail,
          pickupLocation: booking.pickupLocation || "N/A",
          dropoffLocation: booking.dropoffLocation || "N/A",
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
          totalPrice: booking.totalPrice || 0,
        }));

        setBookings(processedBookings);
        console.log("Processed bookings:", processedBookings);

        const totalBookings = processedBookings.length;
        const activeBookings = processedBookings.filter((b: Booking) => 
          b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "IN_PROGRESS" || b.status === "DRIVER_ASSIGNED"
        ).length;
        const completedBookings = processedBookings.filter((b: Booking) => b.status === "COMPLETED").length;
        const pendingBookings = processedBookings.filter((b: Booking) => b.status === "PENDING").length;
        const totalSpent = processedBookings
          .filter((b: Booking) => b.status === "COMPLETED")
          .reduce((sum: number, b: Booking) => sum + b.totalPrice, 0);

        // Fetch reviews count
        let reviewsCount = 0;
        try {
          const reviewsResponse = await fetch(`http://localhost:8090/api/reviews/user/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (reviewsResponse.ok) {
            const reviews = await reviewsResponse.json();
            reviewsCount = reviews.length;
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }

        // Fetch favorite vehicles count
        let favoriteCount = 0;
        try {
          const vehiclesResponse = await fetch(`http://localhost:8090/api/vehicles`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (vehiclesResponse.ok) {
            const vehicles = await vehiclesResponse.json();
            // This is a placeholder - you'd need a favorites API
            favoriteCount = 3;
          }
        } catch (error) {
          console.error("Error fetching vehicles:", error);
        }

        // Fetch messages count (placeholder - needs actual API)
        let messagesCount = 0;
        try {
          // This would be your actual messages API call
          messagesCount = 0; // Placeholder
        } catch (error) {
          console.error("Error fetching messages:", error);
        }

        const newStats = {
          totalBookings,
          activeBookings,
          completedBookings,
          pendingBookings,
          totalSpent,
          favoriteVehicles: favoriteCount,
          reviews: reviewsCount,
          messages: messagesCount,
        };
        
        console.log("Setting stats to:", newStats);
        setStats(newStats);
      } else {
        console.error("Failed to fetch bookings:", bookingsResponse.status);
        toast.error("Failed to load bookings");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
      setLoading(false);
    }
  };

  const getMonthlySpending = () => {
    const monthlyData: { [key: string]: number } = {};
    
    const completedBookings = bookings.filter(b => b.status === "COMPLETED");
    
    if (completedBookings.length === 0) {
      // Return sample data for empty state
      return [
        { month: 'Jan', spent: 0 },
        { month: 'Feb', spent: 0 },
        { month: 'Mar', spent: 0 },
        { month: 'Apr', spent: 0 },
        { month: 'May', spent: 0 },
        { month: 'Jun', spent: 0 },
      ];
    }
    
    completedBookings.forEach(booking => {
      const month = new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + booking.totalPrice;
    });

    return Object.entries(monthlyData).map(([month, spent]) => ({
      month,
      spent: Math.round(spent),
    }));
  };

  const getBookingStatusDistribution = () => {
    if (bookings.length === 0) {
      return [
        { name: 'No Data', value: 1 },
      ];
    }
    
    const statusCount: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      const statusName = booking.status.replace(/_/g, ' ');
      statusCount[statusName] = (statusCount[statusName] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  };

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Car,
      color: "from-blue-500 to-cyan-500",
      change: "+8%",
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings,
      icon: Clock,
      color: "from-green-500 to-emerald-500",
      change: "+3%",
    },
    {
      title: "Total Spent",
      value: `$${(stats.totalSpent ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "from-orange-500 to-yellow-500",
      change: "+15%",
    },
    {
      title: "Reviews Given",
      value: stats.reviews,
      icon: Star,
      color: "from-purple-500 to-pink-500",
      change: "+2",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow flex pt-16">
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
                  <h2 className="font-bold text-lg">User Panel</h2>
                </div>
              </div>
            )}

            <nav className="space-y-2 mt-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "overview" ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Overview" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white group-hover:shadow-lg transition-shadow ${activeTab === "overview" ? 'shadow-lg' : ''}`}>
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">Overview</p>
                    <p className="text-xs text-muted-foreground">Dashboard home</p>
                  </div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "bookings" ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "My Bookings" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white group-hover:shadow-lg transition-shadow relative ${activeTab === "bookings" ? 'shadow-lg' : ''}`}>
                  <Calendar className="w-4 h-4" />
                  {!sidebarOpen && stats.activeBookings > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge variant="destructive" className="text-[10px] w-5 h-5 flex items-center justify-center p-0 bg-gradient-to-br from-green-400 to-green-600 animate-pulse">
                        {stats.activeBookings}
                      </Badge>
                    </motion.div>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">My Bookings</p>
                      <p className="text-xs text-muted-foreground">View reservations</p>
                    </div>
                    {stats.activeBookings > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Badge className="text-xs bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-0 shadow-lg animate-pulse">
                          {stats.activeBookings} Active
                        </Badge>
                      </motion.div>
                    )}
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "profile" ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Profile" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white group-hover:shadow-lg transition-shadow ${activeTab === "profile" ? 'shadow-lg' : ''}`}>
                  <User className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">Profile</p>
                    <p className="text-xs text-muted-foreground">Account details</p>
                  </div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "reviews" ? 'bg-pink-50 dark:bg-pink-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Reviews" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white group-hover:shadow-lg transition-shadow ${activeTab === "reviews" ? 'shadow-lg' : ''}`}>
                  <Star className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">My Reviews</p>
                      <p className="text-xs text-muted-foreground">Rate vehicles</p>
                    </div>
                    {stats.reviews > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Badge className="text-xs bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 border-0 shadow-md">
                          {stats.reviews}
                        </Badge>
                      </motion.div>
                    )}
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab("driver-reviews")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "driver-reviews" ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Driver Reviews" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white group-hover:shadow-lg transition-shadow ${activeTab === "driver-reviews" ? 'shadow-lg' : ''}`}>
                  <Award className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">Driver Reviews</p>
                    <p className="text-xs text-muted-foreground">Rate drivers</p>
                  </div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("messages")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "messages" ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Messages" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white group-hover:shadow-lg transition-shadow relative ${activeTab === "messages" ? 'shadow-lg' : ''}`}>
                  <MessageSquare className="w-4 h-4" />
                  {!sidebarOpen && stats.messages > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge variant="destructive" className="text-[10px] w-5 h-5 flex items-center justify-center p-0 bg-red-500 animate-pulse">
                        {stats.messages}
                      </Badge>
                    </motion.div>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Messages</p>
                      <p className="text-xs text-muted-foreground">Support chat</p>
                    </div>
                    {stats.messages > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Badge variant="destructive" className="text-xs animate-pulse shadow-lg">
                          {stats.messages} New
                        </Badge>
                      </motion.div>
                    )}
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "settings" ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Settings" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white group-hover:shadow-lg transition-shadow ${activeTab === "settings" ? 'shadow-lg' : ''}`}>
                  <Settings className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">Settings</p>
                    <p className="text-xs text-muted-foreground">Preferences</p>
                  </div>
                )}
              </button>
            </nav>
          </div>
        </aside>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ willChange: 'left' }}
          className={`fixed top-20 z-50 p-2 bg-primary text-primary-foreground rounded-r-lg shadow-lg hover:bg-primary/90 transition-[left] duration-200 ease-out ${
            sidebarOpen ? 'left-72' : 'left-20'
          }`}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

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
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">My Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchUserData}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </motion.div>

            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-green-600">
                        {stat.change}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Monthly Spending
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getMonthlySpending()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="spent" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Booking Status
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getBookingStatusDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getBookingStatusDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Bookings
              </h3>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{booking.vehicleName}</p>
                        <p className="text-sm text-muted-foreground">
                          Booking #{booking.bookingNumber}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {booking.pickupLocation} → {booking.dropoffLocation}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            booking.status === "COMPLETED"
                              ? "default"
                              : booking.status === "CONFIRMED"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {booking.status}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">
                          ${(booking.totalPrice ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No bookings yet</p>
              )}
            </Card>
              </>
            )}

            {activeTab === "bookings" && <UserBookings />}

            {activeTab === "profile" && <UserProfile />}

            {activeTab === "reviews" && <UserReviews />}

            {activeTab === "driver-reviews" && <UserDriverReviews />}

            {activeTab === "messages" && <UserMessages />}

            {activeTab === "settings" && <UserSettings />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
