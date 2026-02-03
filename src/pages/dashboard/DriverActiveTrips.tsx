import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Clock, Navigation } from "lucide-react";
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

const DriverActiveTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchActiveTrips();
  }, []);

  const handleStartTrip = async (tripId: number, bookingNumber: string) => {
    try {
      const response = await fetch(`http://localhost:8090/api/bookings/${tripId}/status?status=ONGOING`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`Trip ${bookingNumber} started successfully!`);
        fetchActiveTrips();
      } else {
        const errorText = await response.text();
        console.error('Failed to start trip:', errorText);
        toast.error('Failed to start trip');
      }
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error('Error starting trip');
    }
  };

  const handleCompleteTrip = async (tripId: number, bookingNumber: string) => {
    try {
      const response = await fetch(`http://localhost:8090/api/bookings/${tripId}/status?status=COMPLETED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`Trip ${bookingNumber} completed! User can now make payment.`);
        fetchActiveTrips();
      } else {
        const errorText = await response.text();
        console.error('Failed to complete trip:', errorText);
        toast.error('Failed to complete trip');
      }
    } catch (error) {
      console.error('Error completing trip:', error);
      toast.error('Error completing trip');
    }
  };

  const fetchActiveTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8090/api/bookings/driver/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const driverBookings = await response.json();
        const activeBookings = driverBookings.filter((booking: any) => 
            ["CONFIRMED", "ONGOING", "DRIVER_ASSIGNED"].includes(booking.status)
          );
        
        const mappedTrips = activeBookings.map((booking: any) => {
          console.log("Raw booking data:", booking);
          console.log("User object:", booking.user);
          console.log("UserInfo object:", booking.userInfo);
          
          return {
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
          };
        });
        
        console.log("Active trips mapped:", mappedTrips);
        setTrips(mappedTrips);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load active trips");
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
          <h2 className="text-2xl font-bold">Active Trips</h2>
          <p className="text-muted-foreground">Manage your current trip assignments</p>
        </div>
        <Button onClick={fetchActiveTrips}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Trips</p>
              <p className="text-2xl font-bold">{trips.length}</p>
            </div>
            <Navigation className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">
                {trips.filter(t => t.status === "IN_PROGRESS").length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">
                ${trips.reduce((sum, t) => sum + t.commission, 0).toFixed(2)}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
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
                  <Badge
                    variant={
                      trip.status === "IN_PROGRESS"
                        ? "default"
                        : trip.status === "CONFIRMED"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {trip.status}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-green-600">
                  ${(trip.commission ?? 0).toFixed(2)}
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

              <div className="flex gap-2 mt-4">
                {trip.status === 'CONFIRMED' || trip.status === 'DRIVER_ASSIGNED' ? (
                  <Button 
                    size="sm"
                    onClick={() => handleStartTrip(trip.id, trip.bookingNumber)}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Trip
                  </Button>
                ) : trip.status === 'ONGOING' ? (
                  <Button 
                    size="sm"
                    onClick={() => handleCompleteTrip(trip.id, trip.bookingNumber)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Complete Trip
                  </Button>
                ) : null}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    console.log("Selected trip for dialog:", trip);
                    setSelectedTrip(trip);
                    setDialogOpen(true);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active trips</h3>
            <p className="text-muted-foreground">Your active trip assignments will appear here</p>
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

export default DriverActiveTrips;
