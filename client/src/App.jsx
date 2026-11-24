import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminAnalytics from './pages/admin/Analytics';

// Auth pages
import Landing  from './pages/Landing';
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Seeker pages
import SeekerDashboard from './pages/seeker/Dashboard';
import BrowseJobs      from './pages/seeker/BrowseJobs';
import Applications    from './pages/seeker/Applications';
import SavedJobs       from './pages/seeker/SavedJobs';
import ATSScorer       from './pages/seeker/ATSScorer';
import InterviewPrep   from './pages/seeker/InterviewPrep';
import ResumeEnhancer  from './pages/seeker/ResumeEnhancer';
import Profile         from './pages/seeker/Profile';

// Employer pages
import EmployerDashboard from './pages/employer/Dashboard';
import PostJob           from './pages/employer/PostJob';
import Applicants        from './pages/employer/Applicants';
import MyJobs            from './pages/employer/MyJobs';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers     from './pages/admin/Users';
import AdminJobs      from './pages/admin/Jobs';


function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/"         element={<Landing />}  />
      <Route path="/login"    element={<Login />}    />
      <Route path="/register" element={<Register />} />

      {/* Seeker */}
      <Route path="/seeker/dashboard"      element={<PrivateRoute roles={['seeker']}><SeekerDashboard /></PrivateRoute>} />
      <Route path="/seeker/jobs"           element={<PrivateRoute roles={['seeker']}><BrowseJobs /></PrivateRoute>}      />
      <Route path="/seeker/applications"   element={<PrivateRoute roles={['seeker']}><Applications /></PrivateRoute>}   />
      <Route path="/seeker/saved"          element={<PrivateRoute roles={['seeker']}><SavedJobs /></PrivateRoute>}       />
      <Route path="/seeker/ats"            element={<PrivateRoute roles={['seeker']}><ATSScorer /></PrivateRoute>}       />
      <Route path="/seeker/interview"      element={<PrivateRoute roles={['seeker']}><InterviewPrep /></PrivateRoute>}   />
      <Route path="/seeker/resume-enhancer"element={<PrivateRoute roles={['seeker']}><ResumeEnhancer /></PrivateRoute>} />
      <Route path="/seeker/profile"        element={<PrivateRoute roles={['seeker']}><Profile /></PrivateRoute>}         />

      {/* Employer */}
      <Route path="/employer/dashboard"   element={<PrivateRoute roles={['employer']}><EmployerDashboard /></PrivateRoute>} />
      <Route path="/employer/post-job"    element={<PrivateRoute roles={['employer']}><PostJob /></PrivateRoute>}            />
      <Route path="/employer/applicants"  element={<PrivateRoute roles={['employer']}><Applicants /></PrivateRoute>}         />
      <Route path="/employer/jobs"        element={<PrivateRoute roles={['employer']}><MyJobs /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/users"     element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>}     />
      <Route path="/admin/jobs"      element={<PrivateRoute roles={['admin']}><AdminJobs /></PrivateRoute>}      />
      <Route path="/admin/analytics" element={<PrivateRoute roles={['admin']}><AdminAnalytics /></PrivateRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color:      '#f9fafb',
              border:     '1px solid #374151',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}