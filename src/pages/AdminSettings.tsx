import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Shield, Save, ArrowLeft, Settings, Car, DollarSign, Clock, MapPin, Percent } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const AdminSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile Settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password Settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Business Settings
  const [instantBooking, setInstantBooking] = useState(false);
  const [requireVehicleInspection, setRequireVehicleInspection] = useState(true);
  const [autoAssignDrivers, setAutoAssignDrivers] = useState(false);
  const [allowModifications, setAllowModifications] = useState(true);
  const [requireInsuranceUpload, setRequireInsuranceUpload] = useState(true);
  const [lateReturnPenalty, setLateReturnPenalty] = useState("10");
  const [cancellationWindow, setCancellationWindow] = useState("24");
  const [maxBookingDuration, setMaxBookingDuration] = useState("30");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8090/api/preferences/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const prefs = await response.json();
        setEmailNotifications(prefs.emailNotifications ?? true);
        setSmsNotifications(prefs.smsNotifications ?? true);
        setBookingAlerts(prefs.bookingAlerts ?? true);
        setSystemAlerts(prefs.systemAlerts ?? true);
        setInstantBooking(prefs.instantBooking ?? false);
        setRequireVehicleInspection(prefs.requireVehicleInspection ?? true);
        setAutoAssignDrivers(prefs.autoAssignDrivers ?? false);
        setAllowModifications(prefs.allowModifications ?? true);
        setRequireInsuranceUpload(prefs.requireInsuranceUpload ?? true);
        setLateReturnPenalty(prefs.lateReturnPenalty ?? "10");
        setCancellationWindow(prefs.cancellationWindow ?? "24");
        setMaxBookingDuration(prefs.maxBookingDuration ?? "30");
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8090/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8090/api/users/${user?.id}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.text();
        toast.error(error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An error occurred while changing password");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8090/api/preferences/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailNotifications,
          smsNotifications,
          bookingAlerts,
          systemAlerts,
        }),
      });

      if (response.ok) {
        toast.success("Notification preferences saved successfully!");
      } else {
        toast.error("Failed to save notification preferences");
      }
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("An error occurred while saving preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8090/api/preferences/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instantBooking,
          requireVehicleInspection,
          autoAssignDrivers,
          allowModifications,
          requireInsuranceUpload,
          lateReturnPenalty: parseFloat(lateReturnPenalty),
          cancellationWindow: parseInt(cancellationWindow),
          maxBookingDuration: parseInt(maxBookingDuration),
        }),
      });

      if (response.ok) {
        toast.success("Business settings saved successfully!");
      } else {
        toast.error("Failed to save business settings");
      }
    } catch (error) {
      console.error("Error saving business settings:", error);
      toast.error("An error occurred while saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/dashboard/admin">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account and system settings
                </p>
              </div>
              <Badge variant="outline" className="bg-gradient-hero text-primary-foreground">
                Admin Account
              </Badge>
            </div>
          </motion.div>

          {/* Settings Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Business
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-hero p-3 rounded-lg">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Profile Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Update your personal information
                      </p>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="mt-2"
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <Button type="submit" disabled={loading} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-hero p-3 rounded-lg">
                      <Shield className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Security Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your password and security preferences
                      </p>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password *</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="mt-2"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be at least 6 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="mt-2"
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <Button type="submit" disabled={loading} className="w-full">
                        <Lock className="mr-2 h-4 w-4" />
                        {loading ? "Updating..." : "Change Password"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-hero p-3 rounded-lg">
                      <Bell className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Notification Preferences</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose how you want to receive notifications
                      </p>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via text message
                        </p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="booking-alerts">Booking Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new bookings
                        </p>
                      </div>
                      <Switch
                        id="booking-alerts"
                        checked={bookingAlerts}
                        onCheckedChange={setBookingAlerts}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="system-alerts">System Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive critical system notifications
                        </p>
                      </div>
                      <Switch
                        id="system-alerts"
                        checked={systemAlerts}
                        onCheckedChange={setSystemAlerts}
                      />
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleSaveNotifications} disabled={loading} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Preferences"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Business Tab */}
              <TabsContent value="business">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-hero p-3 rounded-lg">
                      <Car className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Business Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure rental business rules and policies
                      </p>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <div className="space-y-6">
                    {/* Booking Settings */}
                    <div>
                      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Booking Management
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="instant-booking">Instant Booking</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow customers to book vehicles instantly without approval
                            </p>
                          </div>
                          <Switch
                            id="instant-booking"
                            checked={instantBooking}
                            onCheckedChange={setInstantBooking}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="allow-modifications">Allow Booking Modifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Let customers modify their bookings after confirmation
                            </p>
                          </div>
                          <Switch
                            id="allow-modifications"
                            checked={allowModifications}
                            onCheckedChange={setAllowModifications}
                          />
                        </div>

                        <div>
                          <Label htmlFor="cancellation-window" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Cancellation Window (hours)
                          </Label>
                          <Input
                            id="cancellation-window"
                            type="number"
                            min="0"
                            value={cancellationWindow}
                            onChange={(e) => setCancellationWindow(e.target.value)}
                            placeholder="24"
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Free cancellation window before booking start time
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="max-booking" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Maximum Booking Duration (days)
                          </Label>
                          <Input
                            id="max-booking"
                            type="number"
                            min="1"
                            value={maxBookingDuration}
                            onChange={(e) => setMaxBookingDuration(e.target.value)}
                            placeholder="30"
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Maximum number of days for a single booking
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Vehicle & Driver Settings */}
                    <div>
                      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Vehicle & Driver Management
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="vehicle-inspection">Require Vehicle Inspection</Label>
                            <p className="text-sm text-muted-foreground">
                              Mandatory vehicle inspection before and after each rental
                            </p>
                          </div>
                          <Switch
                            id="vehicle-inspection"
                            checked={requireVehicleInspection}
                            onCheckedChange={setRequireVehicleInspection}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="auto-assign">Auto-Assign Drivers</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically assign available drivers to bookings
                            </p>
                          </div>
                          <Switch
                            id="auto-assign"
                            checked={autoAssignDrivers}
                            onCheckedChange={setAutoAssignDrivers}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="insurance-upload">Require Insurance Documents</Label>
                            <p className="text-sm text-muted-foreground">
                              Customers must upload insurance documents before booking
                            </p>
                          </div>
                          <Switch
                            id="insurance-upload"
                            checked={requireInsuranceUpload}
                            onCheckedChange={setRequireInsuranceUpload}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Pricing & Penalties */}
                    <div>
                      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Pricing & Penalties
                      </h4>
                      
                      <div>
                        <Label htmlFor="late-penalty" className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          Late Return Penalty (%)
                        </Label>
                        <Input
                          id="late-penalty"
                          type="number"
                          min="0"
                          step="0.1"
                          value={lateReturnPenalty}
                          onChange={(e) => setLateReturnPenalty(e.target.value)}
                          placeholder="10"
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Additional charge percentage for late vehicle returns
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleSaveBusinessSettings} disabled={loading} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Business Settings"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminSettings;
