import { useEffect, useState, useRef } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Get Google Maps API Key from environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

interface GoogleMapLocationSelectorProps {
  label: string;
  value: string;
  onChange: (value: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
}

const GoogleMapLocationSelector = ({ label, value, onChange, placeholder }: GoogleMapLocationSelectorProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode", "establishment"],
        fields: ["formatted_address", "geometry", "name"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        if (place.geometry && place.geometry.location) {
          const address = place.formatted_address || place.name || "";
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          
          console.log("🗺️ Google Maps location selected:", address);
          console.log("📍 Coordinates:", coords);
          
          onChange(address, coords);
        }
      });

      autocompleteRef.current = autocomplete;
    }
  }, [isLoaded, onChange]);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          
          // Reverse geocode using Google Maps Geocoding API
          if (window.google && window.google.maps) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === "OK" && results && results[0]) {
                  console.log("📍 Current GPS location:", results[0].formatted_address);
                  console.log("📍 Coordinates:", coords);
                  onChange(results[0].formatted_address, coords);
                } else {
                  onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, coords);
                }
              }
            );
          } else {
            onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, coords);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your current location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Just update the text value, coordinates will be set when place is selected
    onChange(e.target.value, undefined);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder || "Search for a location..."}
              className="pl-10"
            />
          </div>
          {!isLoaded && (
            <div className="text-xs text-muted-foreground mt-1">Loading Google Maps...</div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={getCurrentLocation}
          title="Use current location"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default GoogleMapLocationSelector;
