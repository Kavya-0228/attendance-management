import { useState, useEffect } from 'react';
import { attendanceAPI, courseAPI } from '../utils/api';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [selectedCourse, dateRange.startDate, dateRange.endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCourse) params.courseId = selectedCourse;
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;

            const [statsRes, coursesRes] = await Promise.all([
                attendanceAPI.getStats(params),
                courseAPI.getAll(),
            ]);

            setStats(statsRes.data.stats);
            setTrends(statsRes.data.trends || []);
            setCourses(coursesRes.data.courses);
        } catch (error) {
            console.error('Error fetching reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    const pieData = [
        { name: 'Present', value: stats?.present || 0, color: '#10b981' },
        { name: 'Absent', value: stats?.absent || 0, color: '#ef4444' },
        { name: 'Late', value: stats?.late || 0, color: '#f59e0b' },
    ];

    const barData = trends.slice(-10).map(trend => ({
        date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present: trend.present,
        absent: trend.absent,
        late: trend.late,
    }));

    const lineData = trends.slice(-10).map(trend => ({
        date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        percentage: parseFloat(trend.percentage),
    }));

    const statsCards = [
        {
            title: 'Total Records',
            value: stats?.totalRecords || 0,
            icon: Calendar,
            color: 'text-primary-400',
            gradient: 'bg-gradient-primary',
        },
        {
            title: 'Present',
            value: stats?.present || 0,
            icon: TrendingUp,
            color: 'text-green-400',
            gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
        },
        {
            title: 'Absent',
            value: stats?.absent || 0,
            icon: BarChart3,
            color: 'text-red-400',
            gradient: 'bg-gradient-to-br from-red-500 to-pink-500',
        },
        {
            title: 'Attendance Rate',
            value: `${stats?.attendanceRate || 0}%`,
            icon: PieChartIcon,
            color: 'text-secondary-400',
            gradient: 'bg-gradient-secondary',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-accent flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
                        <p className="text-slate-400">Visualize attendance data and trends</p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
            >
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.name} ({course.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="input-field"
                        />
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsCards.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
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

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <PieChartIcon className="w-6 h-6 text-primary-400" />
                                    Status Distribution
                                </h2>
                                <button className="btn-ghost text-sm flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
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

                        {/* Line Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-secondary-400" />
                                Attendance Trend
                            </h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="percentage"
                                        stroke="#06b6d4"
                                        strokeWidth={3}
                                        dot={{ fill: '#06b6d4', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-accent-400" />
                            Daily Breakdown
                        </h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="late" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default Reports;
