import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, BookOpen, Users, School, 
  FileText, Image, Package, Shield, MessageSquare,
  Plus, Trash2, Flag, Download, Upload, Search,
  ChevronRight, Save, X, Edit, BarChart3, Play,
  Video, CreditCard, LogOut, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BLOG_POSTS, MOCK_SCHOOLS, 
  MOCK_FACILITATORS, GALLERY_MEDIA 
} from '../constants';
import { 
  BlogPost, BlogComment, School as SchoolType, 
  Facilitator, Document, Asset, GalleryMedia, Donor 
} from '../types';
import { db, auth, handleFirestoreError, OperationType, googleProvider } from '../firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User, signInWithPopup } from 'firebase/auth';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this item? This action cannot be undone." 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title?: string, 
  message?: string 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
            <p className="text-slate-600 mb-8">{message}</p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface AdminPortalProps {
  galleryMedia: GalleryMedia[];
  setGalleryMedia: React.Dispatch<React.SetStateAction<GalleryMedia[]>>;
}

const AdminPortal = ({ galleryMedia, setGalleryMedia }: AdminPortalProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check if user is admin in Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          
          // Default admin check based on email (matching firestore.rules)
          const isDefaultAdmin = currentUser.email?.toLowerCase() === "hogiugo@gmail.com" || 
                               currentUser.email?.toLowerCase() === "gigaactiv@gmail.com";
          
          const isAdminUser = userData?.role === 'admin' || isDefaultAdmin;
          setIsAdmin(isAdminUser);

          // Sync backend token if missing
          if (isAdminUser && !localStorage.getItem('token') && currentUser.email) {
            try {
              const response = await axios.post('/api/auth/firebase-login', { email: currentUser.email });
              localStorage.setItem('token', response.data.token);
            } catch (err) {
              console.error("Failed to sync backend token:", err);
            }
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      // 1. Firebase Login
      await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Backend Login (to get JWT for stats)
      try {
        const response = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
      } catch (err) {
        console.warn("Backend login failed, admin stats might not load", err);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message || "Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      if (email) {
        try {
          const response = await axios.post('/api/auth/firebase-login', { email });
          localStorage.setItem('token', response.data.token);
        } catch (err) {
          console.warn("Backend login failed for Google user", err);
        }
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      setAuthError(error.message || "Google sign-in failed");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-primary" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Admin Access</h2>
          <p className="text-slate-600 mb-8">
            {isAdmin === false 
              ? "You do not have administrative privileges. Please contact the foundation if you believe this is an error."
              : "Please sign in with your foundation administrator account to access the portal."}
          </p>
          
          {!user ? (
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="admin@okpodufoundation.org"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {authError && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                  {authError}
                </p>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
              >
                Sign In
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
              </button>
            </form>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Sign Out
            </button>
          )}
        </motion.div>
      </div>
    );
  }
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'donors', label: 'Donors', icon: CreditCard },
    { id: 'blog', label: 'Blog & Comments', icon: BookOpen },
    { id: 'schools', label: 'School Database', icon: School },
    { id: 'facilitators', label: 'Facilitators', icon: Users },
    { id: 'documents', label: 'Document Library', icon: FileText },
    { id: 'reports', label: 'Impact Reports', icon: BarChart3 },
    { id: 'gallery', label: 'Media Archive', icon: Image },
    { id: 'assets', label: 'Asset Inventory', icon: Package },
    { id: 'governance', label: 'Governance', icon: Shield },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 pt-20">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-primary">Admin Portal</h2>
          <p className="text-xs text-slate-400">Okpodu Foundation</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 capitalize">{activeTab.replace('_', ' ')}</h1>
            <p className="text-slate-500">Manage your foundation's operations and content.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Download size={16} /> Export Data
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover shadow-md">
              <Plus size={16} /> Add New
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'applications' && <ApplicationsManagement />}
          {activeTab === 'donors' && <DonorsManagement />}
          {activeTab === 'blog' && <BlogManagement />}
          {activeTab === 'schools' && <SchoolDatabase />}
          {activeTab === 'facilitators' && <FacilitatorDatabase />}
          {activeTab === 'documents' && <DocumentLibrary />}
          {activeTab === 'reports' && <ImpactReports />}
          {activeTab === 'gallery' && <PhotoArchive images={galleryMedia} setImages={setGalleryMedia} />}
          {activeTab === 'assets' && <AssetInventory />}
          {activeTab === 'governance' && <GovernanceTools />}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePrograms: 4,
    totalDonations: 0,
    pendingApps: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn("No admin token found, skipping stats fetch");
          return;
        }
        const response = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(prev => ({
          ...prev,
          totalUsers: response.data.totalUsers,
          totalDonations: response.data.totalDonations,
          pendingApps: response.data.pendingApplications
        }));
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.error("Unauthorized: Admin token may be invalid or expired");
        } else {
          console.error("Failed to fetch admin stats:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Unified Activity Feed (Keeping Firestore for now as it's already there)
    const unsubActivity = onSnapshot(query(collection(db, 'applications'), orderBy('createdAt', 'desc')), (snapshot) => {
      const newActivities = snapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        type: 'application',
        text: `New application from ${doc.data().userId.substring(0, 8)}...`,
        time: doc.data().createdAt?.toDate() || new Date()
      }));
      setActivities(newActivities);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
    });

    return () => {
      unsubActivity();
    };
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Programs', value: stats.activePrograms.toString(), icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Donations', value: `₦${stats.totalDonations.toLocaleString()}`, icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending Applications', value: stats.pendingApps.toString(), icon: FileText, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-4`}>
              <card.icon size={24} />
            </div>
            <p className="text-sm text-slate-500 font-medium">{card.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl border border-slate-100 bg-white">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Plus size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.text}</p>
                  <p className="text-xs text-slate-500">{activity.time.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
        <div className="p-6 rounded-3xl border border-slate-100 bg-white">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:border-primary transition-all group">
              <Plus size={20} className="text-slate-400 group-hover:text-primary mb-2" />
              <p className="text-sm font-bold text-slate-900">New Blog Post</p>
            </button>
            <button className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:border-primary transition-all group">
              <Upload size={20} className="text-slate-400 group-hover:text-primary mb-2" />
              <p className="text-sm font-bold text-slate-900">Upload Media</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
    });
    return unsubscribe;
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'applications', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `applications/${id}`);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="pb-3 font-semibold text-slate-500 text-sm">Applicant ID</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Age Track</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Status</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Date</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="py-4 text-sm font-medium text-slate-900 truncate max-w-[150px]">{app.userId}</td>
              <td className="py-4 text-sm text-slate-500">{app.ageTrack}</td>
              <td className="py-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  app.status === 'approved' ? 'bg-green-50 text-green-600' : 
                  app.status === 'rejected' ? 'bg-red-50 text-red-600' : 
                  'bg-yellow-50 text-yellow-600'
                }`}>
                  {app.status}
                </span>
              </td>
              <td className="py-4 text-sm text-slate-500">
                {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString() : 'N/A'}
              </td>
              <td className="py-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(app.id, 'approved')}
                    className="p-1 text-green-500 hover:bg-green-50 rounded"
                    title="Approve"
                  >
                    <Save size={16} />
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(app.id, 'rejected')}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {applications.length === 0 && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400 italic">No applications found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const DonorsManagement = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, onConfirm: () => void, title?: string, message?: string }>({
    isOpen: false,
    onConfirm: () => {},
  });

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn("No admin token found, skipping donations fetch");
          setLoading(false);
          return;
        }
        const response = await axios.get('/api/admin/donations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDonations(response.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.error("Unauthorized: Admin token may be invalid or expired");
        } else {
          console.error("Failed to fetch donations:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleDeleteDonation = (id: string) => {
    // Implement delete via API if needed, for now just UI confirmation
    setConfirmConfig({
      isOpen: true,
      title: "Delete Donation Record",
      message: "Are you sure you want to delete this donation record? This action cannot be undone.",
      onConfirm: async () => {
        // In a real app, call DELETE /api/admin/donations/:id
        setDonations(donations.filter(d => d.id !== id));
      }
    });
  };

  if (loading && donations.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Donation History</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search donations..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-4 font-semibold text-slate-600">Donor Name</th>
              <th className="pb-4 font-semibold text-slate-600">Email</th>
              <th className="pb-4 font-semibold text-slate-600">Amount</th>
              <th className="pb-4 font-semibold text-slate-600">Date</th>
              <th className="pb-4 font-semibold text-slate-600">Status</th>
              <th className="pb-4 font-semibold text-slate-600">Frequency</th>
              <th className="pb-4 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 font-medium text-slate-900">{donation.donor_name}</td>
                <td className="py-4 text-slate-600">{donation.donor_email}</td>
                <td className="py-4 text-slate-900 font-bold">₦{donation.amount.toLocaleString()}</td>
                <td className="py-4 text-slate-500">{new Date(donation.created_at).toLocaleDateString()}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    donation.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {donation.status}
                  </span>
                </td>
                <td className="py-4 text-slate-500 capitalize">{donation.frequency}</td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteDonation(donation.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, onConfirm: () => void, title?: string, message?: string }>({
    isOpen: false,
    onConfirm: () => {},
  });
  const [comments, setComments] = useState<BlogComment[]>([
    { id: '1', postId: '1', authorName: 'User123', content: 'This is offensive!', date: '2024-03-01', isFlagged: true },
    { id: '2', postId: '1', authorName: 'Jane Doe', content: 'Great article!', date: '2024-03-02', isFlagged: false },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    excerpt: '', 
    content: '',
    author: 'Admin',
    date: new Date().toISOString().split('T')[0],
    image_url: '',
    tags: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(postList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'blogs');
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (status: 'draft' | 'published') => {
    try {
      const postData = {
        title: newPost.title,
        excerpt: newPost.excerpt,
        content: newPost.content,
        author: newPost.author,
        date: newPost.date,
        image_url: newPost.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800',
        tags: newPost.tags,
        status: status,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'blogs'), postData);
      
      setShowModal(false);
      setNewPost({ 
        title: '', 
        excerpt: '', 
        content: '',
        author: 'Admin',
        date: new Date().toISOString().split('T')[0],
        image_url: '',
        tags: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'blogs');
    }
  };

  const handleDeletePost = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Blog Post",
      message: "Are you sure you want to delete this blog post? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'blogs', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `blogs/${id}`);
        }
      }
    });
  };

  const handleFlagComment = (id: string) => {
    setComments(comments.map(c => c.id === id ? { ...c, isFlagged: true } : c));
  };

  const handleDeleteComment = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Comment",
      message: "Are you sure you want to delete this comment?",
      onConfirm: () => {
        setComments(comments.filter(c => c.id !== id));
      }
    });
  };

  const handleApproveComment = (id: string) => {
    setComments(comments.map(c => c.id === id ? { ...c, isFlagged: false } : c));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Create New Blog Post</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
            </div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="Enter post title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Author</label>
                  <input 
                    type="text" 
                    value={newPost.author}
                    onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="Author name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newPost.date}
                    onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="e.g. Tech, Education, Community"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={newPost.image_url}
                  onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Excerpt</label>
                <textarea 
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 h-20" 
                  placeholder="Short summary..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                <textarea 
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 h-40" 
                  placeholder="Full post content..."
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleCreatePost('draft')}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Save Draft
                </button>
                <button 
                  onClick={() => handleCreatePost('published')}
                  className="flex-1 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all"
                >
                  Publish Post
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Blog Posts</h3>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by title or author..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="text-sm text-primary font-bold hover:underline flex items-center gap-1"
            >
              <Plus size={16} /> New Post
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 font-semibold text-slate-500 text-sm">Title</th>
                <th className="pb-3 font-semibold text-slate-500 text-sm">Author</th>
                <th className="pb-3 font-semibold text-slate-500 text-sm">Date</th>
                <th className="pb-3 font-semibold text-slate-500 text-sm">Status</th>
                <th className="pb-3 font-semibold text-slate-500 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts
                .filter(post => 
                  post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  post.author.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((post) => (
                  <tr key={post.id} className="group">
                  <td className="py-4 text-sm font-medium text-slate-900">{post.title}</td>
                  <td className="py-4 text-sm text-slate-500">{post.author}</td>
                  <td className="py-4 text-sm text-slate-500">{post.date}</td>
                  <td className="py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-slate-400 hover:text-primary"><Edit size={16} /></button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Comment Moderation</h3>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className={`p-4 rounded-2xl border ${comment.isFlagged ? 'border-red-100 bg-red-50/30' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{comment.authorName}</span>
                  <span className="text-xs text-slate-400">{comment.date}</span>
                  {comment.isFlagged && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500 text-white rounded uppercase flex items-center gap-1"><Flag size={10} /> Flagged</span>}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleApproveComment(comment.id)}
                    className="text-xs font-bold text-slate-400 hover:text-primary"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-xs font-bold text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const SchoolDatabase = () => {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, onConfirm: () => void, title?: string, message?: string }>({
    isOpen: false,
    onConfirm: () => {},
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'schools'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchools(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'schools');
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schools.map((school) => (
          <div key={school.id} className="p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-900">{school.name}</h4>
                <p className="text-sm text-slate-500">{school.location}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">{school.studentCount} Students</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 mb-1">Contact Person</p>
                <p className="font-medium text-slate-700">{school.contactPerson}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Partnership Since</p>
                <p className="font-medium text-slate-700">{school.partnershipDate}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => {
                  setConfirmConfig({
                    isOpen: true,
                    title: "Delete School",
                    message: `Are you sure you want to delete ${school.name}? This will remove it from the school database.`,
                    onConfirm: async () => {
                      try {
                        await deleteDoc(doc(db, 'schools', school.id));
                      } catch (error) {
                        handleFirestoreError(error, OperationType.DELETE, `schools/${school.id}`);
                      }
                    }
                  });
                }}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {schools.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 italic">No schools registered yet</div>
        )}
      </div>
    </div>
  );
};

const FacilitatorDatabase = () => {
  const [facilitators, setFacilitators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, onConfirm: () => void, title?: string, message?: string }>({
    isOpen: false,
    onConfirm: () => {},
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'facilitators'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFacilitators(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'facilitators');
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="overflow-x-auto">
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="pb-3 font-semibold text-slate-500 text-sm">Name</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Expertise</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Contact</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Status</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {facilitators.map((f) => (
            <tr key={f.id}>
              <td className="py-4 text-sm font-medium text-slate-900">{f.name}</td>
              <td className="py-4 text-sm text-slate-500">{f.expertise}</td>
              <td className="py-4">
                <p className="text-xs text-slate-500">{f.email}</p>
                <p className="text-xs text-slate-500">{f.phone}</p>
              </td>
              <td className="py-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${f.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>{f.status}</span>
              </td>
              <td className="py-4">
                <button 
                  onClick={() => {
                    setConfirmConfig({
                      isOpen: true,
                      title: "Delete Facilitator",
                      message: `Are you sure you want to delete ${f.name}?`,
                      onConfirm: async () => {
                        try {
                          await deleteDoc(doc(db, 'facilitators', f.id));
                        } catch (error) {
                          handleFirestoreError(error, OperationType.DELETE, `facilitators/${f.id}`);
                        }
                      }
                    });
                  }}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {facilitators.length === 0 && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400 italic">No facilitators found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const DocumentLibrary = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', type: 'Policy', file: null as File | null });
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, onConfirm: () => void, title?: string, message?: string }>({
    isOpen: false,
    onConfirm: () => {},
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'documents'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documents');
    });
    return unsubscribe;
  }, []);

  const handleUpload = async () => {
    if (!newDoc.file || !newDoc.title) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', newDoc.file);
      
      const response = await axios.post('/api/upload/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await addDoc(collection(db, 'documents'), {
        title: newDoc.title,
        type: newDoc.type,
        url: response.data.url,
        size: `${(newDoc.file.size / 1024).toFixed(1)} KB`,
        createdAt: serverTimestamp()
      });

      setShowUploadModal(false);
      setNewDoc({ title: '', type: 'Policy', file: null });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'documents');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Upload Document</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Document Title" 
                className="w-full p-3 rounded-xl border border-slate-200"
                value={newDoc.title}
                onChange={e => setNewDoc({...newDoc, title: e.target.value})}
              />
              <select 
                className="w-full p-3 rounded-xl border border-slate-200"
                value={newDoc.type}
                onChange={e => setNewDoc({...newDoc, type: e.target.value})}
              >
                <option>Policy</option>
                <option>Report</option>
                <option>Form</option>
                <option>Other</option>
              </select>
              <input 
                type="file" 
                className="w-full"
                onChange={e => setNewDoc({...newDoc, file: e.target.files?.[0] || null})}
              />
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-2 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search documents..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Upload size={16} /> Upload
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((docItem) => (
          <div key={docItem.id} className="p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <FileText size={24} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{docItem.title}</p>
              <p className="text-xs text-slate-500">{docItem.type} • {docItem.size || 'N/A'}</p>
            </div>
            <div className="flex gap-2">
              <a href={docItem.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-primary">
                <Download size={16} />
              </a>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmConfig({
                    isOpen: true,
                    title: "Delete Document",
                    message: `Are you sure you want to delete ${docItem.title}?`,
                    onConfirm: async () => {
                      try {
                        await deleteDoc(doc(db, 'documents', docItem.id));
                      } catch (error) {
                        handleFirestoreError(error, OperationType.DELETE, `documents/${docItem.id}`);
                      }
                    }
                  });
                }}
                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="col-span-3 py-12 text-center text-slate-400 italic">No documents in library</div>
        )}
      </div>
    </div>
  );
};

const ImpactReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, onConfirm: () => void, title?: string, message?: string }>({
    isOpen: false,
    onConfirm: () => {},
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });
    return unsubscribe;
  }, []);

  const handleGenerateReport = async (type: 'Quarterly' | 'Annual') => {
    try {
      const reportData = {
        title: `${type} Impact Report ${new Date().getFullYear()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        status: 'Draft',
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'reports'), reportData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reports');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-900">{report.title}</h4>
              <p className="text-xs text-slate-500">Created: {report.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${report.status === 'Finalized' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                {report.status}
              </span>
              <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-primary transition-colors">
                <Download size={18} />
              </button>
              <button 
                onClick={() => {
                  setConfirmConfig({
                    isOpen: true,
                    title: "Delete Report",
                    message: `Are you sure you want to delete ${report.title}?`,
                    onConfirm: async () => {
                      try {
                        await deleteDoc(doc(db, 'reports', report.id));
                      } catch (error) {
                        handleFirestoreError(error, OperationType.DELETE, `reports/${report.id}`);
                      }
                    }
                  });
                }}
                className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="col-span-2 py-8 text-center text-slate-400 italic">No reports generated yet</div>
        )}
      </div>
      <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center">
        <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Generate New Report</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">Use our templates to generate standardized impact reports for donors and stakeholders.</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => handleGenerateReport('Quarterly')} className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm">Quarterly Template</button>
          <button onClick={() => handleGenerateReport('Annual')} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm">Annual Template</button>
        </div>
      </div>
    </div>
  );
};

const PhotoArchive = ({ images, setImages }: { images: GalleryMedia[], setImages: React.Dispatch<React.SetStateAction<GalleryMedia[]>> }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ file: File, type: 'image' | 'video', preview: string }[]>([]);
  const [bulkCategory, setBulkCategory] = useState('Programs');
  const [bulkCaption, setBulkCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, onConfirm: () => void, title?: string, message?: string }>({
    isOpen: false,
    onConfirm: () => {},
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newFiles = files.map(file => {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        return {
          file,
          type: type as 'image' | 'video',
          preview: URL.createObjectURL(file)
        };
      });
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    setUploadProgress({});

    const token = localStorage.getItem('token');
    const uploadedMedia: GalleryMedia[] = [];
    let hasError = false;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', item.file);

        try {
          const response = await axios.post('/api/upload/media', formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
              setUploadProgress(prev => ({ ...prev, [i]: percentCompleted }));
            }
          });

          const mediaData = {
            url: response.data.url,
            caption: bulkCaption || `${item.type === 'video' ? 'Video' : 'Image'} ${images.length + i + 1}`,
            category: bulkCategory,
            date: new Date().toISOString().split('T')[0],
            type: item.type,
            thumbnail: item.type === 'video' ? 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=400' : undefined,
            createdAt: serverTimestamp()
          };

          // Save to Firestore
          const docRef = await addDoc(collection(db, 'gallery'), mediaData);
          
          uploadedMedia.push({
            id: docRef.id,
            ...mediaData
          } as any);
        } catch (err: any) {
          console.error(`Failed to upload file ${i}:`, err);
          hasError = true;
          // If it's a Firestore error, we can use handleFirestoreError but we don't want it to break the whole loop if we want to continue
          // However, for now, let's just set a more specific error if it's an axios error
          if (err.response) {
            setUploadError(`Upload failed for file ${i + 1}: ${err.response.data.error || err.message}`);
          } else {
            setUploadError(`An error occurred while saving file ${i + 1} to the database.`);
          }
        }
      }

      if (uploadedMedia.length > 0) {
        setImages(prev => [...prev, ...uploadedMedia]);
      }

      if (hasError) {
        setUploadError("Some files failed to upload. Please try again.");
      } else {
        setShowUploadModal(false);
        setSelectedFiles([]);
        setBulkCaption('');
      }
    } catch (err) {
      setUploadError("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const removePreview = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-4xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Bulk Upload Media</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:border-primary transition-colors relative">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600 font-bold">Click or drag to add media</p>
                  <p className="text-xs text-slate-400 mt-1">Images or Videos up to 50MB each</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Group Category</label>
                    <select 
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Programs">Programs</option>
                      <option value="Events">Events</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Common Caption (Optional)</label>
                    <input 
                      type="text" 
                      value={bulkCaption}
                      onChange={(e) => setBulkCaption(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      placeholder="e.g. Students at the 2024 Summit"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 flex justify-between">
                  Selected Media <span>({selectedFiles.length})</span>
                </h4>
                <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-100">
                  {selectedFiles.map((item, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group bg-slate-200">
                      {item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video size={24} className="text-slate-400" />
                        </div>
                      ) : (
                        <img src={item.preview} alt={`Preview of ${item.file.name}`} className="w-full h-full object-cover" />
                      )}
                      
                      {uploading && uploadProgress[i] !== undefined && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2">
                          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-1">
                            <div 
                              className="bg-primary h-full transition-all duration-300" 
                              style={{ width: `${uploadProgress[i]}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-white font-bold">{uploadProgress[i]}%</span>
                        </div>
                      )}

                      {!uploading && (
                        <button 
                          onClick={() => removePreview(i)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {selectedFiles.length === 0 && (
                    <div className="col-span-3 py-12 text-center text-slate-400 text-sm italic">
                      No media selected yet
                    </div>
                  )}
                </div>
                {uploadError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="flex-[2] py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${selectedFiles.length} Items`
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((item) => (
          <div key={item.id} className="group relative aspect-square rounded-[15px] overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
            {item.type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={`Video thumbnail for ${item.caption}`} className="w-full h-full object-cover opacity-50" />
                ) : (
                  <Video size={32} className="text-white/20" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play size={24} className="text-white" fill="white" />
                </div>
              </div>
            ) : (
              <img src={item.url} alt={item.caption} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button className="p-2 bg-white rounded-full text-slate-900 hover:bg-accent hover:text-white transition-colors"><Edit size={16} /></button>
              <button 
                onClick={() => {
                  setConfirmConfig({
                    isOpen: true,
                    title: "Delete Media",
                    message: "Are you sure you want to delete this media item?",
                    onConfirm: async () => {
                      try {
                        await deleteDoc(doc(db, 'gallery', item.id));
                      } catch (err) {
                        handleFirestoreError(err, OperationType.DELETE, `gallery/${item.id}`);
                      }
                    }
                  });
                }}
                className="p-2 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-[10px] text-white font-medium truncate">{item.caption}</p>
            </div>
          </div>
        ))}
        <button 
          onClick={() => setShowUploadModal(true)}
          className="aspect-square rounded-[15px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all bg-slate-50/50"
        >
          <Plus size={32} />
          <span className="text-xs font-bold mt-2">Upload Group</span>
        </button>
      </div>
    </div>
  );
};

const AssetInventory = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, onConfirm: () => void, title?: string, message?: string }>({
    isOpen: false,
    onConfirm: () => {},
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'assets'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssets(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assets');
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="overflow-x-auto">
      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="pb-3 font-semibold text-slate-500 text-sm">Asset Name</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Category</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Quantity</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Status</th>
            <th className="pb-3 font-semibold text-slate-500 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td className="py-4 text-sm font-medium text-slate-900">{asset.name}</td>
              <td className="py-4 text-sm text-slate-500">{asset.category}</td>
              <td className="py-4 text-sm text-slate-500">{asset.quantity}</td>
              <td className="py-4">
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{asset.status || 'Good'}</span>
              </td>
              <td className="py-4">
                <button 
                  onClick={() => {
                    setConfirmConfig({
                      isOpen: true,
                      title: "Delete Asset",
                      message: `Are you sure you want to delete ${asset.name}?`,
                      onConfirm: async () => {
                        try {
                          await deleteDoc(doc(db, 'assets', asset.id));
                        } catch (error) {
                          handleFirestoreError(error, OperationType.DELETE, `assets/${asset.id}`);
                        }
                      }
                    });
                  }}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400 italic">No assets in inventory</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const GovernanceTools = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Internal Policies</h3>
      <div className="space-y-2">
        {['Conflict of Interest', 'Data Protection', 'Safeguarding Policy'].map(p => (
          <div key={p} className="p-4 rounded-xl border border-slate-100 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">{p}</span>
            <button className="text-xs font-bold text-primary">Review</button>
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Board Meetings</h3>
      <div className="p-6 rounded-2xl bg-primary text-white">
        <p className="text-xs text-white/60 uppercase font-bold mb-1">Next Meeting</p>
        <p className="text-xl font-bold mb-4">March 25, 2024 • 10:00 AM</p>
        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">View Agenda</button>
      </div>
    </div>
  </div>
);

export default AdminPortal;
