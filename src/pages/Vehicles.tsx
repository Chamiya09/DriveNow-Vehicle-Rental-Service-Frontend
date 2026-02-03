import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VehicleCard from "@/components/VehicleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const vehicleCategories = [
  { id: "all", name: "All Categories", icon: "" },
  { id: "SUV", name: "SUV", icon: "" },
  { id: "SEDAN", name: "Sedan", icon: "" },
  { id: "HATCHBACK", name: "Hatchback", icon: "" },
  { id: "VAN", name: "Van", icon: "" },
  { id: "LUXURY", name: "Luxury", icon: "" },
];

interface Vehicle {
  id: number;
  name: string;
  category: string;
  pricePerDay: number;
  image: string;
  rating: number;
  reviewCount: number;
  seats: number;
  transmission: string;
  fuelType: string;
  features: string[];
  available: boolean;
}

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8090/api/vehicles");
      
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        toast.error("Failed to load vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("An error occurred while loading vehicles");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  let filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || vehicle.category === selectedCategory;
    let matchesPrice = true;

    if (priceRange === "0-50") matchesPrice = vehicle.pricePerDay <= 50;
    else if (priceRange === "51-100") matchesPrice = vehicle.pricePerDay > 50 && vehicle.pricePerDay <= 100;
    else if (priceRange === "101-150") matchesPrice = vehicle.pricePerDay > 100 && vehicle.pricePerDay <= 150;
    else if (priceRange === "151+") matchesPrice = vehicle.pricePerDay > 150;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort logic
  if (sortBy === "price-low") {
    filteredVehicles.sort((a, b) => a.pricePerDay - b.pricePerDay);
  } else if (sortBy === "price-high") {
    filteredVehicles.sort((a, b) => b.pricePerDay - a.pricePerDay);
  } else if (sortBy === "rating") {
    filteredVehicles.sort((a, b) => b.rating - a.rating);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Our Fleet</h1>
            <p className="text-lg text-muted-foreground">
              Discover the perfect vehicle for your journey from our diverse collection
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {vehicleCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-50">$0 - $50</SelectItem>
                  <SelectItem value="51-100">$51 - $100</SelectItem>
                  <SelectItem value="101-150">$101 - $150</SelectItem>
                  <SelectItem value="151+">$151+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setPriceRange("all");
                  setSortBy("featured");
                }}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Badge variant="secondary" className="text-sm">
              {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""} found
            </Badge>
          </motion.div>

          {/* Vehicle Grid */}
          {filteredVehicles.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="bg-muted rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setPriceRange("all");
                  setSortBy("featured");
                }}
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Vehicles;
