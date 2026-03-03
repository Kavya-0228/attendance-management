import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, courseAPI } from '../utils/api';
import { Users, BookOpen, Calendar, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, coursesRes] = await Promise.all([
                attendanceAPI.getStats(),
                courseAPI.getAll(),
            ]);

            setStats(statsRes.data.stats);
            setCourses(coursesRes.data.courses);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        {
            title: 'Total Records',
            value: stats?.totalRecords || 0,
            icon: Calendar,
            gradient: 'bg-gradient-primary',
            color: 'text-primary-400',
        },
        {
            title: 'Present',
            value: stats?.present || 0,
            icon: CheckCircle,
            gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
            color: 'text-green-400',
        },
        {
            title: 'Absent',
            value: stats?.absent || 0,
            icon: XCircle,
            gradient: 'bg-gradient-to-br from-red-500 to-pink-500',
            color: 'text-red-400',
        },
        {
            title: 'Attendance Rate',
            value: `${stats?.attendanceRate || 0}%`,
            icon: TrendingUp,
            gradient: 'bg-gradient-secondary',
            color: 'text-secondary-400',
        },
    ];

    const pieData = [
        { name: 'Present', value: stats?.present || 0, color: '#10b981' },
        { name: 'Absent', value: stats?.absent || 0, color: '#ef4444' },
        { name: 'Late', value: stats?.late || 0, color: '#f59e0b' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8"
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            Welcome back, {user?.name}!
                        </h1>
                        <p className="text-slate-400">
                            {user?.role === 'admin' && 'Manage your attendance system'}
                            {user?.role === 'teacher' && 'Track and manage student attendance'}
                            {user?.role === 'student' && 'View your attendance records'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="stats-card group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary-400" />
                        Attendance Distribution
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Courses List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-secondary-400" />
                        Your Courses
                    </h2>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {courses.length > 0 ? (
                            courses.map((course, index) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-white">{course.name}</h3>
                                            <p className="text-sm text-slate-400">{course.code}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-400">
                                                {user?.role === 'teacher' && `${course.students?.length || 0} students`}
                                                {user?.role === 'student' && course.teacher?.name}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No courses found</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            {(user?.role === 'admin' || user?.role === 'teacher') && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="/mark-attendance" className="btn-primary text-center">
                            <Clock className="w-5 h-5 inline mr-2" />
                            Mark Attendance
                        </a>
                        <a href="/records" className="btn-secondary text-center">
                            <Calendar className="w-5 h-5 inline mr-2" />
                            View Records
                        </a>
                        <a href="/reports" className="btn-accent text-center">
                            <TrendingUp className="w-5 h-5 inline mr-2" />
                            Generate Reports
                        </a>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;
