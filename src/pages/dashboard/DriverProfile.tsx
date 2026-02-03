import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, FileText, Edit, Save, X, Upload, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DriverProfile = () => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    licenseNumber: user?.licenseNumber || "",
  });
  const [documents, setDocuments] = useState({
    driversLicense: "",
    vehicleRegistration: "",
    insuranceCertificate: "",
  });
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const handleViewDocument = (documentData: string) => {
    if (!documentData) return;
    
    if (documentData.startsWith('data:')) {
      window.open(documentData, '_blank');
    } else {
      const dataUrl = documentData.startsWith('/') 
        ? `data:application/pdf;base64,${documentData.substring(1)}` 
        : `data:application/pdf;base64,${documentData}`;
      window.open(dataUrl, '_blank');
    }
  };

  useEffect(() => {
    fetchDriverStats();
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/users/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("Fetched user data:", userData); // Debug log
        
        setFormData({
          name: userData.name || user?.name || "",
          email: userData.email || user?.email || "",
          phone: userData.phone || user?.phone || "",
          licenseNumber: userData.licenseNumber || "",
        });
        
        setDocuments({
          driversLicense: userData.driversLicense || "",
          vehicleRegistration: userData.vehicleRegistration || "",
          insuranceCertificate: userData.insuranceCertificate || "",
        });
      }
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      toast.error("Failed to load profile data");
    }
  };

  const fetchDriverStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8090/api/bookings/driver/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const driverBookings = await response.json();
        console.log("Driver bookings for profile:", driverBookings);

        const completed = driverBookings.filter((t: any) => t.status === "COMPLETED");
        const earnings = completed.reduce(
          (sum: number, t: any) => sum + t.totalPrice * 0.15,
          0
        );

        // Fetch reviews for rating
        const reviewsResponse = await fetch(`http://localhost:8090/api/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let avgRating = 0;
        if (reviewsResponse.ok) {
          const reviews = await reviewsResponse.json();
          const driverReviews = reviews.filter(
            (r: any) => driverBookings.some((t: any) => t.id === r.bookingId)
          );
          if (driverReviews.length > 0) {
            avgRating =
              driverReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
              driverReviews.length;
          }
        }

        setStats({
          totalTrips: driverBookings.length,
          completedTrips: completed.length,
          totalEarnings: earnings,
          averageRating: avgRating,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          licenseNumber: formData.licenseNumber,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleDocumentUpload = async (docType: string, file: File) => {
    try {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error("Only PDF, JPG, and PNG files are allowed");
        return;
      }
      
      setUploadingDoc(docType);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Include all current user data plus the new document
        const response = await fetch(`http://localhost:8090/api/users/${user?.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            licenseNumber: formData.licenseNumber,
            [docType]: base64String,
          }),
        });

        if (response.ok) {
          setDocuments(prev => ({ ...prev, [docType]: base64String }));
          toast.success("Document uploaded successfully!");
          // Refresh profile data to ensure consistency
          await fetchDriverProfile();
        } else {
          const errorText = await response.text();
          console.error("Upload error:", errorText);
          toast.error("Failed to upload document");
        }
        setUploadingDoc(null);
      };
      
      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploadingDoc(null);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
      setUploadingDoc(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Driver Profile</h2>
          <p className="text-muted-foreground">Manage your driver information and documents</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold">{user?.name}</h3>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-green-600 mt-1">Active Driver</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="license"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Driver Statistics</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <p className="text-2xl font-bold">{stats.totalTrips}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completedTrips}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">${(stats.totalEarnings ?? 0).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{(stats.averageRating ?? 0).toFixed(1)} ⭐</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Documents</h3>
        <p className="text-sm text-muted-foreground mb-4">Upload your driver documents (PDF, JPG, or PNG - max 5MB)</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {documents.driversLicense ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">Driver's License</p>
                <p className="text-sm text-muted-foreground">
                  {documents.driversLicense ? "Uploaded" : "Not uploaded"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {documents.driversLicense && (
                <Button variant="ghost" size="sm" onClick={() => handleViewDocument(documents.driversLicense)}>
                  View
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                disabled={uploadingDoc === 'driversLicense'}
                onClick={() => document.getElementById('driversLicense')?.click()}
              >
                {uploadingDoc === 'driversLicense' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                ) : (
                  <><Upload className="h-4 w-4 mr-1" />Upload</>
                )}
              </Button>
              <input
                id="driversLicense"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleDocumentUpload('driversLicense', e.target.files[0])}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {documents.vehicleRegistration ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">Vehicle Registration</p>
                <p className="text-sm text-muted-foreground">
                  {documents.vehicleRegistration ? "Uploaded" : "Not uploaded"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {documents.vehicleRegistration && (
                <Button variant="ghost" size="sm" onClick={() => handleViewDocument(documents.vehicleRegistration)}>
                  View
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                disabled={uploadingDoc === 'vehicleRegistration'}
                onClick={() => document.getElementById('vehicleRegistration')?.click()}
              >
                {uploadingDoc === 'vehicleRegistration' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                ) : (
                  <><Upload className="h-4 w-4 mr-1" />Upload</>
                )}
              </Button>
              <input
                id="vehicleRegistration"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleDocumentUpload('vehicleRegistration', e.target.files[0])}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {documents.insuranceCertificate ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">Insurance Certificate</p>
                <p className="text-sm text-muted-foreground">
                  {documents.insuranceCertificate ? "Uploaded" : "Not uploaded"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {documents.insuranceCertificate && (
                <Button variant="ghost" size="sm" onClick={() => handleViewDocument(documents.insuranceCertificate)}>
                  View
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                disabled={uploadingDoc === 'insuranceCertificate'}
                onClick={() => document.getElementById('insuranceCertificate')?.click()}
              >
                {uploadingDoc === 'insuranceCertificate' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                ) : (
                  <><Upload className="h-4 w-4 mr-1" />Upload</>
                )}
              </Button>
              <input
                id="insuranceCertificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleDocumentUpload('insuranceCertificate', e.target.files[0])}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DriverProfile;
