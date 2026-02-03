import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, AlertCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Contact = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    reason: "",
    messageType: "inquiry",
    message: "",
  });

  // Pre-fill reason from URL parameter
  useEffect(() => {
    const reasonParam = searchParams.get('reason');
    if (reasonParam) {
      setFormData(prev => ({
        ...prev,
        reason: reasonParam,
        subject: reasonParam === "Become a Driver" ? "Driver Application Inquiry" : ""
      }));
    }
  }, [searchParams]);

  const messageReasons = [
    "General Inquiry",
    "Booking Question",
    "Vehicle Availability",
    "Payment Issue",
    "Technical Support",
    "Complaint",
    "Feedback",
    "Service Request",
    "Cancellation Request",
    "Become a Driver",
    "Others"
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+94 11 234 5678", "+94 77 123 4567"],
      color: "text-primary",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["support@drivenow.com", "bookings@drivenow.com"],
      color: "text-secondary",
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["123 Galle Road", "Colombo 03, Sri Lanka"],
      color: "text-accent",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Sat: 8:00 AM - 8:00 PM", "Sunday: 9:00 AM - 6:00 PM"],
      color: "text-success",
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReasonChange = (value: string) => {
    setFormData({
      ...formData,
      reason: value,
    });
  };

  const handleMessageTypeChange = (value: string) => {
    setFormData({
      ...formData,
      messageType: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate reason is selected
    if (!formData.reason) {
      toast.error("Please select a reason/category");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use user's email if logged in, otherwise use form email
      const messageData = {
        name: formData.name,
        email: user?.email || formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        reason: formData.reason,
        messageType: formData.messageType,
      };

      console.log("Sending message data:", messageData);

      // Prepare headers with optional authorization
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add authorization token if user is logged in
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8090/api/contact", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(messageData),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Message sent successfully:", result);
        toast.success(
          formData.messageType === "complaint" 
            ? "Complaint submitted successfully! We'll address this as soon as possible."
            : "Message sent successfully! We'll get back to you soon."
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          reason: "",
          messageType: "inquiry",
          message: "",
        });
      } else {
        const errorText = await response.text();
        console.error("Failed to send message:", response.status, errorText);
        toast.error(`Failed to send message: ${errorText || 'Please try again.'}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow">
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-gradient-hero">Get In Touch</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Contact Us & Submit Complaints
            </h1>
            <p className="text-xl text-muted-foreground">
              Have questions, need assistance, or want to file a complaint? Send us a message and our team will get back to you as soon as possible. No account required!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className={`h-6 w-6 ${info.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-muted-foreground text-sm mb-1">
                      {detail}
                    </p>
                  ))}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact Form and Map */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Send us a Message</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Whether you're a customer, visitor, or have a complaint, feel free to reach out. We respond to all messages!
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Message Type Selector */}
                  <div>
                    <Label htmlFor="messageType">Message Type *</Label>
                    <Select value={formData.messageType} onValueChange={handleMessageTypeChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select message type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inquiry">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            General Inquiry / Message
                          </div>
                        </SelectItem>
                        <SelectItem value="complaint">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Complaint / Issue Report
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.messageType === "complaint" && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Your complaint will be prioritized and handled by our support team
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Show email field only for non-logged-in users */}
                  {!user && (
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="mt-1"
                      />
                    </div>
                  )}
                  
                  {/* Show user's email as read-only for logged-in users */}
                  {user && (
                    <div>
                      <Label htmlFor="userEmail">Email Address</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={user.email}
                        disabled
                        className="mt-1 bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Using your account email
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 77 123 4567"
                      className="mt-1"
                    />
                  </div>

                  {/* Reason Dropdown */}
                  <div>
                    <Label htmlFor="reason">Reason / Category *</Label>
                    <Select value={formData.reason} onValueChange={handleReasonChange} required>
                      <SelectTrigger className={`mt-1 ${!formData.reason ? 'border-amber-500' : ''}`}>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {messageReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!formData.reason && (
                      <p className="text-xs text-amber-600 mt-1">
                        Please select a reason to help us route your message appropriately
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={
                        formData.messageType === "complaint" 
                          ? "Brief description of your complaint" 
                          : "How can we help you?"
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">
                      {formData.messageType === "complaint" ? "Complaint Details *" : "Message *"}
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={
                        formData.messageType === "complaint"
                          ? "Please provide detailed information about your complaint. Include dates, booking references, and any relevant details..."
                          : "Tell us more about your inquiry..."
                      }
                      required
                      rows={6}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.messageType === "complaint" 
                        ? "The more details you provide, the faster we can resolve your issue"
                        : "Be as detailed as possible for better assistance"
                      }
                    </p>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    variant={formData.messageType === "complaint" ? "destructive" : "hero"}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        {formData.messageType === "complaint" ? (
                          <>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Submit Complaint
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </>
                    )}
                  </Button>
                  {!user && (
                    <p className="text-xs text-center text-muted-foreground">
                      💡 Tip: <a href="/auth" className="text-primary hover:underline">Sign in</a> to track your messages and get faster responses
                    </p>
                  )}
                </form>
              </Card>
            </motion.div>

            {/* Map and Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Map */}
              <Card className="p-4 h-80 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.77536912069!2d79.82519914863282!3d6.927078999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593cf65a1e9d%3A0x2a9c7f6b4f4f7f6c!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="DriveNow Location"
                  className="rounded-lg"
                />
              </Card>

              {/* FAQ Card */}
              <Card className="p-6">
                <h3 className="font-semibold text-xl mb-4">Frequently Asked</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">What are your rental requirements?</h4>
                    <p className="text-sm text-muted-foreground">
                      Valid driver's license, ID proof, and credit card for security deposit.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Can I extend my rental period?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes, contact us at least 24 hours before the return time to extend.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Do you offer delivery service?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes, we offer vehicle delivery and pickup services in Colombo area.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Need Immediate Assistance?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our customer support team is available 24/7 to help you with any urgent queries or bookings.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="hero" asChild>
                <a href="tel:+94112345678">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:support@drivenow.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
