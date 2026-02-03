import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Users, Gauge, Fuel, CheckCircle, Shield, Clock, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

interface Vehicle {
  id: number;
  name: string;
  category: string;
  pricePerDay: number;
  pricePerKm: number;
  image: string;
  rating: number;
  reviewCount: number;
  seats: number;
  transmission: string;
  fuelType: string;
  features: string[];
  available: boolean;
  description?: string;
  year?: number;
  color?: string;
}

const VehicleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { createReviewNotification } = useNotifications();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [autoApproveReviews, setAutoApproveReviews] = useState(false);

  // Load auto-approve setting
  useEffect(() => {
    const loadAutoApproveSetting = async () => {
      try {
        const token = localStorage.getItem("token");
        // Get admin user (ID 1) preferences for auto-approve setting
        const response = await fetch(`http://localhost:8090/api/preferences/1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const prefs = await response.json();
          setAutoApproveReviews(prefs.autoApproveBookings ?? false);
        }
      } catch (error) {
        console.error("Error loading auto-approve setting:", error);
      }
    };
    loadAutoApproveSetting();
  }, []);

  // Load saved reviews from API on component mount
  useEffect(() => {
    const fetchVehicleReviews = async () => {
      try {
        console.log(`Fetching reviews for vehicle ${id}...`);
        const response = await fetch(`http://localhost:8090/api/reviews/vehicle/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched vehicle reviews:', data);
          
          // Map backend DTO to frontend format
          const mappedReviews = data.map((review: any) => ({
            id: review.id,
            name: review.userName || 'Anonymous',
            rating: review.rating,
            comment: review.comment,
            date: review.createdAt,
            status: review.status.toLowerCase(),
            vehicleId: review.vehicleId,
            userId: review.userId || null,
          }));
          
          setUserReviews(mappedReviews);
        } else {
          console.error('Failed to fetch vehicle reviews:', response.status);
        }
      } catch (error) {
        console.error('Error fetching vehicle reviews:', error);
      }
    };
    
    if (id) {
      fetchVehicleReviews();
    }
  }, [id]);

  // Filter to show only approved reviews to regular users
  const vehicleReviews = userReviews.filter(review => review.status === 'approved');

  // Calculate real rating and review count from approved reviews only
  const calculateRating = () => {
    const approvedReviews = userReviews.filter(review => review.status === 'approved');
    if (approvedReviews.length === 0) return 0;
    const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / approvedReviews.length);
  };

  const realRating = calculateRating();
  const realReviewCount = userReviews.filter(review => review.status === 'approved').length;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced client-side validation
    if (!reviewRating || reviewRating === 0) {
      toast.error("Please select a rating (1-5 stars)");
      return;
    }

    if (!reviewComment || reviewComment.trim() === '') {
      toast.error("Please provide a comment for your review");
      return;
    }

    if (reviewComment.trim().length < 10) {
      toast.error("Review comment must be at least 10 characters long");
      return;
    }

    if (reviewComment.length > 2000) {
      toast.error("Review comment must not exceed 2000 characters");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    if (!user || !user.id) {
      toast.error("You must be logged in to submit a review");
      return;
    }

    if (!id) {
      toast.error("Vehicle information is missing");
      return;
    }

    setIsSubmittingReview(true);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        setIsSubmittingReview(false);
        return;
      }

      // Validate vehicle ID is a valid number
      const vehicleId = parseInt(id);
      if (isNaN(vehicleId)) {
        toast.error("Invalid vehicle ID");
        setIsSubmittingReview(false);
        return;
      }

      // Create review object for backend
      const reviewData = {
        user: { id: user.id },
        vehicle: { id: vehicleId },
        rating: reviewRating,
        comment: reviewComment.trim(),
        status: autoApproveReviews ? 'APPROVED' : 'PENDING'
      };

      console.log("=== SUBMITTING REVIEW ===");
      console.log("User ID:", user.id);
      console.log("Vehicle ID:", vehicleId);
      console.log("Rating:", reviewRating);
      console.log("Comment length:", reviewComment.trim().length);
      console.log("Status:", reviewData.status);
      console.log("Full payload:", JSON.stringify(reviewData, null, 2));

      // Submit to backend API
      const response = await fetch("http://localhost:8090/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      console.log("=== RESPONSE STATUS:", response.status, "===");

      if (!response.ok) {
        // Try to parse error response as JSON first
        let errorMessage = "Unknown error occurred";
        try {
          // Clone the response so we can read it multiple times if needed
          const responseClone = response.clone();
          const errorData = await response.json();
          console.error("Error response (JSON):", errorData);
          
          // Extract error message from various possible formats
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(", ");
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        } catch (jsonError) {
          // If not JSON, try as text from cloned response
          try {
            const errorText = await response.clone().text();
            console.error("Error response (Text):", errorText);
            errorMessage = errorText || `HTTP ${response.status}`;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}`;
          }
        }

        // Provide specific error messages based on status code
        if (response.status === 400) {
          toast.error(`Validation Error: ${errorMessage}`);
        } else if (response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          toast.error("You don't have permission to submit reviews.");
        } else if (response.status === 404) {
          toast.error("Vehicle not found. Please refresh and try again.");
        } else if (response.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(`Failed to submit review: ${errorMessage}`);
        }
        
        throw new Error(`Failed to submit review: ${response.status} - ${errorMessage}`);
      }

      const savedReview = await response.json();
      console.log("=== REVIEW SAVED SUCCESSFULLY ===");
      console.log("Saved review ID:", savedReview.id);
      console.log("Review data:", savedReview);

      // Refresh reviews from API
      const reviewsResponse = await fetch(`http://localhost:8090/api/reviews/vehicle/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        const mappedReviews = reviewsData.map((review: any) => ({
          id: review.id,
          name: review.userName || 'Anonymous',
          rating: review.rating,
          comment: review.comment,
          date: review.createdAt,
          status: review.status.toLowerCase(),
          vehicleId: review.vehicleId,
          userId: review.userId || null,
        }));
        setUserReviews(mappedReviews);
      }
      
      // Notify based on auto-approve status
      if (autoApproveReviews) {
        toast.success("Thank you for your review! It has been published.");
      } else {
        toast.success("Thank you for your review! It is pending admin approval.");
      }
      
      // Clear form
      setReviewName("");
      setReviewComment("");
      setReviewRating(0);
      
    } catch (error: any) {
      console.error("=== ERROR SUBMITTING REVIEW ===");
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);
      console.error("Full error:", error);
      
      // Only show toast if we haven't already shown one
      if (!error.message.includes("Failed to submit review:")) {
        if (error.message === "Failed to fetch") {
          toast.error("Network error. Please check your connection and try again.");
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`http://localhost:8090/api/vehicles/${id}`);
        if (response.ok) {
          const data = await response.json();
          setVehicle(data);
        } else {
          setVehicle(null);
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Vehicle Not Found</h1>
            <Link to="/vehicles">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vehicles
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link to="/vehicles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vehicles
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-96 bg-muted rounded-2xl overflow-hidden"
              >
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-hero text-primary-foreground capitalize">
                    {vehicle.category}
                  </Badge>
                </div>
                {!vehicle.available && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-6 py-2">
                      Currently Unavailable
                    </Badge>
                  </div>
                )}
              </motion.div>

              {/* Vehicle Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{vehicle.name}</h1>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-5 w-5 fill-warning text-warning" />
                          <span className="font-semibold text-lg">
                            {realReviewCount > 0 ? realRating.toFixed(1) : 'No ratings yet'}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          ({realReviewCount} {realReviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted p-3 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Seats</div>
                        <div className="font-semibold">{vehicle.seats}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted p-3 rounded-lg">
                        <Gauge className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Transmission</div>
                        <div className="font-semibold">{vehicle.transmission}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted p-3 rounded-lg">
                        <Fuel className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Fuel Type</div>
                        <div className="font-semibold">{vehicle.fuelType}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted p-3 rounded-lg">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Availability</div>
                        <div className="font-semibold">
                          {vehicle.available ? "Available" : "Unavailable"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Features & Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vehicle.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-2xl">Customer Reviews</h3>
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {realReviewCount > 0 ? `${realRating.toFixed(1)} (${realReviewCount} ${realReviewCount === 1 ? 'review' : 'reviews'})` : 'No reviews yet'}
                    </Badge>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6 mb-8">
                    {vehicleReviews.map((review) => (
                      <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                            <AvatarFallback className="bg-gradient-hero text-primary-foreground font-semibold">
                              {getInitials(review.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{review.name}</h4>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-gray-300 text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  {/* Write Review Form */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Write a Review
                    </h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label htmlFor="reviewName">Your Name *</Label>
                        <Input
                          id="reviewName"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="Enter your name"
                          className="mt-2"
                          required
                        />
                      </div>

                      <div>
                        <Label>Rating *</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  star <= (hoveredRating || reviewRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-300 text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="reviewComment">Your Review *</Label>
                        <Textarea
                          id="reviewComment"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this vehicle..."
                          className="mt-2 min-h-[100px]"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmittingReview}
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="sticky top-24"
              >
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary mb-1">
                      ${vehicle.pricePerDay}
                    </div>
                    <div className="text-muted-foreground">per day</div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-2xl font-semibold text-amber-600">
                        ${vehicle.pricePerKm || 2.00}/km
                      </div>
                      <div className="text-xs text-muted-foreground">route pricing</div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Fully Insured</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>24/7 Support</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <Link to={`/booking/${vehicle.id}`} className="block">
                    <Button
                      size="lg"
                      variant="hero"
                      className="w-full"
                      disabled={!vehicle.available}
                    >
                      {vehicle.available ? "Book This Vehicle" : "Currently Unavailable"}
                    </Button>
                  </Link>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Free cancellation up to 24 hours before pickup
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VehicleDetail;
