import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg" | "xl";
  showValue?: boolean;
  animated?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showValue = false,
  animated = true,
  interactive = false,
  onRatingChange 
}: StarRatingProps) => {
  
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6"
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const starVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <div className="flex items-center gap-1">
      <motion.div 
        className="flex gap-0.5"
        variants={animated ? containerVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
      >
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.floor(rating);
          const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <motion.div
              key={i}
              variants={animated ? starVariants : undefined}
              whileHover={interactive ? { scale: 1.2, rotate: 15 } : undefined}
              whileTap={interactive ? { scale: 0.9 } : undefined}
              onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
              className={interactive ? "cursor-pointer" : ""}
            >
              {isHalfFilled ? (
                <div className="relative">
                  <Star className={`${sizeClasses[size]} text-gray-300`} />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                    <Star 
                      className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]`} 
                    />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${sizeClasses[size]} transition-all duration-300 ${
                    isFilled 
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse-subtle" 
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
      
      {showValue && (
        <motion.span 
          className="text-sm font-semibold text-yellow-600 ml-1"
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={animated ? { delay: 0.5 } : undefined}
        >
          {rating.toFixed(1)}
        </motion.span>
      )}
    </div>
  );
};

export default StarRating;
