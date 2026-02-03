import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Car,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved';
  vehicleId: number;
  vehicleName: string;
  userId: number | null;
  userEmail: string | null;
}

const AdminVehicleReviews = () => {
  const [vehicleReviews, setVehicleReviews] = useState<Review[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const { sendNotificationToUser } = useNotifications();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      console.log('Fetching vehicle reviews from API...');
      const response = await fetch('http://localhost:8090/api/reviews', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched reviews from API:', data);
        
        // Map backend DTO to frontend format
        const mappedReviews = data.map((review: any) => ({
          id: review.id,
          name: review.userName || 'Anonymous',
          rating: review.rating,
          comment: review.comment,
          date: review.createdAt,
          status: review.status.toLowerCase() as 'pending' | 'approved',
          vehicleId: review.vehicleId,
          vehicleName: review.vehicleName || 'Unknown Vehicle',
          userId: review.userId || null,
          userEmail: review.userEmail || null,
        }));
        
        setVehicleReviews(mappedReviews);
      } else {
        console.error('Failed to fetch reviews:', response.status);
        toast.error('Failed to load reviews from server');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    }
  };

  const handleApproveReview = async (reviewId: number) => {
    try {
      const response = await fetch(`http://localhost:8090/api/reviews/${reviewId}/status?status=APPROVED`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        toast.success("Review approved successfully");
        loadReviews(); // Reload reviews from API
        
        // Send notification to user
        const review = vehicleReviews.find(r => r.id === reviewId);
        if (review && review.userId) {
          await sendNotificationToUser(review.userId, {
            title: "Review Approved",
            message: `Your review for ${review.vehicleName} has been approved and is now visible to other users.`,
            type: "SUCCESS",
            category: "REVIEW",
            actionUrl: `/vehicles/${review.vehicleId}`,
            isRead: false,
            metadata: { vehicleId: review.vehicleId }
          });
        }
      } else {
        toast.error('Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleRejectReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to reject and delete this review?")) {
      return;
    }

    try {
      const review = vehicleReviews.find(r => r.id === reviewId);
      
      const response = await fetch(`http://localhost:8090/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        toast.success("Review rejected and deleted");
        loadReviews(); // Reload reviews from API
        
        // Send notification to user
        if (review && review.userId) {
          await sendNotificationToUser(review.userId, {
            title: "Review Not Approved",
            message: `Your review for ${review.vehicleName} did not meet our community guidelines and has been removed.`,
            type: "WARNING",
            category: "REVIEW",
            actionUrl: `/vehicles/${review.vehicleId}`,
            isRead: false,
            metadata: { vehicleId: review.vehicleId }
          });
        }
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard/admin")}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Vehicle Reviews Management</h1>
                <p className="text-muted-foreground">Moderate customer reviews about vehicles</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadReviews}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Reviews</p>
                    <p className="text-3xl font-bold">{vehicleReviews.length}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {vehicleReviews.filter(r => r.status === 'pending').length} Pending
                  </Badge>
                  <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                    {vehicleReviews.filter(r => r.status === 'approved').length} Approved
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="space-y-6">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-4">
                <Card className="p-4 flex-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">Filter Reviews</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={reviewFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setReviewFilter('all')}
                      size="sm"
                    >
                      All
                    </Button>
                    <Button
                      variant={reviewFilter === 'pending' ? 'default' : 'outline'}
                      onClick={() => setReviewFilter('pending')}
                      size="sm"
                    >
                      Pending
                    </Button>
                    <Button
                      variant={reviewFilter === 'approved' ? 'default' : 'outline'}
                      onClick={() => setReviewFilter('approved')}
                      size="sm"
                    >
                      Approved
                    </Button>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {reviewFilter === 'all' ? 'All Vehicle Reviews' : 
                       reviewFilter === 'pending' ? 'Pending Vehicle Reviews' : 'Approved Vehicle Reviews'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total: {vehicleReviews.length} reviews | 
                      Showing: {vehicleReviews.filter(r => reviewFilter === 'all' || r.status === reviewFilter).length}
                    </p>
                  </div>
                </div>
                {(() => {
                  const filteredReviews = vehicleReviews.filter(review => 
                    reviewFilter === 'all' || review.status === reviewFilter
                  ).sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return b.id - a.id;
                  });
                  
                  console.log('[AdminVehicleReviews] Vehicle reviews state:', vehicleReviews);
                  console.log('[AdminVehicleReviews] Filtered vehicle reviews:', filteredReviews);
                  console.log('[AdminVehicleReviews] Current filter:', reviewFilter);
                  
                  return filteredReviews.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell className="font-medium">
                              {review.vehicleName}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{review.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {review.userEmail || 'No email'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <StarRating rating={review.rating} size="sm" showValue={false} animated={false} />
                                <span className="font-semibold text-amber-600 dark:text-amber-500">{review.rating}.0</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="text-sm line-clamp-2">{review.comment}</p>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {review.date}
                            </TableCell>
                            <TableCell>
                              {review.status === 'pending' ? (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                  Pending
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                  Approved
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {review.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Approve Review"
                                    onClick={() => handleApproveReview(review.id)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Reject Review"
                                    onClick={() => handleRejectReview(review.id)}
                                    className="text-destructive hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Delete Review"
                                  onClick={() => handleRejectReview(review.id)}
                                  className="text-destructive hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Vehicle Reviews</h3>
                    <p className="text-muted-foreground">
                      {vehicleReviews.length === 0 
                        ? 'No vehicle reviews have been submitted yet.' 
                        : `No ${reviewFilter} vehicle reviews found.`}
                    </p>
                  </div>
                );
                })()}
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminVehicleReviews;
