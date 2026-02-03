import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg" | "xl";
  showValue?: boolean;
  animated?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showValue = false,
  animated = true,
  interactive = false,
  onRatingChange,
  className = ""
}: StarRatingProps) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-7 h-7"
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
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
        stiffness: 300,
        damping: 20
      }
    }
  };

  const handleStarClick = (starValue: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const displayRating = interactive ? (hoveredStar || rating) : rating;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <motion.div 
        className="flex gap-0.5"
        variants={animated ? containerVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
      >
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.floor(displayRating);
          const isHalfFilled = starValue === Math.ceil(displayRating) && displayRating % 1 !== 0;
          
          return (
            <motion.div
              key={i}
              variants={animated ? starVariants : undefined}
              whileHover={interactive ? { scale: 1.2, rotate: 10 } : undefined}
              whileTap={interactive ? { scale: 0.9 } : undefined}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => interactive && setHoveredStar(starValue)}
              onMouseLeave={() => interactive && setHoveredStar(0)}
              className={interactive ? "cursor-pointer" : ""}
            >
              {isHalfFilled ? (
                <div className="relative inline-block">
                  <Star className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`} />
                  <div 
                    className="absolute inset-0 overflow-hidden" 
                    style={{ width: `${(displayRating % 1) * 100}%` }}
                  >
                    <Star 
                      className={`${sizeClasses[size]} fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]`} 
                    />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${sizeClasses[size]} transition-all duration-300 ${
                    isFilled 
                      ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" 
                      : "text-gray-300 dark:text-gray-600"
                  } ${interactive && hoveredStar >= starValue ? "scale-110" : ""}`}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
      
      {showValue && (
        <motion.span 
          className="text-sm font-semibold text-amber-600 dark:text-amber-500 ml-1"
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={animated ? { delay: 0.4 } : undefined}
        >
          {rating.toFixed(1)}
        </motion.span>
      )}
    </div>
  );
};

export default StarRating;
