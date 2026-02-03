import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  UserCheck,
  Edit,
  Trash2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AssignDriverDialog from "@/components/AssignDriverDialog";
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
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

interface Booking {
  id: number;
  bookingNumber: string;
  userId: number;
  vehicleId: number;
  driverId?: number | null;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  userInfo?: {
    id: number;
    name: string;
    email: string;
  };
  vehicleInfo?: {
    id: number;
    name: string;
    category: string;
  };
}

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  status: string;
  role: string;
  available: boolean;
}

const AdminBookings = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showAssignDriver, setShowAssignDriver] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { token, handleUnauthorized } = useAuth();
  const { createBookingNotification, addNotification } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings
      const bookingsResponse = await fetch("http://localhost:8090/api/admin/bookings", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (bookingsResponse.status === 403 || bookingsResponse.status === 401) {
        handleUnauthorized();
        return;
      }

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      } else {
        const errorData = await bookingsResponse.json().catch(() => null);
        console.error("Failed to fetch bookings:", errorData);
        toast.error("Failed to load bookings");
      }

      // Fetch drivers
      const driversResponse = await fetch("http://localhost:8090/api/admin/drivers", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (driversResponse.ok) {
        const driversData = await driversResponse.json();
        setDrivers(driversData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDriver = async (bookingId: number, bookingNumber: string) => {
    if (!confirm(`Are you sure you want to remove the driver from booking "${bookingNumber}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8090/api/admin/bookings/${bookingId}/remove-driver`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Driver removed successfully");
        
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          if (booking.driverId) {
            addNotification({
              title: "Trip Assignment Removed",
              message: `You have been removed from trip ${bookingNumber}. The assignment has been cancelled.`,
              type: "WARNING",
              category: "TRIP",
              isRead: false,
              metadata: { bookingId }
            });
          }
          
          if (booking.userId) {
            addNotification({
              title: "Driver Removed",
              message: `The driver has been removed from your booking ${bookingNumber}. A new driver will be assigned soon.`,
              type: "INFO",
              category: "BOOKING",
              actionUrl: "/dashboard/user",
              isRead: false,
              metadata: { bookingId }
            });
          }
        }
        
        fetchData();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to remove driver");
      }
    } catch (error) {
      console.error("Error removing driver:", error);
      toast.error("An error occurred while removing the driver");
    }
  };

  const handleCompleteBooking = async (bookingId: number, bookingNumber: string) => {
    if (!confirm(`Are you sure you want to mark booking "${bookingNumber}" as completed?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8090/api/admin/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const completedBooking = bookings.find(b => b.id === bookingId);
        if (completedBooking) {
          await createBookingNotification(
            bookingId,
            completedBooking.userId,
            "USER",
            "COMPLETED"
          );
        }
        toast.success("Booking marked as completed");
        fetchData();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to complete booking");
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      toast.error("An error occurred while completing the booking");
    }
  };

  const handleCancelBooking = async (bookingId: number, bookingNumber: string) => {
    if (!confirm(`Are you sure you want to cancel booking #${bookingNumber}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8090/api/admin/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancellationReason: "Cancelled by admin"
        }),
      });

      if (response.ok) {
        const cancelledBooking = bookings.find(b => b.id === bookingId);
        if (cancelledBooking) {
          await createBookingNotification(
            bookingId,
            cancelledBooking.userId,
            "USER",
            "CANCELLED"
          );
        }
        toast.success(`Booking #${bookingNumber} has been cancelled`);
        fetchData();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("An error occurred while cancelling the booking");
    }
  };

  const activeBookings = bookings.filter(b => b.status === "PENDING" || b.status === "CONFIRMED").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Management</h1>
                <p className="text-muted-foreground">Manage all bookings and assignments</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchData}>
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
                  <div className="bg-success p-4 rounded-xl">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-3xl font-bold">{bookings.length}</p>
                  </div>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  {activeBookings} Active
                </Badge>
              </div>
            </Card>
          </motion.div>

          {/* Bookings Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">All Bookings</h3>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    Total: {bookings.length}
                  </Badge>
                  <Badge variant="default">
                    Active: {activeBookings}
                  </Badge>
                </div>
              </div>
              {bookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Pickup Location</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          #{booking.bookingNumber.substring(booking.bookingNumber.lastIndexOf('-') + 1)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{booking.userInfo?.name || `User ${booking.userId}`}</span>
                            <span className="text-xs text-muted-foreground">{booking.userInfo?.email || ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{booking.vehicleInfo?.name || `Vehicle ${booking.vehicleId}`}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {booking.vehicleInfo?.category.toLowerCase() || ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {booking.pickupLocation}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                            <span className="text-xs text-muted-foreground">
                              to {new Date(booking.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${booking.totalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "CONFIRMED"
                                ? "default"
                                : booking.status === "COMPLETED"
                                ? "secondary"
                                : booking.status === "PENDING"
                                ? "outline"
                                : "destructive"
                            }
                            className="capitalize"
                          >
                            {booking.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.driverId ? (
                            <Badge variant="secondary">Assigned</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not Assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.status === "CANCELLED" || booking.status === "COMPLETED" ? (
                            <span className="text-sm text-muted-foreground italic">
                              {booking.status === "CANCELLED" ? "Cancelled" : "Completed"}
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              {!booking.driverId ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Assign Driver" 
                                  onClick={() => { 
                                    setSelectedBooking(booking); 
                                    setShowAssignDriver(true); 
                                  }}
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Remove Driver" 
                                  onClick={() => handleRemoveDriver(booking.id, booking.bookingNumber)}
                                >
                                  <UserCheck className="h-4 w-4 text-orange-500" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Mark as Completed" 
                                onClick={() => handleCompleteBooking(booking.id, booking.bookingNumber)}
                              >
                                <Edit className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Cancel Booking" 
                                onClick={() => handleCancelBooking(booking.id, booking.bookingNumber)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No bookings yet</p>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />

      <AssignDriverDialog
        open={showAssignDriver}
        onOpenChange={setShowAssignDriver}
        booking={selectedBooking ? {
          id: selectedBooking.id,
          bookingNumber: selectedBooking.bookingNumber,
          userId: selectedBooking.userId,
          vehicleName: selectedBooking.vehicleInfo?.name,
          pickupLocation: selectedBooking.pickupLocation,
          startDate: selectedBooking.startDate,
          endDate: selectedBooking.endDate,
        } : null}
        drivers={drivers}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminBookings;
