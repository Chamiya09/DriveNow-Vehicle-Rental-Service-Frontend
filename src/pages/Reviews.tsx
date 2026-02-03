import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageSquare, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved reviews from backend API
  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching approved reviews from API...');
      
      const response = await fetch(`http://localhost:8090/api/reviews/approved`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched approved reviews:', data);
        
        // Map backend DTO to frontend format
        const mappedReviews = data.map((review: any) => ({
          id: review.id,
          name: review.userName || 'Anonymous',
          role: 'Customer',
          rating: review.rating,
          comment: review.comment,
          date: review.createdAt,
          status: 'approved' as const,
          vehicleId: review.vehicleId,
          vehicleName: review.vehicleName || 'Unknown Vehicle',
          userId: review.userId || null,
          userEmail: review.userEmail || null,
          image: review.userProfileImage || '',
          vehicleRented: review.vehicleName || 'Unknown Vehicle'
        }));
        
        setReviews(mappedReviews);
      } else {
        console.error('Failed to fetch reviews:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';
  const totalReviews = reviews.length;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fourStarCount = reviews.filter(r => r.rating === 4).length;
  const satisfactionRate = totalReviews > 0 
    ? Math.round(((fiveStarCount + fourStarCount) / totalReviews) * 100) 
    : 0;
  
  // Calculate counts for tabs
  const recentReviews = reviews.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const topRatedReviews = reviews.filter(r => r.rating >= 4);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-4 glass">Customer Reviews</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              What Our <span className="bg-gradient-hero bg-clip-text text-transparent">Customers Say</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real experiences from real customers. See why thousands trust DriveNow for their luxury car rental needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="glass-card p-6 hover-lift">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-hero mb-3">
                  <Star className="h-6 w-6 text-primary-foreground fill-primary-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1 bg-gradient-hero bg-clip-text text-transparent">
                  {averageRating}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <Card className="glass-card p-6 hover-lift">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-hero mb-3">
                  <MessageSquare className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1 bg-gradient-hero bg-clip-text text-transparent">
                  {totalReviews}+
                </div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <Card className="glass-card p-6 hover-lift">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-hero mb-3">
                  <ThumbsUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1 bg-gradient-hero bg-clip-text text-transparent">
                  {Math.round((fiveStarCount / totalReviews) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">5-Star Reviews</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <Card className="glass-card p-6 hover-lift">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-hero mb-3">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1 bg-gradient-hero bg-clip-text text-transparent">
                  {satisfactionRate}%
                </div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="glass">
                <TabsTrigger value="all" className="gap-2">
                  All Reviews 
                  <Badge variant="secondary" className="ml-1 bg-gradient-to-br from-blue-400 to-blue-600 text-white border-0">
                    {totalReviews}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="recent" className="gap-2">
                  Most Recent
                  <Badge variant="secondary" className="ml-1 bg-gradient-to-br from-green-400 to-green-600 text-white border-0">
                    {recentReviews.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="top" className="gap-2">
                  Top Rated
                  <Badge variant="secondary" className="ml-1 bg-gradient-to-br from-yellow-400 to-amber-600 text-white border-0">
                    {topRatedReviews.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.map((review, index) => (
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
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground">Be the first to share your experience!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading reviews...</p>
                </div>
              ) : recentReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentReviews.map((review, index) => (
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
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Recent Reviews</h3>
                  <p className="text-muted-foreground">Check back soon for new reviews!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="top" className="mt-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading reviews...</p>
                </div>
              ) : topRatedReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topRatedReviews.map((review, index) => (
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
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Top Rated Reviews</h3>
                  <p className="text-muted-foreground">No 4 or 5 star reviews yet!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      </div>

      <Footer />
    </div>
  );
};

export default Reviews;
