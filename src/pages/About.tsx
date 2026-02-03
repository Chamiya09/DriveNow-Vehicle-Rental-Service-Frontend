import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Users, Shield, Award, TrendingUp, Heart, Target, Zap, ArrowRight, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

const About = () => {
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);

  // Load approved reviews from localStorage
  useEffect(() => {
    const storedReviews = localStorage.getItem('all_reviews');
    if (storedReviews) {
      const allReviews: Review[] = JSON.parse(storedReviews);
      // Filter approved reviews, sort by rating and date, take top 6
      const approvedReviews = allReviews
        .filter(review => review.status === 'approved')
        .sort((a, b) => {
          // Sort by rating (highest first), then by id (newest first)
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.id - a.id;
        })
        .slice(0, 6)
        .map(review => ({
          ...review,
          role: review.role || 'Customer',
          image: review.image || '',
          vehicleRented: review.vehicleName
        }));
      setFeaturedReviews(approvedReviews);
    }
  }, []);

  const stats = [
    { label: "Happy Customers", value: "10,000+", icon: Users },
    { label: "Vehicles Available", value: "500+", icon: Car },
    { label: "Years of Experience", value: "15+", icon: Award },
    { label: "Countries", value: "5", icon: TrendingUp },
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "All our vehicles undergo rigorous safety inspections and maintenance to ensure your peace of mind on every journey.",
    },
    {
      icon: Heart,
      title: "Customer Care",
      description: "We're committed to providing exceptional service and support, available 24/7 to make your rental experience seamless.",
    },
    {
      icon: Target,
      title: "Transparency",
      description: "No hidden fees or surprises. We believe in honest pricing and clear communication at every step of your rental.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously evolve our services with the latest technology to provide you with the best rental experience.",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/placeholder.svg",
      description: "Leading DriveNow with 20+ years in automotive industry",
    },
    {
      name: "Michael Chen",
      role: "Operations Director",
      image: "/placeholder.svg",
      description: "Ensuring seamless operations across all locations",
    },
    {
      name: "Emma Davis",
      role: "Customer Success Manager",
      image: "/placeholder.svg",
      description: "Dedicated to delivering exceptional customer experiences",
    },
    {
      name: "James Wilson",
      role: "Fleet Manager",
      image: "/placeholder.svg",
      description: "Maintaining our premium fleet to highest standards",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow">
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-gradient-hero">About Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Trusted Partner in Vehicle Rentals
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Since 2010, DriveNow has been revolutionizing the vehicle rental experience with our commitment to quality, safety, and customer satisfaction.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At DriveNow, our mission is to provide accessible, reliable, and high-quality vehicle rental services that empower our customers to explore, travel, and conduct business with confidence and convenience.
              </p>
              <p className="text-lg text-muted-foreground">
                We strive to make every journey memorable by offering a diverse fleet of well-maintained vehicles, transparent pricing, and exceptional customer service that exceeds expectations.
              </p>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden">
              <img
                src="/placeholder.svg"
                alt="Our Mission"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and shape the experience we deliver to our customers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dedicated professionals committed to making your rental experience exceptional
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 glass">Customer Testimonials</Badge>
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real experiences from real customers who trust DriveNow for their vehicle rental needs
            </p>
          </motion.div>

          {featuredReviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          ) : (
            <div className="text-center py-12 mb-8">
              <p className="text-muted-foreground">
                No customer reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}

          <div className="text-center">
            <Link to="/reviews">
              <Button size="lg" variant="outline" className="hover-lift">
                View All Reviews
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Redesigned */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-hero">Our Advantage</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="bg-gradient-hero bg-clip-text text-transparent">DriveNow</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the difference with our commitment to excellence, innovation, and customer satisfaction
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Premium Fleet */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="group relative h-full overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-hero opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
                <div className="p-8 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 group-hover:text-primary transition-colors">Premium Fleet</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Choose from our extensive collection of meticulously maintained, modern vehicles ranging from luxury sedans to high-performance sports cars
                  </p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                    <span>Explore Vehicles</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Competitive Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="group relative h-full overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-hero opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
                <div className="p-8 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 group-hover:text-primary transition-colors">Transparent Pricing</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    No hidden fees or surprises. Enjoy competitive rates with crystal-clear pricing, ensuring the best value for your money every time
                  </p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                    <span>View Pricing</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Full Insurance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="group relative h-full overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-hero opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
                <div className="p-8 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 group-hover:text-primary transition-colors">Full Coverage</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Drive with complete peace of mind. Comprehensive insurance coverage protects you throughout your entire rental period
                  </p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                    <span>Learn More</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 24/7 Support */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="group relative h-full overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-hero opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
                <div className="p-8 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 group-hover:text-primary transition-colors">24/7 Support</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Round-the-clock customer service ready to assist you anytime, anywhere. Your satisfaction is our priority
                  </p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                    <span>Contact Us</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Easy Booking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Card className="group relative h-full overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-hero opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
                <div className="p-8 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 group-hover:text-primary transition-colors">Instant Booking</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Book your dream vehicle in minutes with our streamlined digital platform. Fast, simple, and hassle-free
                  </p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                    <span>Book Now</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Flexible Terms */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <Card className="group relative h-full overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-hero opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" />
                <div className="p-8 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-3 group-hover:text-primary transition-colors">Flexible Terms</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Customize your rental duration and terms to fit your schedule. From hourly to monthly, we adapt to your needs
                  </p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                    <span>Explore Options</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="mt-16 text-center"
          >
            <Link to="/vehicles">
              <Button size="lg" className="group bg-gradient-hero hover:shadow-xl transition-all">
                Start Your Journey Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
