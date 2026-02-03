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
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface DriverReview {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  userEmail: string;
  driverName: string;
  bookingNumber: string;
  createdAt: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const AdminReviews = () => {
  const [vehicleReviews, setVehicleReviews] = useState<Review[]>([]);
  const [driverReviews, setDriverReviews] = useState<DriverReview[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [activeTab, setActiveTab] = useState<'vehicle' | 'driver'>('vehicle');
  const { sendNotificationToUser } = useNotifications();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      // Load vehicle reviews from localStorage
      const storedReviews = localStorage.getItem('all_reviews');
      if (storedReviews) {
        const vehicleReviewsData = JSON.parse(storedReviews);
        console.log('Vehicle reviews loaded from localStorage:', vehicleReviewsData);
        setVehicleReviews(vehicleReviewsData);
      } else {
        console.log('No vehicle reviews found in localStorage');
      }

      // Load driver reviews from backend
      console.log('Fetching driver reviews from backend...');
      const response = await fetch('http://localhost:8090/api/driver-reviews', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Driver reviews response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Driver reviews data received:', data);
        setDriverReviews(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch driver reviews:', errorText);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    }
  };

  const handleApproveReview = async (reviewId: number) => {
    const allReviews: Review[] = JSON.parse(localStorage.getItem('all_reviews') || '[]');
    const reviewIndex = allReviews.findIndex((r: Review) => r.id === reviewId);
    
    if (reviewIndex === -1) {
      toast.error("Review not found");
      return;
    }

    const review = allReviews[reviewIndex];
    review.status = 'approved';
    
    allReviews[reviewIndex] = review;
    localStorage.setItem('all_reviews', JSON.stringify(allReviews));
    
    const vehicleReviews: Review[] = JSON.parse(localStorage.getItem(`vehicle_reviews_${review.vehicleId}`) || '[]');
    const vehicleReviewIndex = vehicleReviews.findIndex((r: Review) => r.id === reviewId);
    if (vehicleReviewIndex !== -1) {
      vehicleReviews[vehicleReviewIndex].status = 'approved';
      localStorage.setItem(`vehicle_reviews_${review.vehicleId}`, JSON.stringify(vehicleReviews));
    }
    
    if (review.userId) {
      const userReviews: Review[] = JSON.parse(localStorage.getItem(`user_reviews_${review.userId}`) || '[]');
      const userReviewIndex = userReviews.findIndex((r: Review) => r.id === reviewId);
      if (userReviewIndex !== -1) {
        userReviews[userReviewIndex].status = 'approved';
        localStorage.setItem(`user_reviews_${review.userId}`, JSON.stringify(userReviews));
      }
    }
    
    loadReviews();
    toast.success("Review approved successfully");
    
    if (review.userId) {
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
  };

  const handleRejectReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to reject and delete this review?")) {
      return;
    }

    const allReviews: Review[] = JSON.parse(localStorage.getItem('all_reviews') || '[]');
    const review = allReviews.find((r: Review) => r.id === reviewId);
    
    if (!review) {
      toast.error("Review not found");
      return;
    }
    
    const updatedAllReviews = allReviews.filter((r: Review) => r.id !== reviewId);
    localStorage.setItem('all_reviews', JSON.stringify(updatedAllReviews));
    
    const vehicleReviews: Review[] = JSON.parse(localStorage.getItem(`vehicle_reviews_${review.vehicleId}`) || '[]');
    const updatedVehicleReviews = vehicleReviews.filter((r: Review) => r.id !== reviewId);
    localStorage.setItem(`vehicle_reviews_${review.vehicleId}`, JSON.stringify(updatedVehicleReviews));
    
    if (review.userId) {
      const userReviews: Review[] = JSON.parse(localStorage.getItem(`user_reviews_${review.userId}`) || '[]');
      const updatedUserReviews = userReviews.filter((r: Review) => r.id !== reviewId);
      localStorage.setItem(`user_reviews_${review.userId}`, JSON.stringify(updatedUserReviews));
    }
    
    loadReviews();
    toast.success("Review rejected and deleted");
    
    if (review.userId) {
      await sendNotificationToUser(review.userId, {
        title: "Review Not Approved",
        message: `Your review for ${review.vehicleName} did not meet our community guidelines and has been removed.`,
        type: "WARNING",
        category: "REVIEW",
        isRead: false
      });
    }
  };

  const handleApproveDriverReview = async (reviewId: number) => {
    try {
      const response = await fetch(`http://localhost:8090/api/driver-reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Driver review approved successfully');
        loadReviews();
      } else {
        toast.error('Failed to approve driver review');
      }
    } catch (error) {
      console.error('Error approving driver review:', error);
      toast.error('Failed to approve driver review');
    }
  };

  const handleRejectDriverReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to reject this driver review?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8090/api/driver-reviews/${reviewId}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Driver review rejected successfully');
        loadReviews();
      } else {
        toast.error('Failed to reject driver review');
      }
    } catch (error) {
      console.error('Error rejecting driver review:', error);
      toast.error('Failed to reject driver review');
    }
  };

  const handleDeleteDriverReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this driver review?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8090/api/driver-reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Driver review deleted successfully');
        loadReviews();
      } else {
        toast.error('Failed to delete driver review');
      }
    } catch (error) {
      console.error('Error deleting driver review:', error);
      toast.error('Failed to delete driver review');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Review Management</h1>
                <p className="text-muted-foreground">Moderate vehicle reviews and driver reviews separately</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadReviews}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
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
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Driver Reviews</p>
                    <p className="text-3xl font-bold">{driverReviews.length}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {driverReviews.filter(r => r.status === 'PENDING').length} Pending
                  </Badge>
                  <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                    {driverReviews.filter(r => r.status === 'APPROVED').length} Approved
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tabs for Vehicle and Driver Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vehicle' | 'driver')} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="vehicle" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Vehicle Reviews
                </TabsTrigger>
                <TabsTrigger value="driver" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Driver Reviews
                </TabsTrigger>
              </TabsList>

              {/* Vehicle Reviews Tab */}
              <TabsContent value="vehicle">
                <div className="mb-4">
                  <Card className="p-2">
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
                    
                    console.log('[AdminReviews] Vehicle reviews state:', vehicleReviews);
                    console.log('[AdminReviews] Filtered vehicle reviews:', filteredReviews);
                    console.log('[AdminReviews] Current filter:', reviewFilter);
                    
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
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{review.rating}</span>
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
              </TabsContent>

              {/* Driver Reviews Tab */}
              <TabsContent value="driver">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <Card className="p-2 flex-1">
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
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard/admin")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">
                      {reviewFilter === 'all' ? 'All Driver Reviews' : 
                       reviewFilter === 'pending' ? 'Pending Driver Reviews' : 'Approved Driver Reviews'}
                    </h3>
                  </div>
                  {driverReviews.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Driver</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead>Booking</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {driverReviews
                          .filter(review => {
                            if (reviewFilter === 'all') return true;
                            if (reviewFilter === 'pending') return review.status === 'PENDING';
                            if (reviewFilter === 'approved') return review.status === 'APPROVED';
                            return true;
                          })
                          .sort((a, b) => {
                            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
                            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                          })
                          .map((review) => (
                            <TableRow key={review.id}>
                              <TableCell className="font-medium">
                                {review.driverName}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{review.userName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {review.userEmail}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{review.rating}</span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <p className="text-sm line-clamp-2">{review.comment || 'No comment'}</p>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  #{review.bookingNumber}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {review.status === 'PENDING' ? (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                    Pending
                                  </Badge>
                                ) : review.status === 'APPROVED' ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                    Approved
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                                    Rejected
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {review.status === 'PENDING' ? (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Approve Review"
                                      onClick={() => handleApproveDriverReview(review.id)}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Reject Review"
                                      onClick={() => handleRejectDriverReview(review.id)}
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
                                    onClick={() => handleDeleteDriverReview(review.id)}
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
                    <p className="text-muted-foreground text-center py-8">No driver reviews yet</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminReviews;
