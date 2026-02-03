import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AlertCircle, Upload, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

interface AddDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDriverAdded: () => void;
}

interface DriverFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  licenseNumber: string;
}

interface DocumentFiles {
  driversLicense: File | null;
  vehicleRegistration: File | null;
  insuranceCertificate: File | null;
}

const AddDriverDialog = ({ open, onOpenChange, onDriverAdded }: AddDriverDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [documents, setDocuments] = useState<DocumentFiles>({
    driversLicense: null,
    vehicleRegistration: null,
    insuranceCertificate: null,
  });
  const { token } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DriverFormData>();

  const handleFileChange = (docType: keyof DocumentFiles, file: File | null) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      // Validate file type
      if (!file.type.match(/^(image\/(jpeg|jpg|png)|application\/pdf)$/)) {
        toast.error("Only PDF, JPG, and PNG files are allowed");
        return;
      }
    }
    setDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: DriverFormData) => {
    try {
      setLoading(true);
      setServerError(""); // Clear previous errors
      setValidationError(""); // Clear validation errors

      // Convert documents to base64 if they exist
      const documentData: any = {};
      if (documents.driversLicense) {
        documentData.driversLicense = await fileToBase64(documents.driversLicense);
      }
      if (documents.vehicleRegistration) {
        documentData.vehicleRegistration = await fileToBase64(documents.vehicleRegistration);
      }
      if (documents.insuranceCertificate) {
        documentData.insuranceCertificate = await fileToBase64(documents.insuranceCertificate);
      }

      // Send complete driver data including role and license
      const driverData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone.replace(/[\s\-().]/g, ''), // Clean phone number
        role: "DRIVER",
        licenseNumber: data.licenseNumber,
        available: true,
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
        ...documentData
      };

      console.log("Sending driver registration data:", { ...driverData, driversLicense: driverData.driversLicense ? '[BASE64]' : undefined });

      const response = await fetch("http://localhost:8090/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(driverData),
      });

      if (response.ok) {
        toast.success("Driver added successfully!");
        setServerError("");
        reset();
        setDocuments({
          driversLicense: null,
          vehicleRegistration: null,
          insuranceCertificate: null,
        });
        onDriverAdded();
        onOpenChange(false);
      } else {
        let errorMessage = "Failed to add driver";
        
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

        // Handle specific error cases
        if (response.status === 409 || errorMessage.toLowerCase().includes("already exists")) {
          errorMessage = "A user with this email already exists";
        } else if (response.status === 400) {
          errorMessage = errorMessage || "Invalid driver information provided";
        } else if (response.status === 401) {
          errorMessage = "Unauthorized. Please login again";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later";
        }

        setServerError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error adding driver:", error);
      const errorMsg = error instanceof Error ? error.message : "Network error. Please check your connection and try again.";
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(
          onSubmit,
          (errors) => {
            // This runs when validation fails
            const errorFields = Object.keys(errors);
            if (errorFields.length > 0) {
              const firstError = errors[errorFields[0] as keyof DriverFormData];
              setValidationError(`Please fix the validation errors: ${errorFields.length} field(s) need attention`);
              toast.error("Please fix all validation errors before submitting");
            }
          }
        )} className="space-y-6">
          {/* Validation Error Alert */}
          {validationError && (
            <Alert variant="destructive" className="bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Server Error Alert */}
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                Full Name *
              </Label>
              <Input
                id="name"
                {...register("name", { 
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  },
                  onChange: () => setValidationError("")
                })}
                placeholder="John Doe"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  },
                  onChange: () => setValidationError("")
                })}
                placeholder="driver@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  },
                  onChange: () => setValidationError("")
                })}
                placeholder="••••••••"
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone", { 
                  required: "Phone is required",
                  minLength: {
                    value: 8,
                    message: "Phone number must be at least 8 digits"
                  },
                  validate: (value) => {
                    const cleaned = value.replace(/[\s\-().]/g, '');
                    if (!/^[\+]?[0-9]{8,15}$/.test(cleaned)) {
                      return "Please enter a valid phone number (8-15 digits)";
                    }
                    return true;
                  },
                  onChange: () => setValidationError("")
                })}
                placeholder="+1 234 567 8900 or 0712345678"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* License Information */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="licenseNumber" className={errors.licenseNumber ? "text-destructive" : ""}>
                Driver's License Number *
              </Label>
              <Input
                id="licenseNumber"
                {...register("licenseNumber", { 
                  required: "License number is required",
                  minLength: {
                    value: 5,
                    message: "License number must be at least 5 characters"
                  },
                  onChange: () => setValidationError("")
                })}
                placeholder="DL123456789"
                className={errors.licenseNumber ? "border-destructive" : ""}
              />
              {errors.licenseNumber && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.licenseNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <h3 className="text-sm font-semibold mb-2">Driver Documents (Optional)</h3>
              <p className="text-xs text-muted-foreground mb-4">Upload driver documents now or let the driver upload them later from their profile</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Driver's License */}
              <div className="space-y-2">
                <Label htmlFor="driversLicense" className="text-sm">
                  Driver's License
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="driversLicense"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('driversLicense', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {documents.driversLicense && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </div>
                {documents.driversLicense && (
                  <p className="text-xs text-muted-foreground">✓ {documents.driversLicense.name}</p>
                )}
              </div>

              {/* Vehicle Registration */}
              <div className="space-y-2">
                <Label htmlFor="vehicleRegistration" className="text-sm">
                  Vehicle Registration
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="vehicleRegistration"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('vehicleRegistration', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {documents.vehicleRegistration && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </div>
                {documents.vehicleRegistration && (
                  <p className="text-xs text-muted-foreground">✓ {documents.vehicleRegistration.name}</p>
                )}
              </div>

              {/* Insurance Certificate */}
              <div className="space-y-2">
                <Label htmlFor="insuranceCertificate" className="text-sm">
                  Insurance Certificate
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="insuranceCertificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('insuranceCertificate', e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {documents.insuranceCertificate && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </div>
                {documents.insuranceCertificate && (
                  <p className="text-xs text-muted-foreground">✓ {documents.insuranceCertificate.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? "Adding Driver..." : "Add Driver"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverDialog;
