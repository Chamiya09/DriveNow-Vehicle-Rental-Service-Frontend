import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Calendar, UserCheck, Globe, Cookie, Bell, CheckCircle2, AlertCircle, Info, Mail, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Privacy = () => {
  const dataTypes = [
    { icon: UserCheck, title: "Personal Info", color: "blue" },
    { icon: Database, title: "Booking Data", color: "purple" },
    { icon: Eye, title: "Usage Info", color: "green" },
    { icon: MapPin, title: "Location Data", color: "orange" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-50 dark:from-slate-950 dark:via-cyan-950/20 dark:to-slate-950">
      <Navbar />
      
      <div className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative p-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-2xl">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                </div>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Privacy Policy
              </motion.h1>
              
              <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Your privacy is our priority. We're committed to protecting your personal information.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-3 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <Badge variant="outline" className="px-4 py-2 text-base border-cyan-600/50 bg-cyan-50 dark:bg-cyan-950/30">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Updated: January 28, 2026
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-base border-blue-600/50 bg-blue-50 dark:bg-blue-950/30">
                  <Shield className="h-4 w-4 mr-2" />
                  GDPR Compliant
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-base border-green-600/50 bg-green-50 dark:bg-green-950/30">
                  <Lock className="h-4 w-4 mr-2" />
                  SSL Encrypted
                </Badge>
              </motion.div>
            </motion.div>

            {/* Data Types Overview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {dataTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="text-center p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border hover:shadow-lg transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${type.color}-100 dark:bg-${type.color}-900/30 flex items-center justify-center mx-auto mb-3`}>
                    <type.icon className={`h-6 w-6 text-${type.color}-600`} />
                  </div>
                  <p className="font-medium text-sm">{type.title}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            {/* Privacy Commitment Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <Card className="p-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl">
                <p className="text-lg leading-relaxed">
                  At DriveNow, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information with complete transparency.
                </p>
              </Card>
            </motion.div>

            {/* Section 1: Information We Collect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-950/20 dark:to-slate-900 shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        1. Information We Collect
                        <Badge variant="outline" className="ml-2">Transparent</Badge>
                      </h2>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-blue-600" />
                              </div>
                              <h3 className="font-semibold text-lg">Personal Information</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">When you register or book with us:</p>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Name & contact info (email, phone, address)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Driver's license information</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Payment and billing details</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Government ID for verification</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Date of birth & age verification</span>
                              </li>
                            </ul>
                          </div>

                          <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Database className="h-5 w-5 text-green-600" />
                              </div>
                              <h3 className="font-semibold text-lg">Booking Information</h3>
                            </div>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Rental dates and locations</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Vehicle preferences & history</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Additional services requested</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Insurance selections</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Eye className="h-5 w-5 text-orange-600" />
                              </div>
                              <h3 className="font-semibold text-lg">Usage Information</h3>
                            </div>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Website and app usage data</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Device info & IP address</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Browser type and version</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Pages visited & time spent</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Referral sources</span>
                              </li>
                            </ul>
                          </div>

                          <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-blue-600" />
                              </div>
                              <h3 className="font-semibold text-lg">Vehicle Usage Data</h3>
                            </div>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Mileage & fuel consumption</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>GPS location (when enabled)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Vehicle condition reports</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                                <span>Incident reports</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-cyan-600 mt-0.5" />
                          <p className="text-sm text-cyan-900 dark:text-cyan-100">
                            <strong>Why we collect this:</strong> This information helps us provide you with a personalized, secure, and seamless rental experience.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Section 2: How We Use Your Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="overflow-hidden border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900 shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                      <Eye className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-6">2. How We Use Your Information</h2>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-7 w-7 text-blue-600" />
                          </div>
                          <h3 className="font-semibold mb-3">Service Delivery</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground text-left">
                            <li>• Process rentals</li>
                            <li>• Verify identity</li>
                            <li>• Process payments</li>
                            <li>• Customer support</li>
                          </ul>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-7 w-7 text-cyan-600" />
                          </div>
                          <h3 className="font-semibold mb-3">Communication</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground text-left">
                            <li>• Rental reminders</li>
                            <li>• Respond to inquiries</li>
                            <li>• Service notifications</li>
                            <li>• Promotional offers</li>
                          </ul>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                            <Database className="h-7 w-7 text-green-600" />
                          </div>
                          <h3 className="font-semibold mb-3">Analytics</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground text-left">
                            <li>• Usage patterns</li>
                            <li>• Service improvements</li>
                            <li>• New features</li>
                            <li>• Market research</li>
                          </ul>
                        </div>

                        <div className="text-center p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-7 w-7 text-orange-600" />
                          </div>
                          <h3 className="font-semibold mb-3">Legal & Safety</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground text-left">
                            <li>• Legal compliance</li>
                            <li>• Fraud prevention</li>
                            <li>• Policy enforcement</li>
                            <li>• Rights protection</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Section 3: Information Sharing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-slate-900 shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                      <Database className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-6">3. Information Sharing & Disclosure</h2>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm">
                          <h3 className="font-semibold text-lg mb-4">Service Providers</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            We share information with trusted third-party providers:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Payment Processors</Badge>
                            <Badge variant="secondary">Insurance</Badge>
                            <Badge variant="secondary">Background Checks</Badge>
                            <Badge variant="secondary">Customer Support</Badge>
                            <Badge variant="secondary">Analytics</Badge>
                          </div>
                        </div>

                        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm">
                          <h3 className="font-semibold text-lg mb-4">Legal Requirements</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            We may disclose information when required:
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-green-600" />
                              <span>Legal processes compliance</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-green-600" />
                              <span>Government requests</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-green-600" />
                              <span>Agreement enforcement</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-green-600" />
                              <span>Rights & safety protection</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border">
                          <h3 className="font-semibold text-lg mb-3">Business Transfers</h3>
                          <p className="text-sm text-muted-foreground">
                            In merger/acquisition scenarios, your information may transfer to the acquiring entity with continued protection.
                          </p>
                        </div>

                        <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border">
                          <h3 className="font-semibold text-lg mb-3">With Your Consent</h3>
                          <p className="text-sm text-muted-foreground">
                            We share information with other parties only when you provide explicit consent.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Section 4: Data Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="overflow-hidden border-l-4 border-l-red-500 bg-gradient-to-br from-red-50/50 to-white dark:from-red-950/20 dark:to-slate-900 shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-600">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-6">4. Data Security</h2>
                      
                      <p className="text-muted-foreground mb-6">
                        We implement industry-leading security measures to protect your information:
                      </p>

                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm text-center">
                          <Lock className="h-8 w-8 text-red-600 mx-auto mb-3" />
                          <p className="font-semibold mb-1">SSL/TLS Encryption</p>
                          <p className="text-xs text-muted-foreground">Secure data transmission</p>
                        </div>
                        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm text-center">
                          <Database className="h-8 w-8 text-red-600 mx-auto mb-3" />
                          <p className="font-semibold mb-1">Encrypted Storage</p>
                          <p className="text-xs text-muted-foreground">Protected sensitive data</p>
                        </div>
                        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border shadow-sm text-center">
                          <Shield className="h-8 w-8 text-red-600 mx-auto mb-3" />
                          <p className="font-semibold mb-1">Security Audits</p>
                          <p className="text-xs text-muted-foreground">Regular assessments</p>
                        </div>
                      </div>

                      <div className="p-5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-red-900 dark:text-red-100 mb-1">Security Notice:</p>
                            <p className="text-red-800 dark:text-red-200">
                              While we implement robust security measures, no internet transmission is 100% secure. We continuously update our practices to ensure maximum protection.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Section 5: Your Rights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="overflow-hidden border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900 shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-6">5. Your Rights & Choices</h2>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
                          <Eye className="h-8 w-8 mb-3" />
                          <h3 className="font-semibold mb-2">Access & Correction</h3>
                          <p className="text-sm text-blue-50">
                            View and update your personal information anytime through your dashboard.
                          </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg">
                          <Database className="h-8 w-8 mb-3" />
                          <h3 className="font-semibold mb-2">Data Deletion</h3>
                          <p className="text-sm text-cyan-50">
                            Request complete account and data deletion at any time.
                          </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg">
                          <Bell className="h-8 w-8 mb-3" />
                          <h3 className="font-semibold mb-2">Marketing Opt-Out</h3>
                          <p className="text-sm text-pink-50">
                            Unsubscribe from promotional emails with one click.
                          </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                          <Cookie className="h-8 w-8 mb-3" />
                          <h3 className="font-semibold mb-2">Cookie Control</h3>
                          <p className="text-sm text-blue-50">
                            Manage cookies through your browser settings.
                          </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-lg">
                          <MapPin className="h-8 w-8 mb-3" />
                          <h3 className="font-semibold mb-2">Location Settings</h3>
                          <p className="text-sm text-green-50">
                            Control location tracking through device settings.
                          </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                          <Globe className="h-8 w-8 mb-3" />
                          <h3 className="font-semibold mb-2">Data Portability</h3>
                          <p className="text-sm text-orange-50">
                            Request your data in a portable format.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Additional Policies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-lg">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">Data Retention</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Rental records retained for 7 years for legal/accounting purposes. Other data kept as needed for services.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-cyan-600" />
                      </div>
                      <h3 className="font-semibold">Children's Privacy</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Services not intended for users under 18. We don't knowingly collect children's information.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold">International Transfers</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Data may be transferred internationally with appropriate safeguards in place.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold">Third-Party Links</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      External links may have different privacy practices. We're not responsible for third-party sites.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">Policy Updates</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We'll notify you of significant policy changes via email or website notice.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                        <Cookie className="h-5 w-5 text-pink-600" />
                      </div>
                      <h3 className="font-semibold">Cookie Policy</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We use essential and optional cookies. Control preferences through browser settings.
                    </p>
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
                  <Mail className="h-12 w-12 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-3">Questions About Your Privacy?</h2>
                  <p className="text-cyan-50 mb-6">
                    Our privacy team is here to help address any concerns or questions.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 text-sm mb-6">
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <Mail className="h-6 w-6 mx-auto mb-2" />
                      <p className="font-medium mb-1">Email</p>
                      <p className="text-cyan-100">privacy@drivenow.com</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <Bell className="h-6 w-6 mx-auto mb-2" />
                      <p className="font-medium mb-1">Phone</p>
                      <p className="text-cyan-100">+1 (555) 123-4567</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <MapPin className="h-6 w-6 mx-auto mb-2" />
                      <p className="font-medium mb-1">Address</p>
                      <p className="text-cyan-100 text-xs">123 Business Ave, NY 10001</p>
                    </div>
                  </div>
                  <Separator className="my-6 bg-white/20" />
                  <p className="text-sm text-cyan-100">
                    By using DriveNow's services, you acknowledge that you have read and understood this Privacy Policy.
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

export default Privacy;
