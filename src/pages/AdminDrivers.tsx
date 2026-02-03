import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Shield,
  FileText,
  Eye,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddDriverDialog from "@/components/AddDriverDialog";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  status: string;
  role: string;
  available: boolean;
  driversLicense?: string;
  vehicleRegistration?: string;
  insuranceCertificate?: string;
}

const AdminDrivers = () => {
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const { token, handleUnauthorized } = useAuth();
  const { sendNotificationToUser } = useNotifications();
  const navigate = useNavigate();

  const handleViewDocument = (documentData: string) => {
    if (!documentData) {
      toast.error("Document not available");
      return;
    }
    
    try {
      // If it already has data: prefix, use it directly
      if (documentData.startsWith('data:')) {
        const newWindow = window.open();
        if (newWindow) {
          const mimeType = documentData.split(';')[0].split(':')[1];
          newWindow.document.write(`
            <html>
              <head><title>Document Viewer</title></head>
              <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0;">
                ${mimeType.startsWith('image') 
                  ? `<img src="${documentData}" style="max-width:100%; height:auto;" />` 
                  : `<iframe src="${documentData}" style="width:100vw; height:100vh; border:none;"></iframe>`
                }
              </body>
            </html>
          `);
          newWindow.document.close();
        }
        return;
      }

      // Remove leading slash if present
      const base64Data = documentData.startsWith('/') ? documentData.substring(1) : documentData;
      
      // Detect file type from base64 header
      let mimeType = 'application/pdf';
      
      // JPEG starts with /9j/
      if (base64Data.startsWith('/9j/') || base64Data.startsWith('9j/')) {
        mimeType = 'image/jpeg';
      } 
      // PNG starts with iVBORw0KGgo
      else if (base64Data.startsWith('iVBORw0KGgo')) {
        mimeType = 'image/png';
      }
      // PDF starts with JVBERi0
      else if (base64Data.startsWith('JVBERi0')) {
        mimeType = 'application/pdf';
      }
      
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Document Viewer</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0;">
              ${mimeType.startsWith('image') 
                ? `<img src="${dataUrl}" style="max-width:100%; height:auto;" />` 
                : `<iframe src="${dataUrl}" style="width:100vw; height:100vh; border:none;"></iframe>`
              }
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error("Error opening document:", error);
      toast.error("Failed to open document. Please try re-uploading the file.");
    }
  };

  const handleOpenDocumentsDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDocumentsDialog(true);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8090/api/admin/drivers", {
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
        setDrivers(data);
      } else {
        console.error("Failed to fetch drivers:", response.status);
        toast.error("Failed to load drivers");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDriver = async (driverId: number, driverName: string) => {
    if (!confirm(`Are you sure you want to delete driver "${driverName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8090/api/admin/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success(`Driver "${driverName}" has been deleted successfully`);
        fetchDrivers();
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Delete driver error:", errorData);
        // Provide a more generic error message to the user for StackOverflowError
        if (errorData?.message?.includes("StackOverflowError")) {
          toast.error("Failed to delete driver due to a server-side issue. Please try again later.");
        } else {
          toast.error(errorData?.message || "Failed to delete driver");
        }
      }
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("An error occurred while deleting the driver");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading drivers...</p>
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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Driver Management</h1>
                <p className="text-muted-foreground">Manage driver accounts and assignments</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchDrivers}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="hero" onClick={() => setShowAddDriver(true)}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Add Driver
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
                  <div className="bg-secondary p-4 rounded-xl">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Drivers</p>
                    <p className="text-3xl font-bold">{drivers.length}</p>
                  </div>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2 bg-green-600">
                  {drivers.filter(d => d.available).length} Available
                </Badge>
              </div>
            </Card>
          </motion.div>

          {/* Recent Drivers Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                  Recent Drivers
                  <Badge variant="outline" className="text-xs ml-2">
                    Last 5
                  </Badge>
                </h3>
              </div>
              {drivers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>License No.</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.slice(0, 5).map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.email}</TableCell>
                        <TableCell>
                          <span className="text-sm">{driver.licenseNumber || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap items-center">
                            {(driver.driversLicense || driver.vehicleRegistration || driver.insuranceCertificate) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleOpenDocumentsDialog(driver)}
                                title="View All Documents"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={driver.available ? "default" : "destructive"}
                            className={driver.available ? "bg-green-600" : ""}
                          >
                            {driver.available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-success text-success-foreground capitalize">
                            {driver.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              title="Delete Driver"
                              onClick={() => handleDeleteDriver(driver.id, driver.name)}
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
                <p className="text-muted-foreground text-center py-8">No drivers yet</p>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />

      <AddDriverDialog
        open={showAddDriver}
        onOpenChange={setShowAddDriver}
        onDriverAdded={fetchDrivers}
      />

      {/* Driver Documents Dialog */}
      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Driver Documents - {selectedDriver?.name}
            </DialogTitle>
            <DialogDescription>
              View all uploaded documents for this driver
            </DialogDescription>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-4">
              {/* Driver Info */}
              <Card className="p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedDriver.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedDriver.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">License Number</p>
                    <p className="font-medium">{selectedDriver.licenseNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className="bg-success text-success-foreground capitalize">
                      {selectedDriver.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Separator />

              {/* Documents Section */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Uploaded Documents</h4>
                
                {/* Driver's License */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      selectedDriver.driversLicense ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Driver's License</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDriver.driversLicense ? "Uploaded ✓" : "Not uploaded"}
                      </p>
                    </div>
                  </div>
                  {selectedDriver.driversLicense ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDocument(selectedDriver.driversLicense!)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  ) : (
                    <Badge variant="secondary">Missing</Badge>
                  )}
                </div>

                {/* Vehicle Registration */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      selectedDriver.vehicleRegistration ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Vehicle Registration</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDriver.vehicleRegistration ? "Uploaded ✓" : "Not uploaded"}
                      </p>
                    </div>
                  </div>
                  {selectedDriver.vehicleRegistration ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDocument(selectedDriver.vehicleRegistration!)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  ) : (
                    <Badge variant="secondary">Missing</Badge>
                  )}
                </div>

                {/* Insurance Certificate */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      selectedDriver.insuranceCertificate ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Insurance Certificate</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDriver.insuranceCertificate ? "Uploaded ✓" : "Not uploaded"}
                      </p>
                    </div>
                  </div>
                  {selectedDriver.insuranceCertificate ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDocument(selectedDriver.insuranceCertificate!)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  ) : (
                    <Badge variant="secondary">Missing</Badge>
                  )}
                </div>

                {!selectedDriver.driversLicense && !selectedDriver.vehicleRegistration && !selectedDriver.insuranceCertificate && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDrivers;
