import { motion } from "framer-motion";
import { HelpCircle, Search } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Booking & Reservations",
      questions: [
        {
          question: "How do I book a vehicle?",
          answer: "Browse our vehicle collection, select your preferred car, choose your dates, and complete the booking process. You can pay securely online or at pickup."
        },
        {
          question: "Can I modify or cancel my booking?",
          answer: "Yes! You can modify or cancel your booking from your dashboard. Cancellation policies vary based on how far in advance you cancel."
        },
        {
          question: "What documents do I need to rent a car?",
          answer: "You'll need a valid driver's license, a government-issued ID, and a credit/debit card for payment."
        },
        {
          question: "What is the minimum age to rent a vehicle?",
          answer: "The minimum age is 21 years old. Drivers under 25 may be subject to a young driver surcharge."
        }
      ]
    },
    {
      category: "Payment & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, and online payment methods including PayPal and bank transfers."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees! All charges including taxes and fees are clearly shown during the booking process before you confirm."
        },
        {
          question: "Do you offer discounts for long-term rentals?",
          answer: "Yes! We offer competitive rates for weekly and monthly rentals. Contact us for custom quotes on extended rentals."
        },
        {
          question: "When will I be charged?",
          answer: "Payment is processed when you confirm your booking. For modifications, any additional charges will be processed immediately."
        }
      ]
    },
    {
      category: "Vehicle & Insurance",
      questions: [
        {
          question: "Is insurance included in the rental price?",
          answer: "Basic insurance coverage is included. Additional coverage options are available at checkout for enhanced protection."
        },
        {
          question: "What if the vehicle breaks down?",
          answer: "All our vehicles are regularly maintained. In case of breakdown, contact our 24/7 roadside assistance for immediate help."
        },
        {
          question: "Can I add additional drivers?",
          answer: "Yes, you can add additional drivers during booking or later. All drivers must meet age and license requirements."
        },
        {
          question: "What fuel policy do you have?",
          answer: "Vehicles are provided with a full tank. Please return with a full tank to avoid refueling charges."
        }
      ]
    },
    {
      category: "Pickup & Return",
      questions: [
        {
          question: "Where can I pick up the vehicle?",
          answer: "Pickup is available at our main office or we can deliver to your location for an additional fee."
        },
        {
          question: "What if I return the vehicle late?",
          answer: "Late returns may incur additional charges. Please contact us if you need to extend your rental period."
        },
        {
          question: "Can I return the vehicle to a different location?",
          answer: "Yes, one-way rentals are available. Additional fees may apply for different drop-off locations."
        },
        {
          question: "What condition should the vehicle be in when I return it?",
          answer: "Return the vehicle clean and in the same condition as received. Normal wear and tear is acceptable."
        }
      ]
    },
    {
      category: "Become a Driver",
      questions: [
        {
          question: "How can I become a driver for DriveNow?",
          answer: "Contact us through the 'Become a Driver' option in our contact form. Provide your details, license information, and experience. Our team will review and get back to you."
        },
        {
          question: "What are the requirements to be a driver?",
          answer: "You need a valid driver's license (minimum 2 years), clean driving record, age 23+, and pass our background check."
        },
        {
          question: "Do drivers get training?",
          answer: "Yes! All drivers undergo comprehensive training on customer service, vehicle handling, and company policies."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <div className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-gradient-hero">
                  <HelpCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Find answers to common questions about our rental service
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredFaqs.length > 0 ? (
              <div className="space-y-8">
                {filteredFaqs.map((category, categoryIndex) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                  >
                    <Card className="p-6">
                      <h2 className="text-2xl font-semibold mb-4 text-primary">
                        {category.category}
                      </h2>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, index) => (
                          <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No questions found matching "{searchQuery}"</p>
              </Card>
            )}
          </div>
        </section>

        {/* Still Need Help */}
        <section className="py-12 bg-muted/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-hero text-white font-medium hover:shadow-glow transition-all"
            >
              Contact Support
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
