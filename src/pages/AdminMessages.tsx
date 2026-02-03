import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  RefreshCw,
  MessageCircle,
  UserCircle,
  Shield,
  Send,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'RESOLVED' | 'ARCHIVED';
  createdAt: string;
  repliedAt?: string;
  adminReply?: string;
  replies?: MessageReply[];
}

interface MessageReply {
  id: number;
  replyText: string;
  senderType: 'ADMIN' | 'USER';
  senderName: string;
  senderEmail: string;
  createdAt: string;
  isRead: boolean;
}

const AdminMessages = () => {
  const [loading, setLoading] = useState(true);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
  const [sendingReply, setSendingReply] = useState<number | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const { user, token, handleUnauthorized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadContactMessages();
  }, []);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const loadContactMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8090/api/contact", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403 || response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.ok) {
        const messages = await response.json();
        
        const messagesWithReplies = await Promise.all(
          messages.map(async (message: any) => {
            try {
              const repliesResponse = await fetch(
                `http://localhost:8090/api/contact/${message.id}/replies`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
              if (repliesResponse.ok) {
                const replies = await repliesResponse.json();
                return { ...message, replies };
              } else {
                return { ...message, replies: [] };
              }
            } catch (error) {
              console.error(`Error loading replies for message ${message.id}:`, error);
              return { ...message, replies: [] };
            }
          })
        );
        
        setContactMessages(messagesWithReplies);
      } else {
        toast.error("Failed to load messages");
      }
    } catch (error) {
      console.error("Error loading contact messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (messageId: number) => {
    const replyText = replyInputs[messageId]?.trim();
    if (!replyText) {
      toast.error("Please enter a reply message");
      return;
    }

    setSendingReply(messageId);

    try {
      const response = await fetch(`http://localhost:8090/api/contact/${messageId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          replyText,
          senderName: user?.name || "Admin",
          senderEmail: user?.email || "admin@drivenow.com",
        }),
      });

      if (response.ok) {
        toast.success("Reply sent successfully");
        setReplyInputs(prev => ({ ...prev, [messageId]: "" }));
        loadContactMessages();
      } else {
        toast.error("Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("An error occurred while sending the reply");
    } finally {
      setSendingReply(null);
    }
  };

  const toggleMessageExpansion = (messageId: number) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`http://localhost:8090/api/contact/${messageId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "READ" }),
      });

      if (response.ok) {
        toast.success("Message marked as read");
        loadContactMessages();
      } else {
        toast.error("Failed to mark message as read");
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Failed to mark message as read");
    }
  };

  const handleMarkAsUnread = async (messageId: number) => {
    try {
      const response = await fetch(`http://localhost:8090/api/contact/${messageId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "NEW" }),
      });

      if (response.ok) {
        toast.success("Message marked as unread");
        loadContactMessages();
      } else {
        toast.error("Failed to mark message as unread");
      }
    } catch (error) {
      console.error("Error marking message as unread:", error);
      toast.error("Failed to mark message as unread");
    }
  };

  const handleArchiveMessage = async (messageId: number) => {
    try {
      const response = await fetch(`http://localhost:8090/api/contact/${messageId}/archive`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Message archived");
        loadContactMessages();
      }
    } catch (error) {
      console.error("Error archiving message:", error);
      toast.error("Failed to archive message");
    }
  };

  const handleResolveMessage = async (messageId: number) => {
    try {
      const response = await fetch(`http://localhost:8090/api/contact/${messageId}/resolve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Message resolved and closed");
        loadContactMessages();
      } else {
        toast.error("Failed to resolve message");
      }
    } catch (error) {
      console.error("Error resolving message:", error);
      toast.error("Failed to resolve message");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard/admin")}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Contact Messages & Support</h1>
                <p className="text-muted-foreground">View and respond to customer messages</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadContactMessages}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-xl">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Messages</p>
                    <p className="text-3xl font-bold">{contactMessages.length}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-500 text-lg px-4 py-2">
                    {contactMessages.filter(m => m.status === 'NEW').length} New
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-lg px-4 py-2">
                    {contactMessages.filter(m => m.status === 'REPLIED').length} Replied
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-lg px-4 py-2">
                    {contactMessages.filter(m => m.status === 'RESOLVED').length} Resolved
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Messages List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {contactMessages.length > 0 ? (
              <div className="space-y-4">
                {contactMessages
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((message) => {
                    const isExpanded = expandedMessages.has(message.id);
                    const hasReplies = message.replies && message.replies.length > 0;
                    const replyCount = message.replies?.length || 0;
                    const isUnread = message.status === 'NEW';

                    return (
                      <Card key={message.id} className={`p-4 border-l-4 relative ${
                        message.status === 'NEW' ? 'border-l-blue-500 bg-blue-50/30' :
                        message.status === 'REPLIED' ? 'border-l-green-500 bg-green-50/30' :
                        message.status === 'RESOLVED' ? 'border-l-gray-400 bg-gray-50/30 opacity-75' :
                        'border-l-gray-300'
                      }`}>
                        {isUnread && (
                          <div className="absolute top-2 right-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" title="Unread message" />
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold text-lg ${isUnread ? 'text-blue-600' : ''}`}>{message.subject}</h4>
                              {hasReplies && (
                                <Badge variant="outline" className="bg-green-100 text-green-700">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              From: <span className="font-medium">{message.name}</span> ({message.email})
                              {message.phone && ` • ${message.phone}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                message.status === 'NEW' ? 'default' :
                                message.status === 'READ' ? 'secondary' :
                                message.status === 'REPLIED' ? 'outline' : 
                                message.status === 'RESOLVED' ? 'secondary' : 'secondary'
                              }
                              className={
                                message.status === 'NEW' ? 'bg-blue-500 animate-pulse' :
                                message.status === 'REPLIED' ? 'bg-green-500 text-white' :
                                message.status === 'RESOLVED' ? 'bg-gray-500 text-white' : ''
                              }
                            >
                              {message.status === 'NEW' ? '● NEW' : message.status}
                            </Badge>
                            {message.status === 'NEW' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsRead(message.id)}
                                className="text-xs"
                                title="Mark as read"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            {message.status === 'READ' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsUnread(message.id)}
                                className="text-xs"
                                title="Mark as unread"
                              >
                                <EyeOff className="h-3 w-3 mr-1" />
                                Mark Unread
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMessageExpansion(message.id)}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {isExpanded && (
                          <>
                            <div className="relative mb-3 max-h-[500px] flex flex-col border rounded-lg">
                              <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-3 rounded-t-lg flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                  <MessageCircle className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm">{message.subject}</h4>
                                  <p className="text-xs opacity-90">Conversation with {message.name}</p>
                                </div>
                              </div>

                              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-3 max-h-[400px]">
                                <div className="flex justify-start">
                                  <div className="max-w-[75%]">
                                    <div className="flex items-center gap-2 mb-1 px-2">
                                      <UserCircle className="h-3 w-3 text-gray-600" />
                                      <span className="text-xs font-medium text-gray-600">{message.name}</span>
                                    </div>
                                    <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm">
                                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                                      <div className="flex items-center justify-start gap-1 mt-1">
                                        <span className="text-[10px] text-gray-500">
                                          {formatRelativeTime(message.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {message.replies && message.replies.map((reply) => {
                                  const isAdmin = reply.senderType === 'ADMIN';
                                  return (
                                    <div key={reply.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                      <div className="max-w-[75%]">
                                        <div className={`flex items-center gap-2 mb-1 px-2 ${isAdmin ? 'justify-end' : ''}`}>
                                          {!isAdmin && <UserCircle className="h-3 w-3 text-gray-600" />}
                                          <span className="text-xs font-medium text-gray-600">
                                            {isAdmin ? 'You (Admin)' : reply.senderName}
                                          </span>
                                          {isAdmin && <Shield className="h-3 w-3 text-primary" />}
                                        </div>
                                        <div className={`${
                                          isAdmin
                                            ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'
                                        } px-4 py-2 shadow-sm`}>
                                          <p className="text-sm whitespace-pre-wrap break-words">{reply.replyText}</p>
                                          <div className={`flex items-center ${isAdmin ? 'justify-end' : 'justify-start'} gap-1 mt-1`}>
                                            <span className={`text-[10px] ${isAdmin ? 'text-white/70' : 'text-gray-500'}`}>
                                              {formatRelativeTime(reply.createdAt)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                {(!message.replies || message.replies.length === 0) && (
                                  <div className="flex justify-center py-6">
                                    <div className="text-center text-gray-400">
                                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p className="text-sm">No replies yet. Send a reply below to start the conversation.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-3">
                              {message.status === 'RESOLVED' ? (
                                <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-center">
                                  <p className="text-sm text-gray-600 font-medium">✓ This conversation has been resolved and closed</p>
                                  <p className="text-xs text-gray-500 mt-1">No more replies can be sent</p>
                                </div>
                              ) : (
                                <div className="flex gap-2 items-end bg-white rounded-lg shadow-sm border px-4 py-3">
                                  <Textarea
                                    placeholder="Type your response..."
                                    value={replyInputs[message.id] || ''}
                                    onChange={(e) => setReplyInputs(prev => ({
                                      ...prev,
                                      [message.id]: e.target.value
                                    }))}
                                    disabled={sendingReply === message.id}
                                    className="flex-1 min-h-[80px]"
                                  />
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      onClick={() => handleSendReply(message.id)}
                                      disabled={!replyInputs[message.id]?.trim() || sendingReply === message.id}
                                      size="sm"
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      {sendingReply === message.id ? (
                                        <>
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        </>
                                      ) : (
                                        <>
                                          <Send className="h-4 w-4 mr-2" />
                                          Send
                                        </>
                                      )}
                                    </Button>
                                    {message.status === 'NEW' && (
                                      <Button
                                        onClick={() => handleMarkAsRead(message.id)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        Mark Read
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 mt-3 pt-3 border-t">
                              {message.status !== 'RESOLVED' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleResolveMessage(message.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  ✓ Resolve & Close
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleArchiveMessage(message.id)}
                              >
                                Archive
                              </Button>
                            </div>
                          </>
                        )}
                      </Card>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Card className="p-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminMessages;
