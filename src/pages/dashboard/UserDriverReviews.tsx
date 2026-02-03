import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, User, Calendar, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BookingDetailsDialog } from "@/components/BookingDetailsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RatingBadge from "@/components/RatingBadge";
import StarRating from "@/components/StarRating";

interface DriverReview {
  id: number;
  rating: number;
  comment: string;
  driverName: string;
  bookingNumber: string;
  createdAt: string;
}

interface CompletedBooking {
  id: number;
  bookingNumber: string;
  vehicleName: string;
  driverName?: string;
  driverPhone?: string;
  driverEmail?: string;
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  bookingDate: string;
}

const UserDriverReviews = () => {
  const [myReviews, setMyReviews] = useState<DriverReview[]>([]);
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    await Promise.all([fetchMyReviews(), fetchCompletedBookings()]);
    setLoading(false);
  };

  const fetchMyReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/driver-reviews/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMyReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    }
  };

  const fetchCompletedBookings = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/bookings/user/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const completed = data
          .filter((booking: any) => booking.status === "COMPLETED")
          .map((booking: any) => ({
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            vehicleName: booking.vehicle?.name || "Unknown Vehicle",
            driverName: booking.driver?.name,
            driverPhone: booking.driver?.phone,
            driverEmail: booking.driver?.email,
            pickupLocation: booking.pickupLocation || "N/A",
            dropoffLocation: booking.dropoffLocation || "N/A",
            bookingDate: booking.createdAt,
            startDate: booking.startDate,
            endDate: booking.endDate,
            status: booking.status,
            totalPrice: booking.totalPrice || 0,
          }));
        setCompletedBookings(completed);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const checkIfReviewed = (bookingId: number) => {
    return myReviews.some(review => review.bookingNumber === completedBookings.find(b => b.id === bookingId)?.bookingNumber);
  };

  const handleOpenReviewDialog = (booking: CompletedBooking) => {
    setSelectedBooking(booking);
    setBookingDialogOpen(true);
  };

  const avgRating = myReviews.length > 0
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : "0.0";

  // Calculate counts for tabs
  const pendingCount = completedBookings.filter(b => !checkIfReviewed(b.id)).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-yellow-400 border-t-transparent mb-3"></div>
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Driver Reviews</h2>
        <p className="text-muted-foreground">Share your experience with your drivers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
              <p className="text-3xl font-bold">{myReviews.length}</p>
            </div>
            <MessageSquare className="h-10 w-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{avgRating}</span>
                <StarRating rating={Math.round(parseFloat(avgRating))} size="md" animated />
              </div>
            </div>
            <Star className="h-10 w-10 text-yellow-400 fill-yellow-400" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Reviews</p>
              <p className="text-3xl font-bold">
                {completedBookings.filter(b => !checkIfReviewed(b.id)).length}
              </p>
            </div>
            <AlertCircle className="h-10 w-10 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 bg-gradient-to-br from-orange-400 to-red-600 animate-pulse border-0">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="submitted" className="gap-2">
            Submitted
            {myReviews.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-gradient-to-br from-green-400 to-green-600 text-white border-0">
                {myReviews.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="mt-6">
          {completedBookings.filter(b => !checkIfReviewed(b.id)).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedBookings
                .filter(b => !checkIfReviewed(b.id))
                .map((booking) => (
                  <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{booking.vehicleName}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            Trip #{booking.bookingNumber}
                          </Badge>
                        </div>
                        <Badge className="bg-orange-500">Review Needed</Badge>
                      </div>

                      <Separator />

                      <div className="space-y-2 text-sm">
                        {booking.driverName && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.driverName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOpenReviewDialog(booking)}
                        className="w-full"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Write Review
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                You have no pending reviews at the moment
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Submitted Reviews Tab */}
        <TabsContent value="submitted" className="mt-6">
          {myReviews.length > 0 ? (
            <div className="space-y-4">
              {myReviews.map((review) => (
                <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                          <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{review.driverName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Trip #{review.bookingNumber}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <RatingBadge rating={review.rating} variant="gradient" size="sm" animated />
                    </div>

                    {review.comment && (
                      <>
                        <Separator />
                        <p className="text-sm text-muted-foreground">
                          "{review.comment}"
                        </p>
                      </>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Review
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Complete trips and rate your drivers to help other customers
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Details Dialog with Review Form */}
      {selectedBooking && (
        <BookingDetailsDialog
          open={bookingDialogOpen}
          onOpenChange={(open) => {
            setBookingDialogOpen(open);
            if (!open) {
              fetchData();
            }
          }}
          booking={selectedBooking}
          userType="user"
          onReviewSubmitted={() => {
            fetchData(); // Refresh reviews immediately after submission
          }}
        />
      )}
    </div>
  );
};

export default UserDriverReviews;
