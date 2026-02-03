import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, Calendar, MessageSquare, TrendingUp, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarRating from "@/components/StarRating";
import RatingBadge from "@/components/RatingBadge";

interface DriverReview {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  bookingNumber: string;
  createdAt: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface CustomerBooking {
  id: number;
  bookingNumber: string;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  status: string;
}

const DriverReviewsList = () => {
  const [reviews, setReviews] = useState<DriverReview[]>([]);
  const [customerBookings, setCustomerBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about-me' | 'by-me'>('about-me');
  const { user, token } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchReviews();
      fetchCustomerBookings();
    }
  }, [user?.id]);

  const fetchReviews = async () => {
    try {
      console.log('Fetching driver reviews for driver ID:', user?.id);
      const response = await fetch(`http://localhost:8090/api/driver-reviews/driver/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Driver reviews response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Driver reviews data received:', data);
        // Only show approved reviews to drivers
        const approvedReviews = data.filter((review: DriverReview) => review.status === 'APPROVED');
        console.log('Approved reviews:', approvedReviews);
        setReviews(approvedReviews);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch driver reviews:', errorText);
        toast.error("Failed to load reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerBookings = async () => {
    try {
      console.log('Fetching customer bookings for driver ID:', user?.id);
      const response = await fetch(`http://localhost:8090/api/bookings/driver/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const bookings = await response.json();
        // Filter only completed bookings
        const completedBookings = bookings
          .filter((booking: any) => booking.status === 'COMPLETED')
          .map((booking: any) => ({
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            userName: booking.userName || 'Customer',
            userEmail: booking.userEmail || '',
            startDate: booking.startDate,
            endDate: booking.endDate,
            status: booking.status,
          }));
        console.log('Completed customer bookings:', completedBookings);
        setCustomerBookings(completedBookings);
      } else {
        console.error('Failed to fetch customer bookings');
      }
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-yellow-400 border-t-transparent mb-3"></div>
        <p className="text-muted-foreground">Loading your reviews...</p>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse();
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Reviews Management</h2>
        <p className="text-muted-foreground">View reviews about you and provide feedback about customers</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'about-me' | 'by-me')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="about-me" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Reviews About Me
          </TabsTrigger>
          <TabsTrigger value="by-me" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Customer Reviews
          </TabsTrigger>
        </TabsList>

        {/* Reviews About Driver Tab */}
        <TabsContent value="about-me" className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
              <p className="text-3xl font-bold">{reviews.length}</p>
            </div>
            <MessageSquare className="h-10 w-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Performance</p>
              <p className="text-3xl font-bold">
                {totalReviews > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / totalReviews) * 100) : 0}%
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating, index) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalReviews > 0 ? (ratingDistribution[index] / totalReviews) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {ratingDistribution[index]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Reviews List */}
      <div>
        <h3 className="font-semibold mb-4">Recent Reviews</h3>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{review.userName}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <RatingBadge rating={review.rating} variant="premium" size="sm" animated showSparkles />
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
                    <Badge variant="outline" className="text-xs">
                      Trip #{review.bookingNumber}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground">
              Complete some trips to start receiving customer feedback
            </p>
          </Card>
        )}
      </div>
        </TabsContent>

        {/* Customer Reviews Tab (Reviews by Driver) */}
        <TabsContent value="by-me" className="space-y-6">
          {/* Info Card */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <div className="flex items-start gap-3">
              <UserCircle className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Review Your Customers
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Provide feedback about your completed trips to help maintain service quality.
                  This feature is coming soon - you'll be able to rate customers based on punctuality,
                  vehicle care, and overall experience.
                </p>
              </div>
            </div>
          </Card>

          {/* Completed Bookings List */}
          <div>
            <h3 className="font-semibold mb-4">Completed Trips</h3>
            {customerBookings.length > 0 ? (
              <div className="space-y-4">
                {customerBookings.map((booking) => (
                  <Card key={booking.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                          <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{booking.userName}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </div>
                          <Badge variant="outline" className="mt-2">
                            Trip #{booking.bookingNumber}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground italic">
                        Customer review feature coming soon
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Completed Trips</h3>
                <p className="text-muted-foreground">
                  Complete some trips to be able to review your customers
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverReviewsList;
