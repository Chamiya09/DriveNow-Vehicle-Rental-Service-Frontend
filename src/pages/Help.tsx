import { motion } from "framer-motion";
import { LifeBuoy, MessageCircle, Phone, Mail, Book, HelpCircle, FileText, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Help = () => {
  const helpCategories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn how to book your first vehicle and navigate our platform",
      link: "/faq",
      color: "text-blue-500"
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      description: "Information about payment methods, invoices, and refunds",
      link: "/faq",
      color: "text-green-500"
    },
    {
      icon: FileText,
      title: "Policies & Terms",
      description: "Review our rental policies, terms, and conditions",
      link: "/terms",
      color: "text-purple-500"
    },
    {
      icon: HelpCircle,
      title: "Common Questions",
      description: "Browse frequently asked questions and answers",
      link: "/faq",
      color: "text-orange-500"
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      action: "Coming Soon",
      color: "text-primary"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us: +1 (555) 123-4567",
      action: "Call Now",
      link: "tel:+15551234567",
      color: "text-green-500"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "support@drivenow.com",
      action: "Send Email",
      link: "/contact",
      color: "text-blue-500"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <div className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-gradient-hero">
                  <LifeBuoy className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
                Help Center
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find answers, get support, and learn how to make the most of DriveNow
              </p>
            </motion.div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Browse Help Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={category.link}>
                    <Card className="p-6 h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                      <category.icon className={`h-10 w-10 mb-4 ${category.color} group-hover:scale-110 transition-transform`} />
                      <h3 className="font-semibold mb-2">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-12 bg-muted/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold mb-6">Popular Help Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 hover:shadow-md transition-shadow">
                <Link to="/faq" className="flex items-start gap-4 group">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      How to book a vehicle?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step guide to making your first booking
                    </p>
                  </div>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <Link to="/faq" className="flex items-start gap-4 group">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      Payment methods and refunds
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Learn about accepted payments and refund policies
                    </p>
                  </div>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <Link to="/faq" className="flex items-start gap-4 group">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      Required documents for rental
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      What you need to bring when picking up a vehicle
                    </p>
                  </div>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <Link to="/faq" className="flex items-start gap-4 group">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <LifeBuoy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      How to become a driver?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Requirements and process to join our driver network
                    </p>
                  </div>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Need More Help?</h2>
            <p className="text-center text-muted-foreground mb-8">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => (
                <motion.div
                  key={option.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="p-6 text-center h-full flex flex-col">
                    <option.icon className={`h-10 w-10 mx-auto mb-4 ${option.color}`} />
                    <h3 className="font-semibold mb-2">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{option.description}</p>
                    {option.link ? (
                      <Button asChild variant="outline" className="w-full">
                        <Link to={option.link}>{option.action}</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full">
                        {option.action}
                      </Button>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-12 bg-gradient-hero text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">24/7 Emergency Assistance</h2>
            <p className="mb-6">
              If you're experiencing an emergency during your rental, call our 24/7 hotline
            </p>
            <a
              href="tel:+15551234567"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white text-primary font-semibold hover:bg-gray-100 transition-all"
            >
              <Phone className="h-5 w-5" />
              +1 (555) 123-4567
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Help;
