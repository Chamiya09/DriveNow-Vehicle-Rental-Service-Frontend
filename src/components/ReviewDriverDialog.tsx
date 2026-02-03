import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReviewDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: number;
    bookingNumber: string;
    driverName?: string;
    driverId?: number;
  } | null;
  onReviewSubmitted?: () => void;
}

export function ReviewDriverDialog({ open, onOpenChange, booking, onReviewSubmitted }: ReviewDriverDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, token } = useAuth();

  if (!booking) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

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
        setComment("");
        onOpenChange(false);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Your Driver</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Driver Info */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Trip #{booking.bookingNumber}</p>
            <p className="text-lg font-semibold mt-1">{booking.driverName || "Driver"}</p>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all hover:scale-110"
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
            <p className="text-center text-sm text-muted-foreground">
              {rating === 0 ? "Select rating" : 
               rating === 1 ? "Poor" :
               rating === 2 ? "Fair" :
               rating === 3 ? "Good" :
               rating === 4 ? "Very Good" : "Excellent"}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comment (Optional)</label>
            <Textarea
              placeholder="Share your experience with this driver..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
