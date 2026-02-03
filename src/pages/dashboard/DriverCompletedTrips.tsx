import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, CheckCircle, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BookingDetailsDialog } from "@/components/BookingDetailsDialog";

interface Trip {
  id: number;
  bookingNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  vehicleName: string;
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  commission: number;
  paymentStatus?: string;
}

const DriverCompletedTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchCompletedTrips();
  }, []);

  const fetchCompletedTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8090/api/bookings/driver/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const driverBookings = await response.json();
        const completedBookings = driverBookings.filter((booking: any) => booking.status === "COMPLETED");
        
        const mappedTrips = completedBookings.map((booking: any) => ({
          id: booking.id,
          bookingNumber: booking.bookingNumber || `BK-${booking.id}`,
          customerName: booking.userInfo?.name || booking.user?.name || booking.userName || booking.customerName || "Unknown Customer",
          customerPhone: booking.userInfo?.phone || booking.user?.phone || booking.user?.phoneNumber || booking.userPhone,
          customerEmail: booking.userInfo?.email || booking.user?.email || booking.userEmail,
          vehicleName: booking.vehicleInfo?.name || booking.vehicle?.name || booking.vehicleName || "Unknown Vehicle",
          pickupLocation: booking.pickupLocation || "N/A",
          dropoffLocation: booking.dropoffLocation || "N/A",
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
          totalPrice: booking.totalPrice || 0,
          commission: (booking.totalPrice || 0) * 0.15,
          paymentStatus: booking.paymentStatus,
        }));
        
        console.log("Completed trips mapped:", mappedTrips);
        setTrips(mappedTrips);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load completed trips");
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

  const totalEarnings = trips.reduce((sum, t) => sum + t.commission, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Completed Trips</h2>
          <p className="text-muted-foreground">View your trip history and earnings</p>
        </div>
        <Button onClick={fetchCompletedTrips}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <p className="text-2xl font-bold">{trips.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Earnings</p>
              <p className="text-2xl font-bold">
                ${trips.length > 0 ? (totalEarnings / trips.length).toFixed(2) : "0.00"}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{trip.vehicleName}</h3>
                  <Badge variant="default">COMPLETED</Badge>
                </div>
                <p className="text-lg font-bold text-green-600">
                  +${(trip.commission ?? 0).toFixed(2)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Trip #{trip.bookingNumber}
                </p>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{trip.customerName}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{trip.pickupLocation}</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{trip.dropoffLocation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                  </div>
                  <span>to</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(trip.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <Button 
                size="sm" 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedTrip(trip);
                  setDialogOpen(true);
                }}
              >
                View Details
              </Button>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No completed trips yet</h3>
            <p className="text-muted-foreground">Your completed trips will appear here</p>
          </Card>
        )}
      </div>

      <BookingDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={selectedTrip}
        userType="driver"
      />
    </div>
  );
};

export default DriverCompletedTrips;
