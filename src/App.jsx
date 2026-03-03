import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceRecords from './pages/AttendanceRecords';
import Reports from './pages/Reports';
import Courses from './pages/Courses';

// Layout Component
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
                    <Sidebar />
                    <main className="pb-8">{children}</main>
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Role-Based Dashboards */}
                    <Route
                        path="/dashboard/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Layout>
                                    <AdminDashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/teacher"
                        element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <Layout>
                                    <TeacherDashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/student"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <Layout>
                                    <StudentDashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Shared Protected Routes */}
                    <Route
                        path="/mark-attendance"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                                <Layout>
                                    <MarkAttendance />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/records"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <AttendanceRecords />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Reports />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/courses"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Courses />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirect */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/dashboard" element={<Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
