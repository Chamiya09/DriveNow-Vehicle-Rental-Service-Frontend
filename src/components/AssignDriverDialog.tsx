import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { UserCheck, Car, MapPin, Calendar } from "lucide-react";

interface AssignDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: number;
    bookingNumber: string;
    userId: number;
    vehicleName?: string;
    pickupLocation?: string;
    startDate: string;
    endDate: string;
  } | null;
  drivers: Array<{
    id: number;
    name: string;
    email: string;
    licenseNumber?: string;
    status: string;
    available?: boolean;
  }>;
  onSuccess: () => void;
}

const AssignDriverDialog = ({ open, onOpenChange, booking, drivers, onSuccess }: AssignDriverDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const { token } = useAuth();
  const { createBookingNotification, createTripNotification } = useNotifications();

  const handleAssign = async () => {
    if (!selectedDriverId || !booking) {
      toast.error("Please select a driver");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`http://localhost:8090/api/admin/bookings/${booking.id}/assign-driver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId: parseInt(selectedDriverId) }),
      });

      if (response.ok) {
        // Notify user that booking is confirmed
        await createBookingNotification(
          booking.id,
          booking.userId,
          "USER",
          "CONFIRMED"
        );

        // Notify driver that they have been assigned
        await createTripNotification(
          booking.id,
          parseInt(selectedDriverId),
          "ASSIGNED"
        );

        toast.success("Driver assigned successfully!");
        setSelectedDriverId("");
        onSuccess();
        onOpenChange(false);
      } else {
        let errorMessage = "Failed to assign driver";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          console.error("Error parsing response:", e);
        }
        console.error("Failed to assign driver:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error("Failed to assign driver. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter for available drivers (available === true or undefined/null defaults to true)
  const availableDrivers = drivers.filter(d => (d.available !== false) && d.status === "ACTIVE");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Driver to Booking
          </DialogTitle>
        </DialogHeader>

        {booking && (
          <div className="space-y-6">
            {/* Booking Details */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Booking Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">#{booking.bookingNumber}</span>
                </div>
                {booking.vehicleName && (
                  <div className="flex items-center gap-2">
                    <Car className="h-3 w-3" />
                    <span>{booking.vehicleName}</span>
                  </div>
                )}
                {booking.pickupLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{booking.pickupLocation}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Selection */}
            <div className="space-y-2">
              <Label htmlFor="driver">Select Driver *</Label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.length > 0 ? (
                    availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{driver.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {driver.email} {driver.licenseNumber && `• License: ${driver.licenseNumber}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No available drivers
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {availableDrivers.length} active driver{availableDrivers.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={loading || !selectedDriverId || availableDrivers.length === 0}
                variant="hero"
              >
                {loading ? "Assigning..." : "Assign Driver"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverDialog;
