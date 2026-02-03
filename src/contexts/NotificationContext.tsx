import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  createdAt: string;
  userId: number;
  category?: "BOOKING" | "PAYMENT" | "TRIP" | "REVIEW" | "SYSTEM";
  actionUrl?: string;
  metadata?: {
    bookingId?: number;
    tripId?: number;
    vehicleId?: number;
    customerId?: number;
    driverId?: number;
    amount?: number;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "userId">) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
  createBookingNotification: (bookingId: number, userId: number, userRole: string, status: string) => Promise<void>;
  createTripNotification: (tripId: number, driverId: number, action: string) => Promise<void>;
  createPaymentNotification: (userId: number, amount: number, status: string) => Promise<void>;
  createReviewNotification: (adminId: number, reviewId: number, vehicleName: string) => Promise<void>;
  createProfileUpdateNotification: (userId: number, updateType: string) => Promise<void>;
  createSystemNotification: (userId: number, title: string, message: string, type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR") => Promise<void>;
  sendNotificationToUser: (userId: number, notification: Omit<Notification, "id" | "createdAt" | "userId">) => Promise<void>;
  createDriverAssignmentNotification: (driverId: number, bookingId: number, vehicleName: string, customerName: string) => Promise<void>;
  createVehicleStatusNotification: (adminId: number, vehicleId: number, vehicleName: string, status: string) => Promise<void>;
  createUserStatusNotification: (userId: number, status: string, reason?: string) => Promise<void>;
  createBookingReminderNotification: (userId: number, bookingId: number, vehicleName: string, pickupDate: string) => Promise<void>;
  createReturnReminderNotification: (userId: number, bookingId: number, vehicleName: string, returnDate: string) => Promise<void>;
  createLateReturnNotification: (userId: number, bookingId: number, vehicleName: string, lateFee: number) => Promise<void>;
  createRefundNotification: (userId: number, amount: number, bookingId: number) => Promise<void>;
  createMaintenanceNotification: (adminId: number, vehicleId: number, vehicleName: string, issue: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!user?.id) {
      console.log("Cannot fetch notifications: user not authenticated");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Cannot fetch notifications: no token found");
        return;
      }

      const response = await fetch(`http://localhost:8090/api/notifications/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Notifications fetched:", data.length, "notifications");
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch notifications:", response.status, response.statusText);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  // Add new notification
  const addNotification = async (notification: Omit<Notification, "id" | "createdAt" | "userId">) => {
    if (!user?.id) {
      console.log("Cannot add notification: user not authenticated");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Cannot add notification: no token found");
        return;
      }
      
      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...notification,
          userId: user.id,
        }),
      });

      if (response.ok) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  // Create booking notification based on user role
  const createBookingNotification = async (bookingId: number, userId: number, userRole: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      
      let title = "";
      let message = "";
      let type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO";
      let category: "BOOKING" | "PAYMENT" | "TRIP" | "REVIEW" | "SYSTEM" = "BOOKING";

      // User notifications
      if (userRole === "USER") {
        if (status === "CONFIRMED") {
          title = "Booking Confirmed";
          message = "Your booking has been confirmed successfully!";
          type = "SUCCESS";
        } else if (status === "PENDING") {
          title = "Booking Pending";
          message = "Your booking request has been submitted and is pending approval.";
          type = "INFO";
        } else if (status === "CANCELLED") {
          title = "Booking Cancelled";
          message = "Your booking has been cancelled.";
          type = "WARNING";
        } else if (status === "COMPLETED") {
          title = "Trip Completed";
          message = "Your trip has been completed. Please leave a review!";
          type = "SUCCESS";
        }
      }
      
      // Admin notifications
      else if (userRole === "ADMIN") {
        if (status === "PENDING") {
          title = "New Booking Request";
          message = `A new booking request #${bookingId} has been received.`;
          type = "INFO";
        } else if (status === "CONFIRMED") {
          title = "Booking Confirmed";
          message = `Booking #${bookingId} has been confirmed.`;
          type = "SUCCESS";
        } else if (status === "CANCELLED") {
          title = "Booking Cancelled";
          message = `Booking #${bookingId} has been cancelled.`;
          type = "WARNING";
        }
      }

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          type,
          category,
          userId,
          isRead: false,
          metadata: { bookingId },
          actionUrl: userRole === "ADMIN" ? `/dashboard/admin` : `/dashboard/user`,
        }),
      });

      if (response.ok && user?.id === userId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating booking notification:", error);
    }
  };

  // Create trip notification for driver
  const createTripNotification = async (tripId: number, driverId: number, action: string) => {
    try {
      const token = localStorage.getItem("token");
      
      let title = "";
      let message = "";
      let type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO";

      if (action === "ASSIGNED") {
        title = "New Trip Assigned";
        message = `You have been assigned to a new trip #${tripId}.`;
        type = "INFO";
      } else if (action === "STARTED") {
        title = "Trip Started";
        message = `Trip #${tripId} has started.`;
        type = "SUCCESS";
      } else if (action === "COMPLETED") {
        title = "Trip Completed";
        message = `Trip #${tripId} has been completed successfully.`;
        type = "SUCCESS";
      } else if (action === "CANCELLED") {
        title = "Trip Cancelled";
        message = `Trip #${tripId} has been cancelled.`;
        type = "WARNING";
      }

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          type,
          category: "TRIP",
          userId: driverId,
          isRead: false,
          metadata: { tripId },
          actionUrl: `/dashboard/driver`,
        }),
      });

      if (response.ok && user?.id === driverId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating trip notification:", error);
    }
  };

  // Create payment notification
  const createPaymentNotification = async (userId: number, amount: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      
      let title = "";
      let message = "";
      let type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO";

      if (status === "SUCCESS") {
        title = "Payment Received";
        message = `Payment of $${amount.toFixed(2)} has been successfully processed.`;
        type = "SUCCESS";
      } else if (status === "PENDING") {
        title = "Payment Pending";
        message = `Your payment of $${amount.toFixed(2)} is being processed.`;
        type = "INFO";
      } else if (status === "FAILED") {
        title = "Payment Failed";
        message = `Payment of $${amount.toFixed(2)} has failed. Please try again.`;
        type = "ERROR";
      }

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          type,
          category: "PAYMENT",
          userId,
          isRead: false,
          metadata: { amount },
          actionUrl: `/dashboard/user`,
        }),
      });

      if (response.ok && user?.id === userId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating payment notification:", error);
    }
  };

  // Create review notification for admin
  const createReviewNotification = async (adminId: number, reviewId: number, vehicleName: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "New Review Submitted",
          message: `A new review has been submitted for ${vehicleName}.`,
          type: "INFO",
          category: "REVIEW",
          userId: adminId,
          isRead: false,
          metadata: { reviewId: reviewId },
          actionUrl: `/dashboard/admin`,
        }),
      });

      if (response.ok && user?.id === adminId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating review notification:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: number) => {
    if (!user?.id) {
      console.log("Cannot mark notification as read: user not authenticated");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8090/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8090/api/notifications/user/${user.id}/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: number) => {
    if (!user?.id) {
      console.log("Cannot delete notification: user not authenticated");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8090/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!user?.id) {
      console.log("Cannot clear notifications: user not authenticated");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8090/api/notifications/user/${user.id}/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Create profile update notification
  const createProfileUpdateNotification = async (userId: number, updateType: string) => {
    try {
      const token = localStorage.getItem("token");
      
      let message = "";
      let type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "SUCCESS";
      
      switch (updateType) {
        case "PASSWORD":
          message = "Your password has been successfully updated. If you didn't make this change, please contact support immediately.";
          break;
        case "PROFILE":
          message = "Your profile information has been updated successfully.";
          break;
        case "EMAIL":
          message = "Your email address has been updated. Please verify your new email.";
          type = "INFO";
          break;
        case "PHONE":
          message = "Your phone number has been updated successfully.";
          break;
        default:
          message = "Your account settings have been updated.";
      }

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Account Updated",
          message,
          type,
          category: "SYSTEM",
          userId,
          isRead: false,
        }),
      });

      if (response.ok && user?.id === userId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating profile update notification:", error);
    }
  };

  // Create custom system notification
  const createSystemNotification = async (
    userId: number,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO"
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          type,
          category: "SYSTEM",
          userId,
          isRead: false,
        }),
      });

      if (response.ok && user?.id === userId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating system notification:", error);
    }
  };

  // Send notification to any user (for admin/driver actions)
  const sendNotificationToUser = async (
    userId: number,
    notification: Omit<Notification, "id" | "createdAt" | "userId">
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...notification,
          userId,
          isRead: false,
        }),
      });

      if (response.ok) {
        console.log(`Notification sent to user ${userId}`);
      }
    } catch (error) {
      console.error("Error sending notification to user:", error);
    }
  };

  // Create driver assignment notification
  const createDriverAssignmentNotification = async (driverId: number, bookingId: number, vehicleName: string, customerName: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "New Trip Assignment 🚗",
          message: `You have been assigned to deliver ${vehicleName} to ${customerName}. Check your dashboard for pickup details.`,
          type: "INFO",
          category: "TRIP",
          userId: driverId,
          isRead: false,
          metadata: { bookingId, vehicleName },
          actionUrl: `/dashboard/driver`,
        }),
      });

      if (response.ok && user?.id === driverId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating driver assignment notification:", error);
    }
  };

  // Create vehicle status notification for admin
  const createVehicleStatusNotification = async (adminId: number, vehicleId: number, vehicleName: string, status: string) => {
    try {
      const token = localStorage.getItem("token");

      let title = "";
      let message = "";
      let type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO";

      if (status === "AVAILABLE") {
        title = "Vehicle Available";
        message = `${vehicleName} is now available for booking.`;
        type = "SUCCESS";
      } else if (status === "MAINTENANCE") {
        title = "Vehicle Under Maintenance";
        message = `${vehicleName} has been marked for maintenance.`;
        type = "WARNING";
      } else if (status === "UNAVAILABLE") {
        title = "Vehicle Unavailable";
        message = `${vehicleName} is currently unavailable.`;
        type = "WARNING";
      }

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          type,
          category: "SYSTEM",
          userId: adminId,
          isRead: false,
          metadata: { vehicleId },
          actionUrl: `/dashboard/admin`,
        }),
      });

      if (response.ok && user?.id === adminId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating vehicle status notification:", error);
    }
  };

  // Create user status notification
  const createUserStatusNotification = async (userId: number, status: string, reason?: string) => {
    try {
      const token = localStorage.getItem("token");

      let title = "";
      let message = "";
      let type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO";

      if (status === "ACTIVE") {
        title = "Account Activated ✅";
        message = "Your account has been activated. You can now access all features.";
        type = "SUCCESS";
      } else if (status === "SUSPENDED") {
        title = "Account Suspended ⚠️";
        message = reason || "Your account has been temporarily suspended. Please contact support for more information.";
        type = "ERROR";
      } else if (status === "INACTIVE") {
        title = "Account Deactivated";
        message = "Your account has been deactivated. Please contact support to reactivate.";
        type = "WARNING";
      }

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          type,
          category: "SYSTEM",
          userId,
          isRead: false,
          actionUrl: `/contact`,
        }),
      });

      if (response.ok && user?.id === userId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating user status notification:", error);
    }
  };

  // Create booking reminder notification
  const createBookingReminderNotification = async (userId: number, bookingId: number, vehicleName: string, pickupDate: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Booking Reminder 📅",
          message: `Your booking for ${vehicleName} is scheduled for ${new Date(pickupDate).toLocaleDateString()}. Get ready for your trip!`,
          type: "INFO",
          category: "BOOKING",
          userId,
          isRead: false,
          metadata: { bookingId },
          actionUrl: `/dashboard/user`,
        }),
      });

      if (response.ok && user?.id === userId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating booking reminder notification:", error);
    }
  };

  // Create return reminder notification
  const createReturnReminderNotification = async (userId: number, bookingId: number, vehicleName: string, returnDate: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Vehicle Return Reminder 🔔",
          message: `Please remember to return ${vehicleName} by ${new Date(returnDate).toLocaleDateString()}. Late returns may incur additional charges.`,
          type: "WARNING",
          category: "BOOKING",
          userId,
          isRead: false,
          metadata: { bookingId },
          actionUrl: `/dashboard/user`,
        }),
      });

      if (response.ok && user?.id === userId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating return reminder notification:", error);
    }
  };

  // Create late return notification
  const createLateReturnNotification = async (userId: number, bookingId: number, vehicleName: string, lateFee: number) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Late Return Fee Applied ⚠️",
          message: `${vehicleName} was returned late. A late fee of $${lateFee.toFixed(2)} has been applied to your account.`,
          type: "WARNING",
          category: "PAYMENT",
          userId,
          isRead: false,
          metadata: { bookingId, amount: lateFee },
          actionUrl: `/dashboard/user`,
        }),
      });

      if (response.ok && user?.id === userId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating late return notification:", error);
    }
  };

  // Create refund notification
  const createRefundNotification = async (userId: number, amount: number, bookingId: number) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Refund Processed 💰",
          message: `A refund of $${amount.toFixed(2)} has been processed for booking #${bookingId}. It should appear in your account within 5-7 business days.`,
          type: "SUCCESS",
          category: "PAYMENT",
          userId,
          isRead: false,
          metadata: { bookingId, amount },
          actionUrl: `/dashboard/user`,
        }),
      });

      if (response.ok && user?.id === userId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating refund notification:", error);
    }
  };

  // Create maintenance notification for admin
  const createMaintenanceNotification = async (adminId: number, vehicleId: number, vehicleName: string, issue: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Vehicle Maintenance Required 🔧",
          message: `${vehicleName} requires maintenance attention: ${issue}`,
          type: "WARNING",
          category: "SYSTEM",
          userId: adminId,
          isRead: false,
          metadata: { vehicleId },
          actionUrl: `/dashboard/admin`,
        }),
      });

      if (response.ok && user?.id === adminId) {
        const newNotification = await response.json();
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error("Error creating maintenance notification:", error);
    }
  };

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        fetchNotifications,
        createBookingNotification,
        createTripNotification,
        createPaymentNotification,
        createReviewNotification,
        createProfileUpdateNotification,
        createSystemNotification,
        sendNotificationToUser,
        createDriverAssignmentNotification,
        createVehicleStatusNotification,
        createUserStatusNotification,
        createBookingReminderNotification,
        createReturnReminderNotification,
        createLateReturnNotification,
        createRefundNotification,
        createMaintenanceNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
