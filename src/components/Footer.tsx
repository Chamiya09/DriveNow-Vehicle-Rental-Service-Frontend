import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass border-t border-border/50 relative overflow-hidden z-0">
      <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <Logo iconSize="h-6 w-6" />
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                DriveNow
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              Your trusted partner for premium car rental services. Drive with confidence and comfort.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-gradient-hero hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:shadow-glow">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-gradient-hero hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:shadow-glow">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-gradient-hero hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:shadow-glow">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-gradient-hero hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:shadow-glow">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/vehicles" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Browse Vehicles
                </Link>
              </li>
              <li>
                <Link to="/driver-reviews" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Driver Reviews
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/contact?reason=Become+a+Driver" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Become a Driver
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>123 Business Avenue, Suite 100, New York, NY 10001</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>support@driveease.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} DriveEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
