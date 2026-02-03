import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import StarRating from "./StarRating";

interface ReviewCardProps {
  name: string;
  role: string;
  rating: number;
  comment: string;
  image?: string;
  date: string;
  vehicleRented?: string;
}

const ReviewCard = ({ name, role, rating, comment, image, date, vehicleRented }: ReviewCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="glass-card p-6 h-full flex flex-col hover-lift">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="bg-gradient-hero text-primary-foreground">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{name}</h4>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={rating} size="md" showValue={false} animated={false} />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-500">{rating}.0</span>
        </div>

        <p className="text-muted-foreground mb-4 flex-grow">{comment}</p>

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
          {vehicleRented && (
            <span className="font-medium text-primary">{vehicleRented}</span>
          )}
          <span>{date}</span>
        </div>
      </Card>
    </motion.div>
  );
};

export default ReviewCard;
