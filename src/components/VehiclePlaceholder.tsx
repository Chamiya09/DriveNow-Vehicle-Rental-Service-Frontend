import { Car } from "lucide-react";

interface VehiclePlaceholderProps {
  category: string;
  name?: string;
}

const VehiclePlaceholder = ({ category, name }: VehiclePlaceholderProps) => {
  // Color schemes based on vehicle category
  const getGradient = (cat: string) => {
    const categoryLower = cat.toLowerCase();
    switch (categoryLower) {
      case "suv":
        return "from-orange-500 via-red-500 to-pink-500";
      case "sedan":
        return "from-blue-500 via-cyan-500 to-teal-500";
      case "hatchback":
        return "from-green-500 via-emerald-500 to-lime-500";
      case "van":
        return "from-purple-500 via-violet-500 to-indigo-500";
      case "luxury":
        return "from-yellow-500 via-amber-500 to-orange-500";
      default:
        return "from-gray-500 via-slate-500 to-zinc-500";
    }
  };

  return (
    <div className={`w-full h-full bg-gradient-to-br ${getGradient(category)} relative overflow-hidden`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        {/* Large car icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150"></div>
          <Car className="w-20 h-20 relative z-10 drop-shadow-2xl animate-bounce-slow" strokeWidth={1.5} />
        </div>
        
        {/* Vehicle name or category */}
        <div className="mt-6 text-center px-4">
          <p className="text-2xl font-bold drop-shadow-lg tracking-wide">
            {name || category}
          </p>
          <p className="text-sm opacity-90 mt-1 font-medium">
            {category.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/30 rounded-full"></div>
      <div className="absolute bottom-4 left-4 w-20 h-20 border-2 border-white/30 rounded-full"></div>
      <div className="absolute top-1/2 left-4 w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-8 w-2 h-2 bg-white/50 rounded-full animate-ping delay-500"></div>
    </div>
  );
};

export default VehiclePlaceholder;
