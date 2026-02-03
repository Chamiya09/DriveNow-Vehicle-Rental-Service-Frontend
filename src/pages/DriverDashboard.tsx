import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Car,
  DollarSign,
  TrendingUp,
  MapPin,
  Star,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Route,
  Wallet,
  Activity,
  CheckCircle,
  Calendar,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import DriverActiveTrips from "./dashboard/DriverActiveTrips";
import DriverCompletedTrips from "./dashboard/DriverCompletedTrips";
import DriverEarnings from "./dashboard/DriverEarnings";
import DriverProfile from "./dashboard/DriverProfile";
import DriverReviewsList from "./dashboard/DriverReviewsList";

interface Trip {
  id: number;
  bookingNumber: string;
  customerName: string;
  vehicleName: string;
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  commission: number;
}

interface DriverStats {
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
  totalEarnings: number;
  averageRating: number;
  pendingTrips: number;
  tripsChange?: string;
  activeTripsChange?: string;
  earningsChange?: string;
  ratingChange?: string;
}

const DriverDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<DriverStats>({
    totalTrips: 0,
    completedTrips: 0,
    activeTrips: 0,
    totalEarnings: 0,
    averageRating: 0,
    pendingTrips: 0,
  });
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "DRIVER") {
      toast.error("Access denied. Driver account required.");
      navigate("/driver/auth");
      return;
    }
    fetchDriverData();
  }, [user, navigate]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);

      if (!token) {
        console.error("No token found");
        toast.error("Please login again");
        navigate("/driver/auth");
        return;
      }

      console.log("Fetching data for driver ID:", user?.id);

      // Fetch driver statistics from the dedicated API endpoint
      const statsResponse = await fetch(
        `http://localhost:8090/api/users/driver/${user?.id}/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (statsResponse.status === 403) {
        console.error("403 Forbidden - Token expired or invalid");
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/driver/auth");
        return;
      }

      if (statsResponse.ok) {
        const driverStats = await statsResponse.json();
        console.log("Driver stats from API:", driverStats);

        // Set stats from API response
        setStats({
          totalTrips: driverStats.totalTrips || 0,
          completedTrips: driverStats.completedTrips || 0,
          activeTrips: driverStats.activeTrips || 0,
          totalEarnings: driverStats.totalEarnings || 0,
          averageRating: driverStats.averageRating || 0,
          pendingTrips: 0, // Will calculate from trips
          tripsChange: driverStats.tripsChange || "+0%",
          activeTripsChange: driverStats.activeTripsChange || "+0%",
          earningsChange: driverStats.earningsChange || "+0%",
          ratingChange: driverStats.ratingChange || "+0.0",
        });
      }

      // Fetch driver's bookings using driver-specific endpoint
      const bookingsResponse = await fetch(
        `http://localhost:8090/api/bookings/driver/${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (bookingsResponse.ok) {
        const driverBookings = await bookingsResponse.json();
        
        const processedTrips = driverBookings.map((booking: any) => ({
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          customerName: booking.user?.name || booking.userName || "Unknown Customer",
          vehicleName: booking.vehicle?.name || booking.vehicleName || "Unknown Vehicle",
          pickupLocation: booking.pickupLocation || "N/A",
          dropoffLocation: booking.dropoffLocation || "N/A",
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
          totalPrice: booking.totalPrice || 0,
          commission: (booking.totalPrice || 0) * 0.15,
        }));

        setTrips(processedTrips);

        // Update only pending trips count from bookings
        const pendingTrips = processedTrips.filter((t: Trip) => t.status === "PENDING").length;

        setStats(prevStats => ({
          ...prevStats,
          pendingTrips,
        }));
      } else {
        console.error("Failed to fetch bookings:", bookingsResponse.status);
        toast.error("Failed to load bookings");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching driver data:", error);
      toast.error("Failed to load driver data");
      setLoading(false);
    }
  };

  const getMonthlyEarnings = () => {
    const monthlyData: { [key: string]: number } = {};
    
    const completedTrips = trips.filter(t => t.status === "COMPLETED");
    
    if (completedTrips.length === 0) {
      // Return sample data for empty state
      return [
        { month: 'Jan', earnings: 0 },
        { month: 'Feb', earnings: 0 },
        { month: 'Mar', earnings: 0 },
        { month: 'Apr', earnings: 0 },
        { month: 'May', earnings: 0 },
        { month: 'Jun', earnings: 0 },
      ];
    }
    
    completedTrips.forEach(trip => {
      const month = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + trip.commission;
    });

    return Object.entries(monthlyData).map(([month, earnings]) => ({
      month,
      earnings: Math.round(earnings),
    }));
  };

  const getStatusDistribution = () => {
    if (trips.length === 0) {
      return [
        { name: 'No Data', value: 1 },
      ];
    }
    
    const statusCount: { [key: string]: number } = {};
    
    trips.forEach(trip => {
      const statusName = trip.status.replace(/_/g, ' ');
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
      title: "Total Trips",
      value: stats.totalTrips,
      icon: Car,
      color: "from-blue-500 to-cyan-500",
      change: stats.tripsChange || "+0%",
    },
    {
      title: "Active Trips",
      value: stats.activeTrips,
      icon: Activity,
      color: "from-green-500 to-emerald-500",
      change: stats.activeTripsChange || "+0%",
    },
    {
      title: "Total Earnings",
      value: `$${(stats.totalEarnings || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "from-orange-500 to-yellow-500",
      change: stats.earningsChange || "+0%",
    },
    {
      title: "Average Rating",
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
      icon: Star,
      color: "from-purple-500 to-pink-500",
      change: stats.ratingChange || (stats.averageRating > 0 ? "+0.2" : "No reviews"),
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
                  <h2 className="font-bold text-lg">Driver Panel</h2>
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
                onClick={() => setActiveTab("active-trips")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "active-trips" ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Active Trips" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white group-hover:shadow-lg transition-shadow relative ${activeTab === "active-trips" ? 'shadow-lg' : ''}`}>
                  <Route className="w-4 h-4" />
                  {!sidebarOpen && stats.activeTrips > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge variant="destructive" className="text-[10px] w-5 h-5 flex items-center justify-center p-0 bg-gradient-to-br from-green-400 to-green-600 animate-pulse">
                        {stats.activeTrips}
                      </Badge>
                    </motion.div>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Active Trips</p>
                      <p className="text-xs text-muted-foreground">Current assignments</p>
                    </div>
                    {stats.activeTrips > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Badge className="text-xs bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-0 shadow-lg animate-pulse">
                          {stats.activeTrips}
                        </Badge>
                      </motion.div>
                    )}
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab("completed-trips")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "completed-trips" ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Completed Trips" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white group-hover:shadow-lg transition-shadow ${activeTab === "completed-trips" ? 'shadow-lg' : ''}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Completed Trips</p>
                      <p className="text-xs text-muted-foreground">Trip history</p>
                    </div>
                    {stats.completedTrips > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Badge className="text-xs bg-gradient-to-br from-blue-400 to-indigo-600 hover:from-blue-500 hover:to-indigo-700 border-0 shadow-md">
                          {stats.completedTrips}
                        </Badge>
                      </motion.div>
                    )}
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab("earnings")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "earnings" ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Earnings" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 text-white group-hover:shadow-lg transition-shadow ${activeTab === "earnings" ? 'shadow-lg' : ''}`}>
                  <Wallet className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Earnings</p>
                      <p className="text-xs text-muted-foreground">Payment history</p>
                    </div>
                    {stats.totalEarnings > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Badge className="text-xs bg-gradient-to-br from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 border-0 shadow-md">
                          ${stats.totalEarnings.toFixed(0)}
                        </Badge>
                      </motion.div>
                    )}
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "profile" ? 'bg-pink-50 dark:bg-pink-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Profile" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white group-hover:shadow-lg transition-shadow ${activeTab === "profile" ? 'shadow-lg' : ''}`}>
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
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg ${activeTab === "reviews" ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-muted'} transition-colors duration-150 group`}
                title={!sidebarOpen ? "Reviews" : ""}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 text-white group-hover:shadow-lg transition-shadow ${activeTab === "reviews" ? 'shadow-lg' : ''}`}>
                  <Star className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Reviews</p>
                      <p className="text-xs text-muted-foreground">Customer feedback</p>
                    </div>
                    {stats.averageRating > 0 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Badge className="text-xs bg-gradient-to-br from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 border-0 shadow-md">
                          {stats.averageRating.toFixed(1)} ⭐
                        </Badge>
                      </motion.div>
                    )}
                  </>
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
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Driver Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchDriverData}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/settings/driver")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
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
                  <DollarSign className="w-5 h-5 text-primary" />
                  Monthly Earnings
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getMonthlyEarnings()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="earnings" stroke="#0ea5e9" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Trip Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getStatusDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStatusDistribution().map((entry, index) => (
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
                <Car className="w-5 h-5 text-primary" />
                Recent Trips
              </h3>
              {trips.length > 0 ? (
                <div className="space-y-4">
                  {trips.slice(0, 5).map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{trip.vehicleName}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.customerName} • {trip.bookingNumber}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {trip.pickupLocation} → {trip.dropoffLocation}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            trip.status === "COMPLETED"
                              ? "default"
                              : trip.status === "CONFIRMED"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {trip.status}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">
                          ${(trip.commission ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No trips yet</p>
              )}
            </Card>
              </>
            )}

            {activeTab === "active-trips" && <DriverActiveTrips />}

            {activeTab === "completed-trips" && <DriverCompletedTrips />}

            {activeTab === "earnings" && <DriverEarnings />}

            {activeTab === "profile" && <DriverProfile />}

            {activeTab === "reviews" && <DriverReviewsList />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DriverDashboard;
