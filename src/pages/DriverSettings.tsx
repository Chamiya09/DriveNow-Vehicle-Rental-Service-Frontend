import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Shield, Save, ArrowLeft } from "lucide-react";
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

const DriverSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile Settings
  const [phone, setPhone] = useState("");

  // Password Settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [tripAlerts, setTripAlerts] = useState(true);
  const [promotions, setPromotions] = useState(false);

  useEffect(() => {
    if (user) {
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
        setTripAlerts(prefs.tripAlerts ?? true);
        setPromotions(prefs.promotions ?? false);
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
        body: JSON.stringify({ phone }),
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
          tripAlerts,
          promotions,
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/dashboard/driver">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Driver Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>
              <Badge variant="outline" className="bg-gradient-hero text-primary-foreground">
                Driver Account
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
              <TabsList className="grid w-full grid-cols-3 mb-8">
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
                        <Label htmlFor="trip-alerts">Trip Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new trip assignments
                        </p>
                      </div>
                      <Switch
                        id="trip-alerts"
                        checked={tripAlerts}
                        onCheckedChange={setTripAlerts}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="promotions">Promotions & Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new features and promotions
                        </p>
                      </div>
                      <Switch
                        id="promotions"
                        checked={promotions}
                        onCheckedChange={setPromotions}
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
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DriverSettings;
