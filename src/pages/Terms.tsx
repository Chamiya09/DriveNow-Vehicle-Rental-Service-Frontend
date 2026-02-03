import { motion } from "framer-motion";
import { FileText, Calendar, Shield, Car, CreditCard, Clock, AlertTriangle, CheckCircle2, Info, Scale, Phone, Users, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  const sections = [
    { id: "agreement", title: "Agreement to Terms", icon: FileText },
    { id: "requirements", title: "Rental Requirements", icon: Shield },
    { id: "payment", title: "Booking & Payment", icon: CreditCard },
    { id: "cancellation", title: "Cancellation Policy", icon: Clock },
    { id: "usage", title: "Vehicle Use", icon: Car },
    { id: "insurance", title: "Insurance & Liability", icon: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-50 dark:from-slate-950 dark:via-cyan-950/20 dark:to-slate-950">
      <Navbar />
      
      <div className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div 
                className="flex justify-center mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative p-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-2xl">
                    <Scale className="h-12 w-12 text-white" />
                  </div>
                </div>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Terms & Conditions
              </motion.h1>
              
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Clear, transparent policies for your peace of mind
              </motion.p>
              
              <motion.div 
                className="flex items-center justify-center gap-3 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <Badge variant="outline" className="px-4 py-2 text-base border-blue-600/50 bg-blue-50 dark:bg-blue-950/30">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Updated: January 28, 2026
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-base border-green-600/50 bg-green-50 dark:bg-green-950/30">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  GDPR Compliant
                </Badge>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="py-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {sections.map((section, index) => (
                <motion.a
                  key={section.id}
                  href={`#${section.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md transition-all duration-300 group"
                >
                  <section.icon className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{section.title}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Section 1: Agreement to Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              id="agreement"
              className="scroll-mt-20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Agreement to Terms
                </h2>
              </div>

              <Card className="p-8 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 leading-relaxed">
                      By accessing and using <span className="font-semibold text-blue-600">DriveNow's</span> vehicle rental services, you accept and agree to be bound by the terms and provisions of this agreement. This includes all policies, guidelines, and amendments that may be updated from time to time.
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Important:</strong> Please read these terms carefully before making a reservation. Your booking confirmation indicates your acceptance of these terms.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Section 2: Rental Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              id="requirements"
              className="scroll-mt-20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Rental Requirements
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-2 border-cyan-100 hover:border-cyan-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-cyan-50">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Age Requirements</h3>
                  </div>
                  <Badge className="mb-3 bg-cyan-100 text-cyan-700 hover:bg-cyan-200">
                    Minimum Age: 21 Years
                  </Badge>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Drivers under 25 years may be subject to a young driver surcharge. Valid ID required for age verification at pickup.
                  </p>
                </Card>

                <Card className="p-6 border-2 border-cyan-100 hover:border-cyan-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-cyan-50">
                      <FileText className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">License Requirements</h3>
                  </div>
                  <Badge className="mb-3 bg-cyan-100 text-cyan-700 hover:bg-cyan-200">
                    1+ Year Validity
                  </Badge>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Valid driver's license held for at least 1 year. International customers need an IDP along with original license.
                  </p>
                </Card>

                <Card className="p-6 border-2 border-cyan-100 hover:border-cyan-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-cyan-50">
                      <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Documentation</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      <span>Valid driver's license</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      <span>Government-issued photo ID</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      <span>Credit/debit card in renter's name</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </motion.div>

            {/* Section 3: Booking and Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              id="payment"
              className="scroll-mt-20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Booking & Payment
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Reservation</h3>
                  </div>
                  <Badge className="mb-3 bg-green-100 text-green-700 hover:bg-green-200">
                    Instant Confirmation
                  </Badge>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    All reservations subject to vehicle availability. Email confirmation sent upon successful booking with pickup details.
                  </p>
                </Card>

                <Card className="p-6 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-50">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Payment Terms</h3>
                  </div>
                  <Badge className="mb-3 bg-green-100 text-green-700 hover:bg-green-200">
                    Full Payment Required
                  </Badge>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Payment due at booking. Accepting major credit cards, debit cards, and approved digital payment methods.
                  </p>
                </Card>

                <Card className="p-6 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Security Deposit</h3>
                  </div>
                  <Badge className="mb-3 bg-green-100 text-green-700 hover:bg-green-200">
                    Refundable Hold
                  </Badge>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Temporary hold on card during rental period. Amount varies by vehicle type and released after return inspection.
                  </p>
                </Card>
              </div>
            </motion.div>

            {/* Section 4: Cancellation Policy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              id="cancellation"
              className="scroll-mt-20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Cancellation Policy
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full opacity-50"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-50">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                      100% Refund
                    </Badge>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 mb-2">More than 48 hours</h3>
                  <p className="text-slate-600 text-sm">
                    Cancel 48+ hours before pickup for a full refund. No questions asked, hassle-free cancellation.
                  </p>
                </Card>

                <Card className="p-6 border-2 border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-full opacity-50"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-orange-50">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                      50% Refund
                    </Badge>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 mb-2">24-48 hours</h3>
                  <p className="text-slate-600 text-sm">
                    Cancellations between 24-48 hours before pickup receive 50% refund of total booking amount.
                  </p>
                </Card>

                <Card className="p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-full opacity-50"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-50">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                      No Refund
                    </Badge>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 mb-2">Less than 24 hours</h3>
                  <p className="text-slate-600 text-sm">
                    Late cancellations within 24 hours of pickup are non-refundable due to booking commitments.
                  </p>
                </Card>
              </div>
            </motion.div>

            {/* Section 5: Vehicle Use */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              id="usage"
              className="scroll-mt-20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Vehicle Use Guidelines
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Permitted Use</h3>
                  </div>
                  <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-200">
                    Lawful Purposes Only
                  </Badge>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Vehicles may only be used for lawful purposes on properly maintained roads. Drive safely and responsibly at all times.
                  </p>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800 font-medium">
                      ✓ Public roads and highways only
                    </p>
                  </div>
                </Card>

                <Card className="p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-50">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Prohibited Use</h3>
                  </div>
                  <Badge className="mb-3 bg-red-100 text-red-700 hover:bg-red-200">
                    Strictly Forbidden
                  </Badge>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Racing or illegal activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Transporting hazardous materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Driving under influence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Subleasing or unauthorized rentals</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </motion.div>

            {/* Section 6: Insurance and Liability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              id="insurance"
              className="scroll-mt-20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Insurance & Liability
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-50">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Coverage Included</h3>
                  </div>
                  <Badge className="mb-3 bg-red-100 text-red-700 hover:bg-red-200">
                    Basic Protection
                  </Badge>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Basic insurance coverage included with all rentals. Additional premium coverage options available at checkout for enhanced protection.
                  </p>
                </Card>

                <Card className="p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-50">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Damage Liability</h3>
                  </div>
                  <Badge className="mb-3 bg-red-100 text-red-700 hover:bg-red-200">
                    Renter Responsible
                  </Badge>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    You're responsible for vehicle damage during rental period, up to insurance deductible amount. Inspect vehicle before departure.
                  </p>
                </Card>

                <Card className="p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-50">
                      <Phone className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Accident Protocol</h3>
                  </div>
                  <Badge className="mb-3 bg-red-100 text-red-700 hover:bg-red-200">
                    Immediate Action
                  </Badge>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Contact local authorities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Notify DriveNow within 24hrs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Complete accident report</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </motion.div>

            {/* Section 7: Fuel & Return Policies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-slate-900 shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600">
                      <Car className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-6">7. Fuel & Return Policies</h2>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <Car className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-lg">Fuel Policy</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Vehicles are provided with a <strong>full tank</strong> of fuel.
                          </p>
                          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-orange-900 dark:text-orange-100">
                                <strong>Important:</strong> Return with a full tank to avoid refueling charges plus service fee.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-lg">Return Time</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Return vehicles by the <strong>agreed time</strong>.
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>On-time return = No extra charges</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <span>Late return = Additional daily charges</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 border md:col-span-2">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-lg">Return Condition</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Return vehicles <strong>clean</strong> and in the <strong>same condition</strong> as received. Excessive dirt or damage may result in cleaning or repair fees.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Section 8: Additional Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-slate-900 shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-6">8. Additional Terms & Conditions</h2>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Car className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold">Mileage</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong className="text-green-600">Unlimited mileage</strong> included for most rentals.
                          </p>
                          <Badge variant="secondary" className="text-xs">Check Agreement</Badge>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold">Additional Drivers</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Must be registered at rental time and meet all requirements.
                          </p>
                          <Badge variant="secondary" className="text-xs">Fees May Apply</Badge>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold">Extensions</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Must be requested and approved <strong>before</strong> original return time.
                          </p>
                          <Badge variant="secondary" className="text-xs">Pre-Approval Required</Badge>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Lock className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold">Privacy & Data</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Handled per our Privacy Policy. Used only for rental services.
                          </p>
                          <Badge variant="secondary" className="text-xs">Secure</Badge>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold">Liability Limits</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Not liable for indirect, incidental, or consequential damages.
                          </p>
                          <Badge variant="secondary" className="text-xs">Standard Terms</Badge>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Scale className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold">Dispute Resolution</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Resolved through arbitration per local laws.
                          </p>
                          <Badge variant="secondary" className="text-xs">Arbitration</Badge>
                        </div>
                      </div>

                      <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 text-white">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold mb-2">Changes to Terms</h3>
                            <p className="text-sm text-green-50">
                              We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of modified terms. We'll notify you of significant changes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl">
                <div className="text-center max-w-2xl mx-auto">
                  <Phone className="h-12 w-12 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-3">Questions About Our Terms?</h2>
                  <p className="text-blue-50 mb-6">
                    Our legal team is here to help clarify any questions you may have.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Email</Badge>
                      <span>legal@drivenow.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Phone</Badge>
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                  <Separator className="my-6 bg-white/20" />
                  <p className="text-sm text-blue-100">
                    By proceeding with a rental, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
