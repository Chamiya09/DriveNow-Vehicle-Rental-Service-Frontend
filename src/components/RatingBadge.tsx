import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

interface RatingBadgeProps {
  rating: number;
  maxRating?: number;
  variant?: "default" | "premium" | "minimal" | "gradient";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showSparkles?: boolean;
}

const RatingBadge = ({
  rating,
  maxRating = 5,
  variant = "default",
  size = "md",
  animated = true,
  showSparkles = false,
}: RatingBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-2",
  };

  const starSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  const variantClasses = {
    default:
      "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400",
    premium:
      "bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-white border-none shadow-lg shadow-yellow-500/50",
    minimal:
      "bg-secondary/50 border border-border text-foreground",
    gradient:
      "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300",
  };

  const badgeVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  };

  const sparkleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 0.8],
      transition: {
        duration: 0.6,
        delay: 0.2,
      },
    },
  };

  const Badge = animated ? motion.div : "div";

  return (
    <Badge
      className={`inline-flex items-center rounded-full font-semibold transition-all hover:scale-105 ${sizeClasses[size]} ${variantClasses[variant]}`}
      {...(animated && {
        variants: badgeVariants,
        initial: "hidden",
        animate: "visible",
        whileHover: { scale: 1.1, rotate: [0, -5, 5, 0] },
      })}
    >
      {showSparkles && (
        <motion.div
          variants={animated ? sparkleVariants : undefined}
          initial={animated ? "hidden" : undefined}
          animate={animated ? "visible" : undefined}
        >
          <Sparkles className={`${starSizes[size]} mr-0.5`} />
        </motion.div>
      )}

      <span className="font-bold tabular-nums">{rating.toFixed(1)}</span>

      <Star
        className={`${starSizes[size]} fill-current ${
          variant === "premium" ? "drop-shadow-glow" : ""
        }`}
      />

      {variant !== "minimal" && (
        <span className="text-[0.7em] opacity-75">/ {maxRating}</span>
      )}
    </Badge>
  );
};

export default RatingBadge;
