import { useState, useEffect } from "react";
import { Star, Award, MessageSquare, TrendingUp, User, Calendar, ThumbsUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import RatingBadge from "@/components/RatingBadge";
import StarRating from "@/components/StarRating";

interface DriverReview {
  id: number;
  rating: number;
  comment: string;
  driverName: string;
  userName: string;
  bookingNumber: string;
  createdAt: string;
}

const DriverReviews = () => {
  const [reviews, setReviews] = useState<DriverReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/driver-reviews', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching driver reviews:", error);
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
  const topRatedReviews = reviews.filter(r => r.rating >= 4);
  const recentReviews = reviews.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse();
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Award className="h-3 w-3 mr-1" />
              Driver Excellence
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Professional Drivers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real feedback from real customers about their driving experience
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-grow">
      <section className="py-12 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Star className="h-8 w-8 text-yellow-400 fill-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{averageRating}</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
              <div className="flex justify-center mt-2">
                <StarRating rating={Math.round(parseFloat(averageRating))} size="md" animated />
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{totalReviews}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">
                {totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">5-Star Reviews</div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{satisfactionRate}%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Rating Distribution */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Rating Distribution</h2>
            <p className="text-muted-foreground">
              How customers rate their driving experience
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating, index) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${totalReviews > 0 ? (ratingDistribution[index] / totalReviews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-20 text-right">
                    {ratingDistribution[index]}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Customer Reviews</h2>
            <p className="text-muted-foreground">
              What our customers say about their drivers
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-yellow-400 border-t-transparent mb-3"></div>
              <p className="text-muted-foreground">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="all" className="gap-2">
                  All
                  <Badge variant="secondary" className="ml-1 bg-gradient-to-br from-blue-400 to-blue-600 text-white border-0">
                    {totalReviews}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="top" className="gap-2">
                  Top Rated
                  <Badge variant="secondary" className="ml-1 bg-gradient-to-br from-yellow-400 to-amber-600 text-white border-0">
                    {topRatedReviews.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="recent" className="gap-2">
                  Recent
                  <Badge variant="secondary" className="ml-1 bg-gradient-to-br from-green-400 to-green-600 text-white border-0">
                    {recentReviews.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{review.driverName}</h4>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold">{review.rating}.0</span>
                          </div>
                        </div>

                        {review.comment && (
                          <>
                            <Separator />
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              "{review.comment}"
                            </p>
                          </>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            {review.userName}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Trip #{review.bookingNumber}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="top">
                {reviews.filter(r => r.rating === 5).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.filter(r => r.rating === 5).map((review) => (
                    <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{review.driverName}</h4>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold">5.0</span>
                          </div>
                        </div>

                        {review.comment && (
                          <>
                            <Separator />
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              "{review.comment}"
                            </p>
                          </>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            {review.userName}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Trip #{review.bookingNumber}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No 5-Star Reviews Yet</h3>
                    <p className="text-muted-foreground">
                      Check back later for top-rated reviews
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="recent">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.slice(0, 12).map((review) => (
                    <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                              <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{review.driverName}</h4>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold">{review.rating}.0</span>
                          </div>
                        </div>

                        {review.comment && (
                          <>
                            <Separator />
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              "{review.comment}"
                            </p>
                          </>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            {review.userName}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Trip #{review.bookingNumber}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Be the first to share your experience with our drivers
              </p>
            </Card>
          )}
        </div>
      </section>
      </div>

      <Footer />
    </div>
  );
};

export default DriverReviews;
