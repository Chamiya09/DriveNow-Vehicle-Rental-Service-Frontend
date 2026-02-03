import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, DollarSign, User, Car, Clock, Hash, Phone, Mail, Star, MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ReviewDriverDialog } from "./ReviewDriverDialog";
import { toast } from "sonner";

interface BookingDetails {
  id: number;
  bookingNumber: string;
  vehicleName: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  driverName?: string;
  driverPhone?: string;
  driverEmail?: string;
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  commission?: number;
  status: string;
  paymentStatus?: string;
}

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingDetails | null;
  userType?: 'user' | 'driver';  onReviewSubmitted?: () => void;}

interface DriverReview {
  id: number;
  rating: number;
  comment: string;
  driverName: string;
  userName: string;
  createdAt: string;
}

export function BookingDetailsDialog({ open, onOpenChange, booking, userType = 'user', onReviewSubmitted }: BookingDetailsDialogProps) {
  const [driverReview, setDriverReview] = useState<DriverReview | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (open && booking && booking.status === 'COMPLETED' && userType === 'user') {
      fetchDriverReview();
    } else {
      setDriverReview(null);
      setRating(0);
      setHoverRating(0);
      setComment("");
    }
  }, [open, booking, userType]);

  const fetchDriverReview = async () => {
    if (!booking) return;
    
    try {
      setLoadingReview(true);
      const response = await fetch(`http://localhost:8090/api/driver-reviews/booking/${booking.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Check if backend returned {exists: false} or actual review
        if (data && data.exists === false) {
          setDriverReview(null);
        } else if (data && data.id) {
          setDriverReview(data);
        } else {
          setDriverReview(null);
        }
      } else {
        setDriverReview(null);
      }
    } catch (error) {
      console.error("Error fetching driver review:", error);
      setDriverReview(null);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleReviewSubmitted = () => {
    setReviewDialogOpen(false);
    fetchDriverReview(); // Refresh the review after submission
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!booking) return;

    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:8090/api/driver-reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          userId: user?.id,
          rating: rating,
          comment: comment,
        }),
      });

      if (response.ok) {
        toast.success("Driver review submitted successfully!");
        setRating(0);
        setHoverRating(0);
        setComment("");
        fetchDriverReview(); // Refresh to show the submitted review
        if (onReviewSubmitted) {
          onReviewSubmitted(); // Notify parent to refresh
        }
      } else {
        const error = await response.json();
        const errorMessage = error.error || error.message || "Failed to submit review";
        toast.error(errorMessage);
        console.error("Review submission error:", error);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  if (!booking) return null;

  console.log("BookingDetailsDialog - booking:", booking);
  console.log("BookingDetailsDialog - userType:", userType);
  console.log("BookingDetailsDialog - booking.status:", booking.status);
  console.log("BookingDetailsDialog - Review section will show:", userType === 'user' && booking.status === 'COMPLETED');
  console.log("BookingDetailsDialog - customerName:", booking.customerName);
  console.log("BookingDetailsDialog - customerPhone:", booking.customerPhone);
  console.log("BookingDetailsDialog - customerEmail:", booking.customerEmail);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'DRIVER_ASSIGNED':
        return 'bg-blue-500';
      case 'ONGOING':
        return 'bg-yellow-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'PAID':
        return 'bg-emerald-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Number & Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Booking Number</p>
              <p className="text-lg font-bold">{booking.bookingNumber}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
              {booking.paymentStatus && (
                <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                  Payment: {booking.paymentStatus}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Vehicle Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Car className="h-4 w-4" />
              <span>Vehicle</span>
            </div>
            <p className="text-lg font-semibold">{booking.vehicleName}</p>
          </div>

          {/* Customer/Driver Information */}
          {userType === 'driver' && booking.customerName && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Customer Information</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-lg font-semibold">{booking.customerName}</p>
                {booking.customerPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${booking.customerPhone}`} className="text-primary hover:underline">
                      {booking.customerPhone}
                    </a>
                  </div>
                )}
                {booking.customerEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${booking.customerEmail}`} className="text-primary hover:underline">
                      {booking.customerEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {userType === 'user' && booking.driverName && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Driver Information</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-lg font-semibold">{booking.driverName}</p>
                {booking.driverPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${booking.driverPhone}`} className="text-primary hover:underline">
                      {booking.driverPhone}
                    </a>
                  </div>
                )}
                {booking.driverEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${booking.driverEmail}`} className="text-primary hover:underline">
                      {booking.driverEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Location Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>Pickup Location</span>
              </div>
              <p className="font-medium pl-6">{booking.pickupLocation}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-red-600" />
                <span>Drop-off Location</span>
              </div>
              <p className="font-medium pl-6">{booking.dropoffLocation}</p>
            </div>
          </div>

          <Separator />

          {/* Date Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Start Date</span>
              </div>
              <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(booking.startDate).toLocaleTimeString()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>End Date</span>
              </div>
              <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(booking.endDate).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Price Information */}
          <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Total Price</span>
              </div>
              <p className="text-xl font-bold">${(booking.totalPrice ?? 0).toFixed(2)}</p>
            </div>

            {userType === 'driver' && booking.commission !== undefined && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Commission (15%)</span>
                  <p className="text-lg font-bold text-green-600">
                    ${(booking.commission ?? 0).toFixed(2)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Duration */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>
              Duration: {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
            </span>
          </div>

          {/* ========== DRIVER REVIEW SECTION ========== */}
          {userType === 'user' && booking.status === 'COMPLETED' && (
            <>
              <Separator className="my-6" />
              
              {/* Clean Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <h2 className="text-xl font-semibold">Driver Review</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  Share your experience with this driver
                </p>
              </div>

              <div className="space-y-4">
                {loadingReview ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-yellow-400 border-t-transparent mb-3"></div>
                    <p className="text-muted-foreground">Loading review...</p>
                  </div>
                ) : driverReview ? (
                  <div className="border border-border bg-muted/30 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Star className="h-5 w-5 text-green-600 fill-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Review Submitted</h3>
                        <p className="text-sm text-muted-foreground">Thank you for your feedback</p>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    {/* Rating Display */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={driverReview.rating} size="lg" animated showValue />
                      </div>
                    </div>
                    
                    {/* Comment Display */}
                    {driverReview.comment && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Your Feedback</p>
                        </div>
                        <p className="text-sm text-muted-foreground italic pl-6">
                          "{driverReview.comment}"
                        </p>
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Driver</p>
                          <p className="text-sm font-medium">{booking.driverName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Reviewed</p>
                        <p className="text-sm font-medium">
                          {new Date(driverReview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-border bg-muted/30 p-6 rounded-lg space-y-6">
                    
                    {/* Rating Stars Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Rating</label>
                        {rating > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-yellow-600">{rating}</span>
                            <span className="text-sm text-muted-foreground">/ 5</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-center gap-2 py-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-all hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= (hoverRating || rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}  
                      </div>
                      
                      {rating === 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                          Please select a rating
                        </p>
                      )}
                    </div>

                    {/* Comment Box Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Comment (Optional)</label>
                      
                      <Textarea
                        placeholder="Share your experience with this driver..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                        className="min-h-[100px] resize-none"
                      />
                      
                      <p className="text-xs text-muted-foreground text-right">
                        {comment.length} / 500
                      </p>
                    </div>

                    {/* Driver Info & Submit Section */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Driver</p>
                          <p className="font-medium">{booking.driverName || 'Not Assigned'}</p>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleSubmitReview}
                        disabled={submitting || rating === 0}
                        className="gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Review
                          </>
                        )}
                      </Button>
                    </div>

                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>

      {/* Review Driver Dialog */}
      <ReviewDriverDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        booking={booking}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </Dialog>
  );
}
