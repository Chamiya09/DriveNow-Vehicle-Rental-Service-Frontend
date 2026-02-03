import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DriverEarnings = () => {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; earnings: number }>>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8090/api/bookings/driver/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const driverBookings = await response.json();
        console.log("Driver bookings for earnings:", driverBookings);
        const paidTrips = driverBookings.filter(
          (booking: any) => booking.paymentStatus === "COMPLETED"
        );

        // Calculate total earnings (15% commission)
        const total = paidTrips.reduce((sum: number, trip: any) => 
          sum + (trip.totalPrice * 0.15), 0
        );
        setTotalEarnings(total);

        // Calculate current month earnings
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyTotal = paidTrips
          .filter((trip: any) => {
            const tripDate = new Date(trip.endDate);
            return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, trip: any) => sum + (trip.totalPrice * 0.15), 0);
        setMonthlyEarnings(monthlyTotal);

        // Calculate monthly breakdown for last 6 months
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyBreakdown: { [key: string]: number } = {};
        
        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(currentMonth - i);
          const monthKey = `${monthNames[date.getMonth()]}`;
          monthlyBreakdown[monthKey] = 0;
        }

        // Calculate earnings for each month
        paidTrips.forEach((trip: any) => {
          const tripDate = new Date(trip.endDate);
          const monthKey = monthNames[tripDate.getMonth()];
          const earnings = trip.totalPrice * 0.15;
          
          if (monthlyBreakdown.hasOwnProperty(monthKey)) {
            monthlyBreakdown[monthKey] += earnings;
          }
        });

        // Convert to array format for chart
        const chartData = Object.keys(monthlyBreakdown).map(month => ({
          month,
          earnings: Math.round(monthlyBreakdown[month] * 100) / 100
        }));
        
        setMonthlyData(chartData);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Earnings & Payments</h2>
          <p className="text-muted-foreground">Track your earnings and payment history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEarnings} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={fetchEarnings}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">${totalEarnings.toFixed(2)}</h3>
          <p className="text-sm text-muted-foreground">Total Earnings</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">${monthlyEarnings.toFixed(2)}</h3>
          <p className="text-sm text-muted-foreground">This Month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            ${monthlyData.length > 0 ? (totalEarnings / monthlyData.length).toFixed(2) : "0.00"}
          </h3>
          <p className="text-sm text-muted-foreground">Avg Monthly</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Monthly Earnings Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
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
          <TrendingUp className="w-5 h-5 text-primary" />
          Earnings by Month
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="earnings" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default DriverEarnings;
