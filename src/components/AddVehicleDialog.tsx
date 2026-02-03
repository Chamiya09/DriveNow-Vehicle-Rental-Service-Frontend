import { useState } from "react";
import { useForm } from "react-hook-form";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface VehicleFormData {
  name: string;
  category: string;
  pricePerDay: number;
  pricePerKm: number;
  seats: number;
  transmission: string;
  fuelType: string;
  features: string;
  year: number;
  color: string;
  description: string;
  image: string;
}

const AddVehicleDialog = ({ open, onOpenChange, onSuccess }: AddVehicleDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { token } = useAuth();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<VehicleFormData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview("");
    setValue("image", "");
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      setLoading(true);

      // Convert features string to array
      const featuresArray = data.features.split(',').map(f => f.trim()).filter(f => f);

      const vehicleData = {
        name: data.name,
        category: data.category,
        pricePerDay: Number(data.pricePerDay),
        pricePerKm: Number(data.pricePerKm) || 2.00,
        seats: Number(data.seats),
        transmission: data.transmission,
        fuelType: data.fuelType,
        features: featuresArray,
        year: Number(data.year),
        color: data.color,
        description: data.description,
        image: imagePreview || data.image || "",
        available: true,
        rating: 0,
        reviewCount: 0,
      };

      console.log("Sending vehicle data:", vehicleData);

      const response = await fetch("http://localhost:8090/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleData),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Vehicle created:", result);
        toast.success("Vehicle added successfully!");
        reset();
        setImagePreview("");
        onOpenChange(false);
        onSuccess();
      } else {
        let errorMessage = "Failed to add vehicle";
        try {
          const error = await response.json();
          console.error("Error response:", error);
          
          // Handle validation errors
          if (error.validationErrors) {
            const errors = Object.entries(error.validationErrors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(", ");
            errorMessage = errors;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.error) {
            errorMessage = error.error;
          }
        } catch (e) {
          console.error("Could not parse error response:", e);
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("An error occurred while adding vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new vehicle to your fleet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name *</Label>
              <Input
                id="name"
                placeholder="e.g., BMW X5"
                {...register("name", { required: "Vehicle name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                onValueChange={(value) => {
                  setValue("category", value);
                  register("category", { required: "Category is required" });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="SEDAN">Sedan</SelectItem>
                  <SelectItem value="HATCHBACK">Hatchback</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                  <SelectItem value="LUXURY">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Per Day */}
            <div className="space-y-2">
              <Label htmlFor="pricePerDay">Price Per Day ($) *</Label>
              <Input
                id="pricePerDay"
                type="number"
                step="0.01"
                placeholder="100.00"
                {...register("pricePerDay", { 
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" }
                })}
              />
              {errors.pricePerDay && (
                <p className="text-sm text-destructive">{errors.pricePerDay.message}</p>
              )}
            </div>

            {/* Price Per Km */}
            <div className="space-y-2">
              <Label htmlFor="pricePerKm">Price Per KM ($) *</Label>
              <Input
                id="pricePerKm"
                type="number"
                step="0.01"
                placeholder="2.00"
                defaultValue="2.00"
                {...register("pricePerKm", { 
                  required: "Price per km is required",
                  min: { value: 0, message: "Price must be positive" }
                })}
              />
              {errors.pricePerKm && (
                <p className="text-sm text-destructive">{errors.pricePerKm.message}</p>
              )}
            </div>

            {/* Seats */}
            <div className="space-y-2">
              <Label htmlFor="seats">Number of Seats *</Label>
              <Input
                id="seats"
                type="number"
                placeholder="5"
                {...register("seats", { 
                  required: "Seats required",
                  min: { value: 1, message: "At least 1 seat" }
                })}
              />
              {errors.seats && (
                <p className="text-sm text-destructive">{errors.seats.message}</p>
              )}
            </div>

            {/* Transmission */}
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission *</Label>
              <Select 
                onValueChange={(value) => {
                  setValue("transmission", value);
                  register("transmission", { required: "Transmission is required" });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type *</Label>
              <Select 
                onValueChange={(value) => {
                  setValue("fuelType", value);
                  register("fuelType", { required: "Fuel type is required" });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PETROL">Petrol</SelectItem>
                  <SelectItem value="DIESEL">Diesel</SelectItem>
                  <SelectItem value="ELECTRIC">Electric</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                placeholder="2024"
                {...register("year", { 
                  required: "Year is required",
                  min: { value: 1900, message: "Invalid year" },
                  max: { value: new Date().getFullYear() + 1, message: "Invalid year" }
                })}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                placeholder="e.g., Black, White, Silver"
                {...register("color", { required: "Color is required" })}
              />
              {errors.color && (
                <p className="text-sm text-destructive">{errors.color.message}</p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="features">Features (comma-separated) *</Label>
            <Input
              id="features"
              placeholder="GPS, Bluetooth, AC, Leather Seats"
              {...register("features", { required: "At least one feature is required" })}
            />
            {errors.features && (
              <p className="text-sm text-destructive">{errors.features.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Separate features with commas
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Vehicle Image</Label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={clearImage}
                    title="Clear image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {imagePreview && (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Upload an image from your computer (max 5MB)</p>
                <p>• Or enter a URL below</p>
              </div>

              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register("image")}
                value={imagePreview || undefined}
                className={imagePreview ? "opacity-50" : ""}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the vehicle..."
              rows={3}
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;
