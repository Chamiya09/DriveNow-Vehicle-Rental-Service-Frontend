import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Eye,
  EyeOff,
  User,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface UserSettings {
  id?: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  promotionalEmails: boolean;
  bookingReminders: boolean;
  vehicleAvailabilityAlerts: boolean;
  showBookingHistory: boolean;
  autoRenewBookings: boolean;
  preferredPickupTime: string;
  theme: string;
}

const UserSettings = () => {
  const { user, token } = useAuth();
  const { theme: contextTheme, setTheme: setContextTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: false,
    bookingReminders: true,
    vehicleAvailabilityAlerts: false,
    showBookingHistory: false,
    autoRenewBookings: false,
    preferredPickupTime: "09:00",
    theme: "light"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/users/${user?.id}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8090/api/users/${user?.id}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(`http://localhost:8090/api/users/${user?.id}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const error = await response.text();
        toast.error(error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Sync theme with ThemeContext
    if (key === "theme") {
      setContextTheme(value as "light" | "dark" | "system");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Notifications Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive booking confirmations and updates via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get important booking updates via text message
              </p>
            </div>
            <Switch
              id="sms-notifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="booking-reminders">Booking Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders 24h before your pickup time
              </p>
            </div>
            <Switch
              id="booking-reminders"
              checked={settings.bookingReminders}
              onCheckedChange={(checked) => updateSetting("bookingReminders", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="vehicle-alerts">Vehicle Availability Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Notify me when my favorite vehicles become available
              </p>
            </div>
            <Switch
              id="vehicle-alerts"
              checked={settings.vehicleAvailabilityAlerts}
              onCheckedChange={(checked) => updateSetting("vehicleAvailabilityAlerts", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="promotional-emails">Promotional Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive special offers and rental deals
              </p>
            </div>
            <Switch
              id="promotional-emails"
              checked={settings.promotionalEmails}
              onCheckedChange={(checked) => updateSetting("promotionalEmails", checked)}
            />
          </div>
        </div>
      </Card>

      {/* Rental Preferences Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Rental Preferences</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="booking-history">Show Booking History</Label>
              <p className="text-sm text-muted-foreground">
                Display your past rentals on your profile
              </p>
            </div>
            <Switch
              id="booking-history"
              checked={settings.showBookingHistory}
              onCheckedChange={(checked) => updateSetting("showBookingHistory", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-renew">Auto-Renew Bookings</Label>
              <p className="text-sm text-muted-foreground">
                Automatically suggest renewal for frequent rentals
              </p>
            </div>
            <Switch
              id="auto-renew"
              checked={settings.autoRenewBookings}
              onCheckedChange={(checked) => updateSetting("autoRenewBookings", checked)}
            />
          </div>
          <div>
            <Label htmlFor="pickup-time">Preferred Pickup Time</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Default pickup time for your bookings
            </p>
            <Input
              id="pickup-time"
              type="time"
              value={settings.preferredPickupTime}
              onChange={(e) => updateSetting("preferredPickupTime", e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Change Password</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button 
            onClick={handleChangePassword} 
            disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="w-full"
          >
            {changingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </Card>

      {/* Appearance Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Appearance</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Theme</Label>
            <div className="flex gap-2 mt-2">
              <Button 
                variant={settings.theme === "light" ? "default" : "outline"}
                onClick={() => updateSetting("theme", "light")}
              >
                Light
              </Button>
              <Button 
                variant={settings.theme === "dark" ? "default" : "outline"}
                onClick={() => updateSetting("theme", "dark")}
              >
                Dark
              </Button>
              <Button 
                variant={settings.theme === "system" ? "default" : "outline"}
                onClick={() => updateSetting("theme", "system")}
              >
                System
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserSettings;
