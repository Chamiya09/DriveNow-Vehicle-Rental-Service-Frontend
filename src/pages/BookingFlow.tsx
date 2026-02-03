import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Clock, CreditCard, CheckCircle, AlertCircle, Navigation2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapLocationSelector from "@/components/MapLocationSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

interface Vehicle {
  id: number;
  name: string;
  category: string;
  pricePerDay: number;
  pricePerKm: number;
  image: string;
  rating: number;
  reviewCount: number;
  seats: number;
  transmission: string;
  fuelType: string;
  features: string[];
  available: boolean;
}

const BookingFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBookingNotification } = useNotifications();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Location coordinates and distance calculation
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [distancePrice, setDistancePrice] = useState<number>(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    pickupLocation: "",
    dropoffLocation: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });
  
  const [errors, setErrors] = useState({
    startDate: "",
    endDate: "",
    pickupLocation: "",
    dropoffLocation: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`http://localhost:8090/api/vehicles/${id}`);
        if (response.ok) {
          const data = await response.json();
          setVehicle(data);
          
          // Check if vehicle is unavailable and redirect
          if (!data.available) {
            toast.error("This vehicle is currently unavailable for booking");
            navigate(`/vehicles/${id}`);
          }
        } else {
          setVehicle(null);
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id, navigate]);
  // Calculate route distance and price when both coordinates are available
  useEffect(() => {
    const calculateDistance = async () => {
      console.log("=== ROUTE DISTANCE CALCULATION ===");
      console.log("Pickup Coords:", pickupCoords);
      console.log("Dropoff Coords:", dropoffCoords);
      console.log("Current Distance:", distance);
      console.log("Current Distance Price:", distancePrice);
      
      if (pickupCoords && dropoffCoords) {
        console.log("✅ Both coordinates available, calculating route distance...");
        setIsCalculatingDistance(true);
        
        try {
          const payload = {
            lat1: pickupCoords.lat,
            lon1: pickupCoords.lng,
            lat2: dropoffCoords.lat,
            lon2: dropoffCoords.lng,
          };
          console.log("📤 Sending to backend API:", payload);
          
          const response = await fetch("http://localhost:8090/api/distance/calculate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          console.log("📡 Response status:", response.status);
          console.log("📡 Response OK:", response.ok);
          
          if (response.ok) {
            const data = await response.json();
            console.log("📥 API Response:", data);
            console.log("🔢 Setting distance to:", data.distanceKm);
            
            if (data.distanceKm && data.distanceKm > 0) {
              setDistance(data.distanceKm);
              const pricePerKm = vehicle?.pricePerKm || 2.00;
              const calculatedRoutePrice = data.distanceKm * pricePerKm;
              console.log("💰 Price per km:", pricePerKm);
              console.log("💰 Setting distance price to:", calculatedRoutePrice);
              setDistancePrice(calculatedRoutePrice);
              console.log(`✅ Route Distance: ${data.distanceKm} km`);
              console.log(`✅ Route Price: $${calculatedRoutePrice.toFixed(2)}`);
            } else {
              console.warn("⚠️ Invalid distance returned:", data.distanceKm);
            }
          } else {
            const errorText = await response.text();
            console.error("❌ API Error:", response.status, errorText);
          }
        } catch (error) {
          console.error("❌ Error calculating route distance:", error);
          console.error("❌ Error details:", error.message);
        } finally {
          setIsCalculatingDistance(false);
        }
      } else {
        console.log("⏳ Waiting for both locations to be selected");
        console.log("   - Pickup coords available:", !!pickupCoords);
        console.log("   - Dropoff coords available:", !!dropoffCoords);
        setDistance(0);
        setDistancePrice(0);
      }
      console.log("==================================");
    };

    calculateDistance();
  }, [pickupCoords, dropoffCoords]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Vehicle Not Found</h1>
            <Link to="/vehicles">
              <Button>Back to Vehicles</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalDays = calculateDays();
  const basePrice = totalDays * vehicle.pricePerDay;
  const totalPrice = basePrice + distancePrice;

  // Log price calculation for debugging
  console.log("=== TRIP PRICE CALCULATION ===");
  console.log("Total Days:", totalDays);
  console.log("Price per Day:", vehicle.pricePerDay);
  console.log("Base Price:", basePrice.toFixed(2));
  console.log("Route Distance:", distance, "km");
  console.log("Route Price:", distancePrice.toFixed(2));
  console.log("TOTAL PRICE:", totalPrice.toFixed(2));
  console.log("==============================");

  const validateDates = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!bookingData.startDate) {
      newErrors.startDate = "Pickup date is required";
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(bookingData.startDate);
      if (startDate < today) {
        newErrors.startDate = "Pickup date cannot be in the past";
        isValid = false;
      } else {
        newErrors.startDate = "";
      }
    }

    if (!bookingData.endDate) {
      newErrors.endDate = "Return date is required";
      isValid = false;
    } else if (bookingData.startDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      if (end <= start) {
        newErrors.endDate = "Return date must be after pickup date";
        isValid = false;
      } else {
        newErrors.endDate = "";
      }
    } else {
      newErrors.endDate = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateLocations = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!bookingData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required";
      isValid = false;
    } else if (bookingData.pickupLocation.trim().length < 3) {
      newErrors.pickupLocation = "Pickup location must be at least 3 characters";
      isValid = false;
    } else {
      newErrors.pickupLocation = "";
    }

    if (!bookingData.dropoffLocation.trim()) {
      newErrors.dropoffLocation = "Drop-off location is required";
      isValid = false;
    } else if (bookingData.dropoffLocation.trim().length < 3) {
      newErrors.dropoffLocation = "Drop-off location must be at least 3 characters";
      isValid = false;
    } else {
      newErrors.dropoffLocation = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const validatePayment = () => {
    const newErrors = { ...errors };
    let isValid = true;

    // Card number validation (16 digits)
    if (!bookingData.cardNumber) {
      newErrors.cardNumber = "Card number is required";
      isValid = false;
    } else {
      const cardNum = bookingData.cardNumber.replace(/\s/g, "");
      if (!/^\d{16}$/.test(cardNum)) {
        newErrors.cardNumber = "Card number must be 16 digits";
        isValid = false;
      } else {
        newErrors.cardNumber = "";
      }
    }

    // Expiry validation (MM/YY format)
    if (!bookingData.expiry) {
      newErrors.expiry = "Expiry date is required";
      isValid = false;
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(bookingData.expiry)) {
      newErrors.expiry = "Invalid format (MM/YY)";
      isValid = false;
    } else {
      const [month, year] = bookingData.expiry.split("/");
      const now = new Date();
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < now) {
        newErrors.expiry = "Card has expired";
        isValid = false;
      } else {
        newErrors.expiry = "";
      }
    }

    // CVV validation (3 digits)
    if (!bookingData.cvv) {
      newErrors.cvv = "CVV is required";
      isValid = false;
    } else if (!/^\d{3}$/.test(bookingData.cvv)) {
      newErrors.cvv = "CVV must be 3 digits";
      isValid = false;
    } else {
      newErrors.cvv = "";
    }

    // Card name validation
    if (!bookingData.cardName.trim()) {
      newErrors.cardName = "Name on card is required";
      isValid = false;
    } else if (bookingData.cardName.trim().length < 3) {
      newErrors.cardName = "Name must be at least 3 characters";
      isValid = false;
    } else {
      newErrors.cardName = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePickupLocationChange = (value: string, coords?: { lat: number; lng: number }) => {
    console.log("🔵 Pickup location changed:", value);
    console.log("🔵 Pickup coords received:", coords);
    setBookingData({ ...bookingData, pickupLocation: value });
    
    if (coords !== undefined) {
      console.log("✅ Setting pickup coords:", coords);
      setPickupCoords(coords);
    }
    
    if (errors.pickupLocation) {
      setErrors({ ...errors, pickupLocation: "" });
    }
  };

  const handleDropoffLocationChange = (value: string, coords?: { lat: number; lng: number }) => {
    console.log("🔴 Dropoff location changed:", value);
    console.log("🔴 Dropoff coords received:", coords);
    setBookingData({ ...bookingData, dropoffLocation: value });
    
    if (coords !== undefined) {
      console.log("✅ Setting dropoff coords:", coords);
      setDropoffCoords(coords);
    }
    
    if (errors.dropoffLocation) {
      setErrors({ ...errors, dropoffLocation: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!validateDates()) {
        toast.error("Please fix the errors in the form");
        return;
      }
      if (totalDays === 0) {
        toast.error("Please select valid rental dates");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!validateLocations()) {
        toast.error("Please fix the errors in the form");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!validatePayment()) {
        toast.error("Please fix the errors in the form");
        return;
      }
      if (!user) {
        toast.error("Please log in to complete booking");
        navigate("/auth");
        return;
      }

      setIsProcessing(true);
      try {
        const token = localStorage.getItem("token");
        const bookingPayload = {
          userId: user.id,
          vehicleId: Number(id),
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          totalPrice: totalPrice,
          pickupLocation: bookingData.pickupLocation,
          pickupLatitude: pickupCoords?.lat || null,
          pickupLongitude: pickupCoords?.lng || null,
          dropoffLocation: bookingData.dropoffLocation,
          dropoffLatitude: dropoffCoords?.lat || null,
          dropoffLongitude: dropoffCoords?.lng || null,
          distanceKm: distance,
          basePricePerDay: vehicle.pricePerDay,
          distancePrice: distancePrice,
          specialRequests: "",
          paymentMethod: bookingData.cardNumber ? "CARD" : "CASH",
        };
        
        console.log("Booking payload:", bookingPayload);
        
        const response = await fetch("http://localhost:8090/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingPayload),
        });

        if (response.ok) {
          const bookingResponse = await response.json();
          console.log("Booking created successfully:", bookingResponse);
          
          // Create notification for user (booking pending/confirmed)
          await createBookingNotification(
            bookingResponse.id,
            user.id,
            "USER",
            bookingResponse.status || "PENDING"
          );
          
          // Fetch all admins and send notification to each
          try {
            const token = localStorage.getItem("token");
            const adminResponse = await fetch("http://localhost:8090/api/users/admins", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (adminResponse.ok) {
              const admins = await adminResponse.json();
              // Send notification to all admins
              for (const admin of admins) {
                await createBookingNotification(
                  bookingResponse.id,
                  admin.id,
                  "ADMIN",
                  bookingResponse.status || "PENDING"
                );
              }
            }
          } catch (adminError) {
            console.error("Error notifying admins:", adminError);
          }
          
          toast.success("Booking confirmed! Redirecting to dashboard...");
          setTimeout(() => {
            navigate("/dashboard/user");
          }, 1500);
        } else if (response.status === 403) {
          // 403 Forbidden - likely invalid/expired token or user doesn't exist
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setTimeout(() => {
            navigate("/auth");
          }, 1500);
        } else {
          let errorMessage = "Failed to create booking";
          try {
            const errorData = await response.json();
            console.error("Backend error response:", errorData);
            console.error("Full error object:", JSON.stringify(errorData, null, 2));
            
            // Check for validation errors (field-specific errors)
            if (errorData.fieldErrors) {
              const fieldErrors = Object.entries(errorData.fieldErrors)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join(", ");
              errorMessage = fieldErrors;
            } else if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.join(", ");
            } else if (errorData.details && Array.isArray(errorData.details)) {
              errorMessage = errorData.details.map((d: any) => d.message || d).join(", ");
            } else {
              errorMessage = errorData.message || errorData.error || errorMessage;
            }
          } catch (e) {
            console.error("Error parsing error response:", e);
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          
          toast.error(errorMessage);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Booking error:", error);
        toast.error("Network error. Please check your connection and try again.");
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link to={`/vehicles/${vehicle.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vehicle
              </Button>
            </Link>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-20 h-1 ${
                        step > s ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-md mx-auto mt-3 text-sm">
              <span className={step >= 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
                Dates
              </span>
              <span className={step >= 2 ? "text-foreground font-medium" : "text-muted-foreground"}>
                Location
              </span>
              <span className={step >= 3 ? "text-foreground font-medium" : "text-muted-foreground"}>
                Payment
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {step === 1 && "Select Dates"}
                  {step === 2 && "Pickup & Drop-off"}
                  {step === 3 && "Payment Details"}
                </h2>
                
                {/* Error Summary Alert */}
                {((step === 1 && (errors.startDate || errors.endDate)) ||
                  (step === 2 && (errors.pickupLocation || errors.dropoffLocation)) ||
                  (step === 3 && (errors.cardNumber || errors.expiry || errors.cvv || errors.cardName))) && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-destructive mb-1">Please fix the following errors:</h3>
                        <ul className="text-sm text-destructive/90 space-y-1">
                          {step === 1 && errors.startDate && <li>• {errors.startDate}</li>}
                          {step === 1 && errors.endDate && <li>• {errors.endDate}</li>}
                          {step === 2 && errors.pickupLocation && <li>• {errors.pickupLocation}</li>}
                          {step === 2 && errors.dropoffLocation && <li>• {errors.dropoffLocation}</li>}
                          {step === 3 && errors.cardNumber && <li>• Card number: {errors.cardNumber}</li>}
                          {step === 3 && errors.expiry && <li>• Expiry date: {errors.expiry}</li>}
                          {step === 3 && errors.cvv && <li>• CVV: {errors.cvv}</li>}
                          {step === 3 && errors.cardName && <li>• Name on card: {errors.cardName}</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Persistent Destination Price Banner - Removed */}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className={errors.startDate ? "text-destructive" : ""}>
                          Pickup Date {errors.startDate && "*"}
                        </Label>
                        <div className="relative">
                          <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.startDate ? "text-destructive" : "text-muted-foreground"}`} />
                          <Input
                            id="startDate"
                            type="date"
                            value={bookingData.startDate}
                            onChange={(e) => {
                              setBookingData({ ...bookingData, startDate: e.target.value });
                              if (errors.startDate) setErrors({ ...errors, startDate: "" });
                            }}
                            className={`pl-10 ${errors.startDate ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            min={new Date().toISOString().split("T")[0]}
                          />
                          {errors.startDate && (
                            <div className="flex items-center gap-1 mt-1 text-destructive text-sm">
                              <AlertCircle className="h-3 w-3" />
                              <span>{errors.startDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate" className={errors.endDate ? "text-destructive" : ""}>
                          Return Date {errors.endDate && "*"}
                        </Label>
                        <div className="relative">
                          <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.endDate ? "text-destructive" : "text-muted-foreground"}`} />
                          <Input
                            id="endDate"
                            type="date"
                            value={bookingData.endDate}
                            onChange={(e) => {
                              setBookingData({ ...bookingData, endDate: e.target.value });
                              if (errors.endDate) setErrors({ ...errors, endDate: "" });
                            }}
                            className={`pl-10 ${errors.endDate ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            min={bookingData.startDate || new Date().toISOString().split("T")[0]}
                          />
                          {errors.endDate && (
                            <div className="flex items-center gap-1 mt-1 text-destructive text-sm">
                              <AlertCircle className="h-3 w-3" />
                              <span>{errors.endDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <MapLocationSelector
                        label="Pickup Location"
                        value={bookingData.pickupLocation}
                        onChange={handlePickupLocationChange}
                        placeholder="Search for pickup location..."
                      />
                      {pickupCoords && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                            <span>GPS coordinates captured: {pickupCoords.lat.toFixed(4)}, {pickupCoords.lng.toFixed(4)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            <AlertCircle className="h-3 w-3" />
                            <span>Please verify this is your correct pickup location</span>
                          </div>
                        </div>
                      )}
                      {errors.pickupLocation && (
                        <div className="flex items-center gap-1 mt-1 text-destructive text-sm">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.pickupLocation}</span>
                        </div>
                      )}

                      <MapLocationSelector
                        label="Drop-off Location"
                        value={bookingData.dropoffLocation}
                        onChange={handleDropoffLocationChange}
                        placeholder="Search for drop-off location..."
                      />
                      {dropoffCoords && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                            <span>GPS coordinates captured: {dropoffCoords.lat.toFixed(4)}, {dropoffCoords.lng.toFixed(4)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            <AlertCircle className="h-3 w-3" />
                            <span>Please verify this is your correct drop-off location</span>
                          </div>
                        </div>
                      )}
                      {errors.dropoffLocation && (
                        <div className="flex items-center gap-1 mt-1 text-destructive text-sm">
                          <AlertCircle className="h-3 w-3" />
                          <span>{errors.dropoffLocation}</span>
                        </div>
                      )}

                      {/* Distance Calculation Status - Removed */}

                      {/* Distance Result - Removed */}
                    </>
                  )}

                  {step === 3 && (
                    <>
                      {/* Destination Price Summary - Removed */}

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className={errors.cardNumber ? "text-destructive" : ""}>
                          Card Number {errors.cardNumber && "*"}
                        </Label>
                        <div className="relative">
                          <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.cardNumber ? "text-destructive" : "text-muted-foreground"}`} />
                          <Input
                            id="cardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={bookingData.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                              const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                              setBookingData({ ...bookingData, cardNumber: formatted });
                              if (errors.cardNumber) setErrors({ ...errors, cardNumber: "" });
                            }}
                            className={`pl-10 ${errors.cardNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            maxLength={19}
                          />
                          {errors.cardNumber && (
                            <div className="flex items-center gap-1 mt-1 text-destructive text-sm">
                              <AlertCircle className="h-3 w-3" />
                              <span>{errors.cardNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry" className={errors.expiry ? "text-destructive" : ""}>
                            Expiry Date {errors.expiry && "*"}
                          </Label>
                          <Input
                            id="expiry"
                            type="text"
                            placeholder="MM/YY"
                            value={bookingData.expiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + "/" + value.slice(2, 4);
                              }
                              setBookingData({ ...bookingData, expiry: value });
                              if (errors.expiry) setErrors({ ...errors, expiry: "" });
                            }}
                            className={errors.expiry ? "border-destructive focus-visible:ring-destructive" : ""}
                            maxLength={5}
                          />
                          {errors.expiry && (
                            <div className="flex items-center gap-1 mt-1 text-destructive text-sm">
                              <AlertCircle className="h-3 w-3" />
                              <span>{errors.expiry}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv" className={errors.cvv ? "text-destructive" : ""}>
                            CVV {errors.cvv && "*"}
                          </Label>
                          <Input
                            id="cvv"
                            type="text"
                            placeholder="123"
                            value={bookingData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              setBookingData({ ...bookingData, cvv: value });
                              if (errors.cvv) setErrors({ ...errors, cvv: "" });
                            }}
                            className={errors.cvv ? "border-destructive focus-visible:ring-destructive" : ""}
                            maxLength={3}
                          />
                          {errors.cvv && (
                            <div className="flex items-center gap-1 mt-1 text-destructive text-sm">
                              <AlertCircle className="h-3 w-3" />
                              <span>{errors.cvv}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName" className={errors.cardName ? "text-destructive" : ""}>
                          Name on Card {errors.cardName && "*"}
                        </Label>
                        <Input
                          id="cardName"
                          type="text"
                          placeholder="John Doe"
                          value={bookingData.cardName}
                          onChange={(e) => {
                            setBookingData({ ...bookingData, cardName: e.target.value });
                            if (errors.cardName) setErrors({ ...errors, cardName: "" });
                          }}
                          className={errors.cardName ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.cardName && (
                          <div className="flex items-center gap-1 mt-1 text-destructive text-sm">
                            <AlertCircle className="h-3 w-3" />
                            <span>{errors.cardName}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex gap-4 pt-4">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                    )}
                  <Button
                    type="submit"
                    variant="hero"
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Processing...
                      </div>
                    ) : step === 3 ? (
                      "Confirm Booking"
                    ) : (
                      "Continue"
                    )}
                  </Button>
                  </div>
                </form>
              </Card>
            </motion.div>

            {/* Booking Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="p-6 sticky top-24">
                <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>

                <div className="mb-4">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-semibold">{vehicle.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">{vehicle.category}</p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  {bookingData.startDate && bookingData.endDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{totalDays} days</span>
                    </div>
                  )}
                  
                  {!bookingData.startDate && !bookingData.endDate && step >= 1 && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Select dates to see pricing</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price per day</span>
                    <span className="font-medium">${vehicle.pricePerDay}</span>
                  </div>

                  {totalDays > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Base rental ({totalDays} {totalDays === 1 ? 'day' : 'days'})</span>
                      <span className="font-medium">${basePrice.toFixed(2)}</span>
                    </div>
                  )}

                  {totalDays > 0 && (
                    <>
                      <Separator />
                      
                      {/* Base Rental Price */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Base Rental ({totalDays} {totalDays === 1 ? 'day' : 'days'})</span>
                          <span className="font-medium">${basePrice.toFixed(2)}</span>
                        </div>
                        
                        {/* Route Price Section - Always Show */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Navigation2 className="h-4 w-4 text-amber-600" />
                            <span className="font-semibold text-sm text-amber-900">Route Price</span>
                            {isCalculatingDistance && (
                              <div className="ml-auto">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
                              </div>
                            )}
                          </div>
                          {distance > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-amber-700">{distance.toFixed(2)} km × ${vehicle?.pricePerKm || 2.00}/km</span>
                                <span className="font-bold text-xl text-amber-600">${distancePrice.toFixed(2)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-amber-700">
                              <AlertCircle className="h-3 w-3" />
                              <span>Select locations to calculate route price</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total Price</span>
                        <span className="text-primary">${totalPrice.toFixed(2)}</span>
                      </div>

                      {/* Important Location Warning */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-3">
                          <Navigation2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-amber-900 mb-1">📍 Important: Verify Your Locations</h4>
                            <p className="text-sm text-amber-800">
                              Please ensure both pickup and drop-off locations are correct. Use the map to select the exact address. 
                              Incorrect locations may affect pricing and service delivery.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {totalDays === 0 && bookingData.startDate && bookingData.endDate && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-xs text-destructive">Invalid date range</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Free cancellation up to 24 hours before pickup.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingFlow;
