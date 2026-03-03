import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, userAPI, attendanceAPI } from '../utils/api';
import {
    Users, BookOpen, Calendar, TrendingUp,
    Plus, Search, Edit2, Trash2, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalStudents: 0,
        attendanceRate: 0
    });
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [coursesRes, usersRes, statsRes] = await Promise.all([
                courseAPI.getAll(),
                userAPI.getAll(),
                attendanceAPI.getStats()
            ]);

            setCourses(coursesRes.data.courses || []);
            setUsers(usersRes.data.users || []);

            setStats({
                totalUsers: usersRes.data.count || 0,
                totalCourses: coursesRes.data.count || 0,
                totalStudents: usersRes.data.users?.filter(u => u.role === 'student').length || 0,
                attendanceRate: statsRes.data.stats?.attendanceRate || 0
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            await courseAPI.delete(courseId);
            setCourses(courses.filter(c => c._id !== courseId));
        } catch (error) {
            console.error('Failed to delete course:', error);
            alert(error.response?.data?.message || 'Failed to delete course');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
                    <p className="text-slate-400 mt-2">Manage system, courses, and users</p>
                </div>
                <Link to="/courses/create" className="btn-primary">
                    <Plus className="w-5 h-5" />
                    Create Course
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="stats-card"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Users</p>
                            <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stats-card"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Courses</p>
                            <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-secondary-500/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-secondary-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stats-card"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Students</p>
                            <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                            <Award className="w-6 h-6 text-accent-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="stats-card"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Attendance Rate</p>
                            <p className="text-3xl font-bold mt-2">{stats.attendanceRate}%</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Courses Table */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">All Courses</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="input-field pl-10 w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Course Code</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Teacher</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Students</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course._id} className="table-row">
                                    <td className="px-6 py-4 text-sm font-mono text-primary-400">{course.code}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{course.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{course.teacher?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{course.students?.length || 0}</td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/courses/${course._id}/edit`}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-400" />
                                            </Link>
                                            <button
                                                onClick={() => deleteCourse(course._id)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {courses.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No courses found</p>
                            <Link to="/courses/create" className="btn-primary mt-4 inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create First Course
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Users */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-6">Recent Users</h2>
                <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                </div>
                            </div>
                            <span className={`badge ${user.role === 'admin' ? 'badge-danger' :
                                    user.role === 'teacher' ? 'badge-info' :
                                        'badge-success'
                                }`}>
                                {user.role}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
