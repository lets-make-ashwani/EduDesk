import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Exams from './pages/Exams';
import Notices from './pages/Notices';
import ManageUsers from './pages/ManageUsers';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ManageSchools from './pages/ManageSchools';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard if they try to access the wrong one
    if (user.role === 'SUPERADMIN') return <Navigate to="/superadmin" />;
    if (user.role === 'SCHOOL_ADMIN') return <Navigate to="/school-admin" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'teacher') return <Navigate to="/teacher" />;
    if (user.role === 'parent') return <Navigate to="/parent" />;
    if (user.role === 'student') return <Navigate to="/student" />;
    return <Navigate to="/login" />;
  }

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'SUPERADMIN') return <Navigate to="/superadmin" />;
  if (user.role === 'SCHOOL_ADMIN') return <Navigate to="/school-admin" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <Navigate to={`/${user.role}`} />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Root Redirect based on Role */}
        <Route path="/" element={<RootRedirect />} />

        {/* SuperAdmin Routes */}
        <Route path="/superadmin" element={<RoleRoute allowedRoles={['SUPERADMIN']}><DashboardLayout /></RoleRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="schools" element={<ManageSchools />} /> 
          <Route path="users" element={<ManageUsers />} />
          <Route path="settings" element={<Dashboard />} />
        </Route>

        {/* School Admin Routes (New B2B Client Role) */}
        <Route path="/school-admin" element={<RoleRoute allowedRoles={['SCHOOL_ADMIN']}><DashboardLayout /></RoleRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="fees" element={<Fees />} />
          <Route path="exams" element={<Exams />} />
          <Route path="notices" element={<Notices />} />
          <Route path="users" element={<ManageUsers />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><DashboardLayout /></RoleRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="fees" element={<Fees />} />
          <Route path="exams" element={<Exams />} />
          <Route path="notices" element={<Notices />} />
          <Route path="users" element={<ManageUsers />} />
        </Route>

        {/* New Dashboards */}
        <Route path="/teacher/*" element={<RoleRoute allowedRoles={['teacher']}><TeacherDashboard /></RoleRoute>} />
        <Route path="/parent/*" element={<RoleRoute allowedRoles={['parent']}><ParentDashboard /></RoleRoute>} />
        <Route path="/student/*" element={<RoleRoute allowedRoles={['student']}><StudentDashboard /></RoleRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
