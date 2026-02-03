import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, User, Calendar, MessageSquare, Search, Trash2, Filter, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import RatingBadge from "@/components/RatingBadge";

interface DriverReview {
  id: number;
  rating: number;
  comment: string;
  driverName: string;
  userName: string;
  bookingNumber: string;
  createdAt: string;
}

const AdminDriverReviews = () => {
  const [reviews, setReviews] = useState<DriverReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<DriverReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchTerm, filterRating, reviews]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8090/api/driver-reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
        setFilteredReviews(data);
      } else {
        toast.error("Failed to load reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRating !== null) {
      filtered = filtered.filter((review) => review.rating === filterRating);
    }

    setFilteredReviews(filtered);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`http://localhost:8090/api/driver-reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Review deleted successfully");
        fetchAllReviews();
      } else {
        toast.error("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const getAverageRating = () => {
    if (filteredReviews.length === 0) return 0;
    const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / filteredReviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    filteredReviews.forEach((review) => {
      distribution[review.rating - 1]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const distribution = getRatingDistribution();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/admin")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Driver Reviews Management</h1>
          <p className="text-muted-foreground">View and manage all customer reviews for drivers</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
                <p className="text-3xl font-bold">{filteredReviews.length}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{getAverageRating()}</p>
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <Star className="h-10 w-10 text-yellow-400 fill-yellow-400" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">5-Star Reviews</p>
                <p className="text-3xl font-bold">{distribution[4]}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Low Ratings</p>
                <p className="text-3xl font-bold">{distribution[0]}</p>
              </div>
              <Star className="h-10 w-10 text-red-400" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by driver name, customer name, or booking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
                <Button
                  variant={filterRating === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRating(null)}
                >
                  All
                </Button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Button
                    key={rating}
                    variant={filterRating === rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterRating(rating)}
                  >
                    {rating}★
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <Card key={review.id} className="p-6 hover:shadow-md transition-all duration-200 border-l-4 border-yellow-400">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-lg">{review.userName}</span>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold text-lg text-blue-600">
                          {review.driverName}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Badge variant="outline">Trip #{review.bookingNumber}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <RatingBadge rating={review.rating} variant="gradient" size="md" animated />
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {review.comment && (
                  <div className="mt-4 bg-muted/50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Customer Feedback:</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center border-dashed">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterRating
                  ? "Try adjusting your filters to see more reviews"
                  : "No customer reviews have been submitted yet"}
              </p>
            </Card>
          )}
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDriverReviews;
