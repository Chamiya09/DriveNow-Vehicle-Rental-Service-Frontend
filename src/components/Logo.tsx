import { Car } from "lucide-react";

interface LogoProps {
  className?: string;
  iconSize?: string;
}

const Logo = ({ 
  className = "", 
  iconSize = "h-6 w-6"
}: LogoProps) => {
  return (
    <div className={`relative ${className}`}>
      <div className="bg-gradient-hero p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        <Car className={`${iconSize} text-primary-foreground`} />
      </div>
      <div className="absolute -inset-1 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default Logo;
