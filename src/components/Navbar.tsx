import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings, Bell, Trash2, Car, Calendar, Star, LayoutDashboard, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import Logo from "./Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const navigate = useNavigate();

  // Fetch notifications when user logs in or changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  // Handle notification click - navigate to action URL
  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      // Parse the action URL
      let url = notification.actionUrl;
      
      // Map legacy URLs to new routes
      url = url.replace('/user-dashboard', '/dashboard/user');
      url = url.replace('/admin-dashboard', '/dashboard/admin');
      url = url.replace('/driver-dashboard', '/dashboard/driver');
      
      // Check if it's a dashboard tab URL
      if (url.includes('?tab=')) {
        const [path, query] = url.split('?');
        const params = new URLSearchParams(query);
        const tab = params.get('tab');
        
        // Navigate to dashboard with tab
        navigate(path, { state: { activeTab: tab } });
      } else {
        // Navigate directly to the URL
        navigate(url);
      }
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const getAuthenticatedNavLinks = () => {
    const links = [];
    
    if (user?.role === "ADMIN") {
      // Admin has no navbar tabs - uses dashboard only
      links.push();
    } else if (user?.role === "DRIVER") {
      // Driver has no navbar tabs - uses dashboard only
      links.push();
    } else if (user?.role === "USER") {
      links.push(
        { name: "Home", path: "/", icon: LayoutDashboard },
        { name: "Vehicles", path: "/vehicles", icon: Car },
        { name: "About", path: "/about", icon: FileText },
        { name: "Contact", path: "/contact", icon: Users }
      );
    }
    
    return links;
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    if (user?.role === "ADMIN") return "/dashboard/admin";
    if (user?.role === "DRIVER") return "/dashboard/driver";
    return "/dashboard/user";
  };

  const getSettingsLink = () => {
    if (user?.role === "ADMIN") return "/settings/admin";
    if (user?.role === "DRIVER") return "/settings/driver";
    if (user?.role === "USER") return "/dashboard/user";
    return null;
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Logo iconSize="h-6 w-6" />
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              DriveNow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated && user ? (
              getAuthenticatedNavLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative text-foreground hover:text-primary transition-colors font-medium group flex items-center gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))
            ) : (
              navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative text-foreground hover:text-primary transition-colors font-medium group"
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative border border-border/50">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <div className="flex items-center justify-between px-4 py-2">
                      <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-xs"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div key={notification.id}>
                            <DropdownMenuItem
                              className={`flex-col items-start p-4 cursor-pointer focus:bg-muted hover:bg-muted/50 transition-colors ${
                                !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start gap-3 w-full">
                                <div
                                  className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                                    notification.type === "INFO"
                                      ? "bg-blue-500"
                                      : notification.type === "SUCCESS"
                                      ? "bg-green-500"
                                      : notification.type === "WARNING"
                                      ? "bg-yellow-500"
                                      : notification.type === "ERROR"
                                      ? "bg-red-500"
                                      : "bg-purple-500"
                                  } ${notification.isRead ? "opacity-30" : "animate-pulse"}`}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className={`font-medium text-sm ${!notification.isRead ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                                      {notification.title}
                                    </p>
                                    {notification.category && (
                                      <Badge variant="outline" className="text-xs">
                                        {notification.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                    {notification.actionUrl && (
                                      <span className="text-xs text-blue-500 font-medium">
                                        Click to view →
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </DropdownMenuItem>
                            {index < notifications.length - 1 && <DropdownMenuSeparator />}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-hero text-primary-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "DRIVER" ? "default" : "secondary"} className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    {getSettingsLink() && (
                      <DropdownMenuItem asChild>
                        <Link to={getSettingsLink()!} className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="relative overflow-hidden group/btn">
                    <span className="relative z-10 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </span>
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm" className="glow-primary hover:glow-secondary transition-all duration-500">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-card"
          >
            <div className="px-4 py-4 space-y-3">
              {isAuthenticated && user ? (
                getAuthenticatedNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                ))
              ) : (
                navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    {link.name}
                  </Link>
                ))
              )}
              <div className="pt-3 border-t space-y-2">
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "DRIVER" ? "default" : "secondary"} className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                    <Link to={getDashboardLink()} onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to={getDashboardLink()} onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </Button>
                    </Link>
                    {user?.role === "USER" && (
                      <>
                        <Link to="/dashboard/user" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <Calendar className="h-4 w-4 mr-2" />
                            My Bookings
                          </Button>
                        </Link>
                        <Link to="/reviews" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <Star className="h-4 w-4 mr-2" />
                            My Reviews
                          </Button>
                        </Link>
                      </>
                    )}
                    {user?.role === "DRIVER" && (
                      <>
                        <Link to="/dashboard/driver" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <Car className="h-4 w-4 mr-2" />
                            My Trips
                          </Button>
                        </Link>
                        <Link to="/dashboard/driver" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Earnings
                          </Button>
                        </Link>
                      </>
                    )}
                    {getSettingsLink() && (
                      <Link to={getSettingsLink()!} onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" size="sm" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
