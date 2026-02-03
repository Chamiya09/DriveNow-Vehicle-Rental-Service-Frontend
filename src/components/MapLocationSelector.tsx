import { useState, useRef } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapLocationSelectorProps {
  label: string;
  value: string;
  onChange: (value: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

// Map click handler component
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const MapLocationSelector = ({ label, value, onChange, placeholder }: MapLocationSelectorProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718]); // Default: Sri Lanka
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Search for locations using Nominatim API (OpenStreetMap)
  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    console.log("🔍 Searching for:", query);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'DriveNow-Vehicle-Rental-Service'
          }
        }
      );
      const data = await response.json();
      console.log("📍 Found suggestions:", data);
      setSuggestions(data);
      if (data.length > 0) {
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue, undefined);
    
    // Clear suggestions if less than 3 characters
    if (newValue.length < 3) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (newValue.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(newValue);
      }, 500);
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const coords = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    };
    console.log("🗺️ Location selected from search:", suggestion.display_name);
    console.log("📍 Coordinates:", coords);
    
    onChange(suggestion.display_name, coords);
    setMarkerPosition([coords.lat, coords.lng]);
    setMapCenter([coords.lat, coords.lng]);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    console.log("🗺️ Map clicked at coordinates:", { lat, lng });
    setMarkerPosition([lat, lng]);
    
    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'DriveNow-Vehicle-Rental-Service'
          }
        }
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      console.log("📍 Address from coordinates:", address);
      onChange(address, { lat, lng });
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      onChange(`${lat.toFixed(4)}, ${lng.toFixed(4)}`, { lat, lng });
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              {
                headers: {
                  'User-Agent': 'DriveNow-Vehicle-Rental-Service'
                }
              }
            );
            const data = await response.json();
            const coords = { lat: latitude, lng: longitude };
            console.log("📍 Current GPS location:", data.display_name);
            console.log("📍 Coordinates:", coords);
            onChange(data.display_name, coords);
            setMarkerPosition([latitude, longitude]);
            setMapCenter([latitude, longitude]);
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            const coords = { lat: latitude, lng: longitude };
            onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, coords);
            setMarkerPosition([latitude, longitude]);
            setMapCenter([latitude, longitude]);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your current location. Please enter manually.");
          setIsLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder || "Type to search or click on map"}
              className="pl-10"
              autoComplete="off"
            />
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[9999] w-full mt-1">
              <Card className="shadow-lg border border-border bg-background max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-b-0 text-sm flex items-start gap-2"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{suggestion.display_name}</span>
                  </button>
                ))}
              </Card>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute right-3 top-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
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

      {/* Interactive OpenStreetMap - Always Visible */}
      <Card className="p-2 mt-2">
        <div className="h-[300px] rounded-lg overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            key={`${mapCenter[0]}-${mapCenter[1]}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onClick={handleMapClick} />
            {markerPosition && (
              <Marker position={markerPosition}>
                <Popup>{value || "Selected location"}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          🗺️ Type to search or click anywhere on the map • Powered by OpenStreetMap
        </p>
      </Card>
    </div>
  );
};

export default MapLocationSelector;
