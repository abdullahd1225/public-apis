import { Navigate, Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ClassroomsPage from './pages/ClassroomsPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import StudentDetailPage from './pages/StudentDetailPage.jsx';
import HomeworksPage from './pages/HomeworksPage.jsx';
import LessonsPage from './pages/LessonsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function Protected({ children, admin }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <Spin fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Protected><MainLayout /></Protected>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<Protected admin><UsersPage /></Protected>} />
        <Route path="classrooms" element={<ClassroomsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="homeworks" element={<HomeworksPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
