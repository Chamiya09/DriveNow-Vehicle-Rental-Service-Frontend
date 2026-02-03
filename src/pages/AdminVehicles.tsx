import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Edit,
  Trash2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddVehicleDialog from "@/components/AddVehicleDialog";
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

interface Vehicle {
  id: number;
  name: string;
  category: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  available: boolean;
  seats: number;
  transmission: string;
  fuelType: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const AdminVehicles = () => {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const { token, handleUnauthorized } = useAuth();
  const { sendNotificationToUser } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8090/api/vehicles", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 403 || response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        console.error("Failed to fetch vehicles:", response.status);
        toast.error("Failed to load vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVehicleAvailability = async (vehicleId: number, vehicleName: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    try {
      const response = await fetch(`http://localhost:8090/api/admin/vehicles/${vehicleId}/availability`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ available: newStatus }),
      });

      if (response.ok) {
        toast.success(`${vehicleName} is now ${newStatus ? "available" : "unavailable"}`);
        
        // Notify all admins about vehicle availability change
        const adminResponse = await fetch('http://localhost:8090/api/admin/users?role=ADMIN', {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (adminResponse.ok) {
          const admins = await adminResponse.json();
          admins.forEach(async (admin: User) => {
            await sendNotificationToUser(admin.id, {
              title: "Vehicle Status Updated",
              message: `${vehicleName} has been marked as ${newStatus ? 'available' : 'unavailable'} for rentals.`,
              type: "INFO",
              category: "SYSTEM",
              isRead: false,
              metadata: { vehicleId: vehicleId }
            });
          });
        }
        
        fetchVehicles();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to update vehicle availability");
      }
    } catch (error) {
      console.error("Error updating vehicle availability:", error);
      toast.error("An error occurred while updating vehicle availability");
    }
  };

  const handleDeleteVehicle = async (vehicleId: number, vehicleName: string) => {
    if (!confirm(`Are you sure you want to delete vehicle "${vehicleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8090/api/admin/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success(`Vehicle "${vehicleName}" has been deleted successfully`);
        fetchVehicles();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to delete vehicle");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("An error occurred while deleting the vehicle");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading vehicles...</p>
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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Vehicle Management</h1>
                <p className="text-muted-foreground">Manage fleet and vehicle availability</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchVehicles}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="hero" onClick={() => setShowAddVehicle(true)}>
                  <Car className="h-4 w-4 mr-2" />
                  Add Vehicle
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
                  <div className="bg-accent p-4 rounded-xl">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vehicles</p>
                    <p className="text-3xl font-bold">{vehicles.length}</p>
                  </div>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2 bg-green-600">
                  {vehicles.filter(v => v.available).length} Available
                </Badge>
              </div>
            </Card>
          </motion.div>

          {/* Vehicles Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">All Vehicles</h3>
              </div>
              {vehicles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price/Day</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>{vehicle.id}</TableCell>
                        <TableCell className="font-medium">{vehicle.name}</TableCell>
                        <TableCell className="capitalize">{vehicle.category.toLowerCase()}</TableCell>
                        <TableCell>${vehicle.pricePerDay}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{vehicle.rating} ⭐</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              vehicle.available
                                ? "bg-success text-success-foreground"
                                : "bg-destructive text-destructive-foreground"
                            }
                          >
                            {vehicle.available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              title="Toggle Availability"
                              onClick={() => handleToggleVehicleAvailability(vehicle.id, vehicle.name, vehicle.available)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              title="Delete Vehicle"
                              onClick={() => handleDeleteVehicle(vehicle.id, vehicle.name)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No vehicles yet</p>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />

      <AddVehicleDialog
        open={showAddVehicle}
        onOpenChange={setShowAddVehicle}
        onSuccess={fetchVehicles}
      />
    </div>
  );
};

export default AdminVehicles;
