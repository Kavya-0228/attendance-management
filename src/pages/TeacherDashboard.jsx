import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, attendanceAPI } from '../utils/api';
import { BookOpen, Calendar, Users, TrendingUp, Plus, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        attendanceRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [coursesRes, statsRes] = await Promise.all([
                courseAPI.getAll(),
                attendanceAPI.getStats()
            ]);

            const teacherCourses = coursesRes.data.courses || [];
            setCourses(teacherCourses);

            const totalStudents = teacherCourses.reduce((sum, course) =>
                sum + (course.students?.length || 0), 0
            );

            setStats({
                totalCourses: teacherCourses.length,
                totalStudents,
                attendanceRate: statsRes.data.stats?.attendanceRate || 0
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
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
                    <h1 className="text-3xl font-bold gradient-text">Teacher Dashboard</h1>
                    <p className="text-slate-400 mt-2">Welcome back, {user?.name}</p>
                </div>
                <Link to="/courses/create" className="btn-primary">
                    <Plus className="w-5 h-5" />
                    Create Course
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="stats-card"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">My Courses</p>
                            <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary-400" />
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
                            <p className="text-slate-400 text-sm">Total Students</p>
                            <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-secondary-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-secondary-400" />
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
                            <p className="text-slate-400 text-sm">Attendance Rate</p>
                            <p className="text-3xl font-bold mt-2">{stats.attendanceRate}%</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* My Courses */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">My Courses</h2>
                    <Link to="/mark-attendance" className="btn-secondary">
                        <ClipboardCheck className="w-5 h-5" />
                        Mark Attendance
                    </Link>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-4">No courses yet</p>
                        <Link to="/courses/create" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create Your First Course
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card-hover p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-semibold">
                                        {course.code}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold mb-2">{course.name}</h3>
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                    {course.description || 'No description available'}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Users className="w-4 h-4" />
                                        <span>{course.students?.length || 0} students</span>
                                    </div>
                                    <Link
                                        to={`/mark-attendance?course=${course._id}`}
                                        className="text-sm text-primary-400 hover:text-primary-300 font-semibold"
                                    >
                                        Mark Attendance →
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/mark-attendance" className="glass-card-hover p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary-500/20 flex items-center justify-center">
                        <ClipboardCheck className="w-6 h-6 text-secondary-400" />
                    </div>
                    <div>
                        <h3 className="font-bold">Mark Attendance</h3>
                        <p className="text-sm text-slate-400">Record student attendance</p>
                    </div>
                </Link>

                <Link to="/records" className="glass-card-hover p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-accent-400" />
                    </div>
                    <div>
                        <h3 className="font-bold">View Records</h3>
                        <p className="text-sm text-slate-400">Check attendance history</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default TeacherDashboard;
