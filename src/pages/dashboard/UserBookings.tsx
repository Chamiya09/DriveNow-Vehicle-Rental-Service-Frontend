import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Car, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BookingDetailsDialog } from "@/components/BookingDetailsDialog";
import { ReviewDriverDialog } from "@/components/ReviewDriverDialog";

interface Booking {
  id: number;
  bookingNumber: string;
  vehicleName: string;
  driverName?: string;
  driverPhone?: string;
  driverEmail?: string;
  driverId?: number;
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus?: string;
  totalPrice: number;
  hasReview?: boolean;
}

const UserBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayment = async (bookingId: number, amount: number, bookingNumber: string) => {
    try {
      // Process payment - backend endpoint uses PUT method
      const paymentResponse = await fetch(`http://localhost:8090/api/bookings/${bookingId}/confirm-payment`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (paymentResponse.ok) {
        toast.success(`Payment of $${amount.toFixed(2)} for booking ${bookingNumber} successful!`);
        fetchBookings();
      } else {
        const errorText = await paymentResponse.text();
        console.error('Payment failed:', errorText);
        toast.error('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error processing payment');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8090/api/bookings/user/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const bookingsData = await response.json();
        console.log("User bookings raw data:", bookingsData);
        
        const processedBookings = await Promise.all(
          bookingsData.map(async (booking: any) => {
            // Check if booking has a review
            let hasReview = false;
            if (booking.status === "COMPLETED" && booking.driver?.id) {
              try {
                const reviewResponse = await fetch(
                  `http://localhost:8090/api/driver-reviews/booking/${booking.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                hasReview = reviewResponse.ok;
              } catch (error) {
                console.error("Error checking review:", error);
              }
            }

            return {
              id: booking.id,
              bookingNumber: booking.bookingNumber || `BK-${booking.id}`,
              vehicleName: booking.vehicle?.name || booking.vehicleName || "Unknown Vehicle",
              driverName: booking.driver?.name || booking.driverName || (booking.status === "PENDING" ? "Not Assigned" : "N/A"),
              driverPhone: booking.driver?.phoneNumber || booking.driverPhone,
              driverEmail: booking.driver?.email || booking.driverEmail,
              driverId: booking.driver?.id,
              pickupLocation: booking.pickupLocation || "N/A",
              dropoffLocation: booking.dropoffLocation || "N/A",
              startDate: booking.startDate,
              endDate: booking.endDate,
              status: booking.status,
              paymentStatus: booking.paymentStatus,
              totalPrice: booking.totalPrice || 0,
              hasReview,
            };
          })
        );
        
        console.log("Processed bookings:", processedBookings);
        setBookings(processedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
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
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <p className="text-muted-foreground">View and manage all your vehicle reservations</p>
        </div>
        <Button onClick={fetchBookings}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {bookings.filter(b => ["CONFIRMED", "IN_PROGRESS", "DRIVER_ASSIGNED"].includes(b.status)).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">
                {bookings.filter(b => b.status === "COMPLETED").length}
              </p>
            </div>
            <Car className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{booking.vehicleName || "Vehicle"}</h3>
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
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Booking #{booking.bookingNumber}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{booking.pickupLocation}</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{booking.dropoffLocation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                    </div>
                    <span>to</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${(booking.totalPrice ?? 0).toFixed(2)}</p>
                  <div className="flex flex-col gap-2 mt-2">
                    {booking.status === 'COMPLETED' && booking.paymentStatus !== 'COMPLETED' && (
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handlePayment(booking.id, booking.totalPrice, booking.bookingNumber)}
                      >
                        Pay Now
                      </Button>
                    )}
                    {booking.paymentStatus === 'COMPLETED' && (
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-sm font-medium">
                        Paid ✓
                      </div>
                    )}
                    {booking.status === 'COMPLETED' && booking.driverId && !booking.hasReview && (
                      <Button 
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                        onClick={() => {
                          setBookingToReview(booking);
                          setReviewDialogOpen(true);
                        }}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Review Driver
                      </Button>
                    )}
                    {booking.hasReview && (
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 fill-blue-700" />
                        Reviewed
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-4">Start by browsing our available vehicles</p>
            <Button onClick={() => window.location.href = '/vehicles'}>Browse Vehicles</Button>
          </Card>
        )}
      </div>

      <BookingDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={selectedBooking}
        userType="user"
        onReviewSubmitted={() => {
          fetchBookings(); // Refresh bookings to update hasReview status
        }}
      />

      <ReviewDriverDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        booking={bookingToReview}
        onReviewSubmitted={() => {
          setReviewDialogOpen(false);
          fetchBookings(); // Refresh bookings to update hasReview status
        }}
      />
    </div>
  );
};

export default UserBookings;
