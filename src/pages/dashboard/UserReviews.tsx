import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Review {
  id: number;
  rating: number;
  comment: string;
  vehicleName: string;
  date: string;
  status?: string;
}

const UserReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching reviews for user:', user?.id);
      console.log('Token available:', !!token);
      console.log('Token:', token?.substring(0, 20) + '...');
      
      if (!user?.id) {
        console.error('No user ID found');
        toast.error('User session not found. Please login again.');
        return;
      }

      if (!token) {
        console.error('No authentication token found');
        toast.error('Authentication token missing. Please login again.');
        return;
      }
      
      const response = await fetch(`http://localhost:8090/api/reviews/user/${user.id}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('User reviews from API:', data);
        
        // Map the DTO data to component format
        const mappedReviews = data.map((review: any) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          vehicleName: review.vehicleName || 'Unknown Vehicle',
          date: review.createdAt,
          status: review.status
        }));
          
        console.log('Mapped user reviews:', mappedReviews);
        setReviews(mappedReviews);
        
        if (mappedReviews.length === 0) {
          console.log('No reviews found for user');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch reviews:', response.status, errorText);
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
        } else if (response.status === 403) {
          toast.error('Access denied. Please login again.');
        } else {
          toast.error('Failed to load reviews');
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error('Failed to load reviews. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

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
          <h2 className="text-2xl font-bold">My Reviews</h2>
          <p className="text-muted-foreground">View and manage your vehicle reviews</p>
        </div>
      </div>

      {reviews.some(r => r.status === 'PENDING') && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
            <div>
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Pending Reviews:</strong> Your reviews are awaiting admin approval before they appear publicly. 
                This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold">{reviews.length}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">{avgRating}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">
                {reviews.filter(r => {
                  const reviewDate = new Date(r.date);
                  const now = new Date();
                  return reviewDate.getMonth() === now.getMonth() && 
                         reviewDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{review.vehicleName || "Vehicle"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                  {review.status && (
                    <Badge 
                      variant={review.status === 'APPROVED' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {review.status === 'APPROVED' ? '✓ Approved' : '⏳ Pending Approval'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary">{review.rating}.0</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">{review.comment}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted-foreground mb-4">
            After completing a booking, you can leave a review for the vehicle
          </p>
          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
            <p><strong>Debug Info:</strong></p>
            <p>User ID: {user?.id || 'Not found'}</p>
            <p>User Email: {user?.email || 'Not found'}</p>
            <p>Endpoint: /api/reviews/user/{user?.id || 'undefined'}</p>
            <p className="mt-2 text-amber-600 dark:text-amber-400">
              If you've submitted reviews but don't see them here:
              <br />1. Check browser console (F12) for errors
              <br />2. Verify reviews have your user_id in the database
              <br />3. Make sure backend server restarted after code changes
            </p>
          </div>
          <Button className="mt-4">Browse Vehicles</Button>
        </Card>
      )}
    </div>
  );
};

export default UserReviews;
