import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { useEffect } from 'react';
import { loadFromFirebase } from './store/syncFirebase';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import StudentLogin from './pages/auth/StudentLogin';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Instructors from './pages/admin/Instructors';
import Students from './pages/admin/Students';
import Checkins from './pages/admin/Checkins';
import Schedule from './pages/admin/Schedule';
import Exams from './pages/admin/Exams';
import Appointments from './pages/admin/Appointments';
import Financial from './pages/admin/Financial';
import StoreAdmin from './pages/admin/StoreAdmin';
import Events from './pages/admin/Events';
import Curriculum from './pages/admin/Curriculum';
import Settings from './pages/admin/Settings';

import StudentLayout from './components/layout/StudentLayout';
import StudentHome from './pages/student/Home';
import StudentStore from './pages/student/Store';
import StudentProfile from './pages/student/Profile';
import StudentSchedule from './pages/student/Schedule';
import StudentCurriculum from './pages/student/Curriculum';
import StudentFinancial from './pages/student/Financial';
import StudentHistory from './pages/student/History';
import StudentContact from './pages/student/Contact';

import InstructorDashboard from './pages/instructor/Dashboard';
import Reports from './pages/instructor/Reports';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadFromFirebase();
        // Force sync Zustand store after loading
        const updatedStudents = useDataStore.getState().students;
        const userInDb = updatedStudents.find(s => s.email.toLowerCase() === firebaseUser.email?.toLowerCase());
        
        if (userInDb && !useAuthStore.getState().isAuthenticated) {
            useAuthStore.getState().login(userInDb);
        }
      }
    });
    return () => unsub();
  }, []);

  // Automatic routing if already authenticated but sitting on login pages
  useEffect(() => {
     if(isAuthenticated && user) {
        const path = window.location.pathname;
        if(path === '/login' || path === '/admin/login' || path === '/') {
           if(user.role === 'ADMIN' || user.role === 'INSTRUCTOR') navigate('/admin/dashboard', { replace: true });
           else navigate('/student/home', { replace: true });
        }
     }
  }, [isAuthenticated, user, navigate]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/login/:academyId" element={<StudentLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/matricula" element={<Register />} />
      <Route path="/matricula/:academyId" element={<Register />} />

      {/* Admin / Instructor Routes */}
      {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={user?.role === 'INSTRUCTOR' ? <InstructorDashboard /> : <AdminDashboard />} />
          <Route path="instructors" element={<Instructors />} />
          <Route path="students" element={<Students />} />
          <Route path="checkins" element={<Checkins />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="exams" element={<Exams />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="financial" element={<Financial />} />
          <Route path="store" element={<StoreAdmin />} />
          <Route path="events" element={<Events />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Fallback admin route */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      )}

      {/* Student Routes */}
      {isAuthenticated && user?.role === 'STUDENT' && (
        <Route path="/student" element={<StudentLayout />}>
          <Route path="home" element={<StudentHome />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="curriculum" element={<StudentCurriculum />} />
          <Route path="financial" element={<StudentFinancial />} />
          <Route path="history" element={<StudentHistory />} />
          <Route path="contact" element={<StudentContact />} />
          <Route path="store" element={<StudentStore />} />
          <Route path="profile" element={<StudentProfile />} />
          {/* Fallback student route */}
          <Route path="*" element={<Navigate to="/student/home" replace />} />
        </Route>
      )}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}





