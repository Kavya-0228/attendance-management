import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, attendanceAPI } from '../utils/api';
import { BookOpen, Calendar, TrendingUp, Award, Check, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        attendanceRate: 0,
        present: 0,
        absent: 0,
        late: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [coursesRes, attendanceRes] = await Promise.all([
                courseAPI.getAll(),
                attendanceAPI.getStudentAttendance(user._id)
            ]);

            setCourses(coursesRes.data.courses || []);

            const attendanceStats = attendanceRes.data.stats || {};
            setStats({
                totalCourses: coursesRes.data.count || 0,
                attendanceRate: attendanceStats.percentage || 0,
                present: attendanceStats.present || 0,
                absent: attendanceStats.absent || 0,
                late: attendanceStats.late || 0
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
            <div>
                <h1 className="text-3xl font-bold gradient-text">Student Dashboard</h1>
                <p className="text-slate-400 mt-2">Welcome back, {user?.name}</p>
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
                            <p className="text-slate-400 text-sm">Attendance Rate</p>
                            <p className="text-3xl font-bold mt-2">{stats.attendanceRate}%</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
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
                            <p className="text-slate-400 text-sm">Present</p>
                            <p className="text-3xl font-bold mt-2 text-green-400">{stats.present}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-400" />
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
                            <p className="text-slate-400 text-sm">Absent</p>
                            <p className="text-3xl font-bold mt-2 text-red-400">{stats.absent}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <X className="w-6 h-6 text-red-400" />
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
                            <p className="text-slate-400 text-sm">Late</p>
                            <p className="text-3xl font-bold mt-2 text-yellow-400">{stats.late}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Enrolled Courses */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-6">My Courses</h2>

                {courses.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-2">No enrolled courses</p>
                        <p className="text-sm text-slate-500">Contact your teacher or admin to get enrolled in courses</p>
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

                                <div className="space-y-2 pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Teacher:</span>
                                        <span className="text-slate-200">{course.teacher?.name || 'N/A'}</span>
                                    </div>
                                    <Link
                                        to={`/records?course=${course._id}`}
                                        className="block text-center mt-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary-400 text-sm font-semibold transition-colors"
                                    >
                                        View Attendance →
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/records" className="glass-card-hover p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary-500/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-secondary-400" />
                    </div>
                    <div>
                        <h3 className="font-bold">Attendance Records</h3>
                        <p className="text-sm text-slate-400">View your attendance history</p>
                    </div>
                </Link>

                <Link to="/reports" className="glass-card-hover p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                        <Award className="w-6 h-6 text-accent-400" />
                    </div>
                    <div>
                        <h3 className="font-bold">Reports</h3>
                        <p className="text-sm text-slate-400">Check detailed attendance reports</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default StudentDashboard;
