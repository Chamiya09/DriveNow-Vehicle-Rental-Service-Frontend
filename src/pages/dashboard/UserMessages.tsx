import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Send, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  UserCircle,
  Shield,
  Mail
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MessageReply {
  id: number;
  replyText: string;
  senderType: 'ADMIN' | 'USER';
  senderName: string;
  senderEmail: string;
  createdAt: string;
  isRead: boolean;
}

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  adminReply?: string;
  replies?: MessageReply[];
}

const UserMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
  const [sendingReply, setSendingReply] = useState<number | null>(null);
  const { user, token } = useAuth();

  const unreadCount = messages.filter(m => m.status === 'NEW' || m.status === 'REPLIED').length;
  const resolvedCount = messages.filter(m => m.status === 'RESOLVED').length;

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

  useEffect(() => {
    if (token && user) {
      fetchMessages();
    } else {
      setLoading(false);
      console.warn("No authentication token found. User might not be logged in.");
    }
  }, [token, user]);

  const fetchMessages = async () => {
    if (!token) {
      toast.error("Please log in to view your messages");
      setLoading(false);
      return;
    }

    if (!user?.email) {
      toast.error("User email not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8090/api/contact/user/${encodeURIComponent(user.email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Load replies for each message
        const messagesWithReplies = await Promise.all(
          data.map(async (message: any) => {
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
        
        setMessages(messagesWithReplies);
      } else if (response.status === 403) {
        console.error("Access forbidden. Token might be invalid or expired, or user lacks permissions.");
        toast.error("Access denied. Please log in again.");
      } else if (response.status === 401) {
        console.error("Unauthorized. Token might be invalid or expired.");
        toast.error("Your session has expired. Please log in again.");
      } else {
        console.error(`Error fetching messages: ${response.status} ${response.statusText}`);
        toast.error("Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
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
          senderName: user?.name || "User",
          senderEmail: user?.email || "",
        }),
      });

      if (response.ok) {
        toast.success("Reply sent successfully");
        setReplyInputs(prev => ({ ...prev, [messageId]: "" }));
        fetchMessages();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messages & Support</h2>
          <p className="text-muted-foreground">View your message conversations with support</p>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-xl">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-3xl font-bold">{messages.length}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-blue-500 text-lg px-4 py-2">
              {unreadCount} Active
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-lg px-4 py-2">
              {resolvedCount} Resolved
            </Badge>
          </div>
        </div>
      </Card>

      {messages.length > 0 ? (
        <div className="space-y-4">
          {messages
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
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
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
                          message.status === 'NEW' ? 'bg-blue-500 text-white' :
                          message.status === 'REPLIED' ? 'bg-green-500 text-white' :
                          message.status === 'RESOLVED' ? 'bg-gray-500 text-white' : ''
                        }
                      >
                        {message.status === 'NEW' ? '● NEW' : message.status}
                      </Badge>
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
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{message.subject}</h4>
                            <p className="text-xs opacity-90">Support Conversation</p>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-3 max-h-[400px]">
                          {/* Original Message */}
                          <div className="flex justify-end">
                            <div className="max-w-[75%]">
                              <div className="flex items-center gap-2 mb-1 px-2 justify-end">
                                <span className="text-xs font-medium text-gray-600">You</span>
                                <UserCircle className="h-3 w-3 text-gray-600" />
                              </div>
                              <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm">
                                <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <span className="text-[10px] text-white/80">
                                    {formatRelativeTime(message.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Replies */}
                          {message.replies && message.replies.length > 0 && (
                            <>
                              {message.replies
                                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                .map((reply) => (
                                  <div
                                    key={reply.id}
                                    className={`flex ${reply.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div className="max-w-[75%]">
                                      <div className={`flex items-center gap-2 mb-1 px-2 ${reply.senderType === 'USER' ? 'justify-end' : ''}`}>
                                        {reply.senderType === 'ADMIN' && <Shield className="h-3 w-3 text-blue-600" />}
                                        <span className="text-xs font-medium text-gray-600">
                                          {reply.senderType === 'ADMIN' ? 'Support Team' : 'You'}
                                        </span>
                                        {reply.senderType === 'USER' && <UserCircle className="h-3 w-3 text-gray-600" />}
                                      </div>
                                      <div className={`px-4 py-2 rounded-2xl shadow-sm ${
                                        reply.senderType === 'USER'
                                          ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-sm'
                                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                                      }`}>
                                        <p className="text-sm whitespace-pre-wrap break-words">{reply.replyText}</p>
                                        <div className={`flex items-center gap-1 mt-1 ${reply.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                          <span className={`text-[10px] ${reply.senderType === 'USER' ? 'text-white/80' : 'text-gray-500'}`}>
                                            {formatRelativeTime(reply.createdAt)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </>
                          )}
                        </div>

                        {/* Reply Input */}
                        <div className="border-t bg-white p-4 rounded-b-lg">
                          {message.status === 'RESOLVED' ? (
                            <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-center">
                              <p className="text-sm text-gray-600 font-medium">✓ This conversation has been resolved and closed</p>
                              <p className="text-xs text-gray-500 mt-1">The admin has marked this issue as resolved</p>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Type your reply..."
                                value={replyInputs[message.id] || ""}
                                onChange={(e) =>
                                  setReplyInputs(prev => ({ ...prev, [message.id]: e.target.value }))
                                }
                                className="min-h-[60px] resize-none"
                                disabled={sendingReply === message.id}
                              />
                              <Button
                                onClick={() => handleSendReply(message.id)}
                                disabled={sendingReply === message.id || !replyInputs[message.id]?.trim()}
                                className="self-end"
                              >
                                {sendingReply === message.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Messages</h3>
          <p className="text-muted-foreground">
            You haven't sent any messages yet. Contact support if you need help.
          </p>
        </Card>
      )}
    </div>
  );
};

export default UserMessages;
