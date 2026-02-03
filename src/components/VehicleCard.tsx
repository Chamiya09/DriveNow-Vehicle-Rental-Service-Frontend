import { Link } from "react-router-dom";
import { Star, Users, Gauge, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import RatingBadge from "@/components/RatingBadge";

interface VehicleCardProps {
  vehicle: {
    id: string | number;
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
    available: boolean;
  };
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group glass-card hover-lift overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-mesh opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {!vehicle.available && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
              Not Available
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3 z-20">
          <Badge className="bg-gradient-hero text-primary-foreground capitalize glow-primary animate-pulse-slow">
            {vehicle.category.toLowerCase()}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
              {vehicle.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <RatingBadge 
                rating={vehicle.rating} 
                variant="premium" 
                size="sm" 
                showSparkles
              />
              <span className="text-muted-foreground">({vehicle.reviewCount})</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ${vehicle.pricePerDay}
            </div>
            <div className="text-xs text-muted-foreground">per day</div>
            <div className="text-sm font-semibold text-amber-600 mt-1">
              ${vehicle.pricePerKm || 2.00}/km
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b">
          <div className="flex flex-col items-center text-center">
            <Users className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">{vehicle.seats} Seats</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Gauge className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">{vehicle.transmission}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Fuel className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">{vehicle.fuelType}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full group/btn relative overflow-hidden" 
              size="sm"
            >
              <span className="relative z-10">View Details</span>
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
            </Button>
          </Link>
          <Link to={`/booking/${vehicle.id}`} className="flex-1">
            <Button
              variant="hero"
              className="w-full glow-primary hover:scale-105 transition-all duration-300"
              size="sm"
              disabled={!vehicle.available}
            >
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
