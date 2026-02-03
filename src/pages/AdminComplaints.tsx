import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface Complaint {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  complaintText: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  closedAt?: string;
  closedBy?: string;
  unreadCount: number;
  replies?: ComplaintReply[];
}

interface ComplaintReply {
  id: number;
  replyText: string;
  senderType: 'ADMIN' | 'USER';
  senderName: string;
  senderEmail: string;
  createdAt: string;
  isRead: boolean;
}

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const navigate = useNavigate();

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
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  Customer Complaints
                </h1>
                <p className="text-muted-foreground">Manage and resolve customer complaints</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
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
                  <div className="bg-gradient-to-br from-red-500 to-orange-500 p-4 rounded-xl">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Complaints</p>
                    <p className="text-3xl font-bold">{complaints.length}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    {complaints.filter(c => c.status === 'OPEN').length} Open
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-lg px-4 py-2">
                    {complaints.filter(c => c.status === 'CLOSED').length} Closed
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Complaints Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {complaints.length > 0 ? (
              <Card className="p-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Complaint management coming soon...</p>
                </div>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Card className="p-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Complaints</h3>
                  <p className="text-muted-foreground">Great job! There are no customer complaints at the moment.</p>
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

export default AdminComplaints;
