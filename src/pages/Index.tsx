import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, DollarSign, Car, Users, Star, CheckCircle, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VehicleCard from "@/components/VehicleCard";
import ReviewCard from "@/components/ReviewCard";
import heroCarImage from "@/assets/hero-car.jpg";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  available: boolean;
}

interface Review {
  id: number;
  name: string;
  role?: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved';
  vehicleId: number;
  vehicleName: string;
  userId: number | null;
  userEmail: string | null;
  image?: string;
  vehicleRented?: string;
}

const Index = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchVehicles();
    loadReviews();
  }, []);

  const loadReviews = () => {
    const storedReviews = localStorage.getItem('all_reviews');
    if (storedReviews) {
      const allReviews: Review[] = JSON.parse(storedReviews);
      // Filter approved reviews, sort by rating, take top 3
      const approvedReviews = allReviews
        .filter(review => review.status === 'approved')
        .sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.id - a.id;
        })
        .slice(0, 3)
        .map(review => ({
          ...review,
          role: review.role || 'Customer',
          image: review.image || '',
          vehicleRented: review.vehicleName
        }));
      setFeaturedReviews(approvedReviews);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  const featuredVehicles = vehicles.filter(v => v.available).slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background with Enhanced Effects */}
        <div className="absolute inset-0">
          <img 
            src={heroCarImage} 
            alt="Luxury car" 
            className="w-full h-full object-cover opacity-20 animate-float"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          <div className="absolute inset-0 gradient-mesh" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge className="mb-6 glass text-primary border-primary/30 animate-pulse-slow">
                Premium Car Rental Service
              </Badge>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Drive Your Dream Car
              <span className="block bg-gradient-hero bg-clip-text text-transparent mt-2 animate-shimmer">
                Anytime, Anywhere
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Experience luxury and convenience with our premium fleet. Book instantly, drive confidently, and create unforgettable journeys.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/vehicles">
                <Button variant="hero" size="lg" className="text-lg px-8 glow-primary hover:scale-105 transition-all duration-300">
                  Browse Vehicles
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="text-lg px-8 hover-lift">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 glass border-y border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Car, label: "Vehicles", value: "200+" },
              { icon: Users, label: "Happy Clients", value: "5000+" },
              { icon: Star, label: "Rating", value: "4.9/5" },
              { icon: CheckCircle, label: "Completed Trips", value: "15K+" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-hero mb-3 glow-primary group-hover:scale-110 transition-all duration-300">
                  <stat.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1 bg-gradient-hero bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Vehicles</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our handpicked selection of premium vehicles ready for your next adventure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/vehicles">
              <Button size="lg" variant="outline">
                View All Vehicles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose DriveNow?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the difference with our premium service and commitment to excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Fully Insured",
                description: "All vehicles come with comprehensive insurance coverage for your peace of mind",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description: "Round-the-clock customer service to assist you whenever you need help",
              },
              {
                icon: DollarSign,
                title: "Best Prices",
                description: "Competitive rates with no hidden fees. What you see is what you pay",
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="glass-card p-8 hover-lift group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-hero mb-4 glow-primary group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 glass">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust DriveNow for their luxury car rental needs
            </p>
          </motion.div>

          {featuredReviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ReviewCard
                      name={review.name}
                      role={review.role || 'Customer'}
                      rating={review.rating}
                      comment={review.comment}
                      image={review.image || ''}
                      date={review.date}
                      vehicleRented={review.vehicleName}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link to="/reviews">
                  <Button size="lg" variant="outline">
                    View All Reviews
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No customer reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </section>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
