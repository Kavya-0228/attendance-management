import { useState, useEffect } from 'react';
import { attendanceAPI, courseAPI } from '../utils/api';
import { Search, Filter, Calendar, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AttendanceRecords = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        courseId: '',
        status: '',
        startDate: '',
        endDate: '',
        search: '',
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [filters.courseId, filters.status, filters.startDate, filters.endDate]);

    const fetchCourses = async () => {
        try {
            const response = await courseAPI.getAll();
            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.courseId) params.courseId = filters.courseId;
            if (filters.status) params.status = filters.status;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await attendanceAPI.getRecords(params);
            setRecords(response.data.records);
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            courseId: '',
            status: '',
            startDate: '',
            endDate: '',
            search: '',
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'present':
                return (
                    <span className="badge-success flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Present
                    </span>
                );
            case 'absent':
                return (
                    <span className="badge-danger flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Absent
                    </span>
                );
            case 'late':
                return (
                    <span className="badge-warning flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Late
                    </span>
                );
            default:
                return null;
        }
    };

    const filteredRecords = records.filter(record => {
        if (!filters.search) return true;
        const searchLower = filters.search.toLowerCase();
        return (
            record.student?.name?.toLowerCase().includes(searchLower) ||
            record.student?.enrollmentId?.toLowerCase().includes(searchLower) ||
            record.course?.name?.toLowerCase().includes(searchLower) ||
            record.course?.code?.toLowerCase().includes(searchLower)
        );
    });

    const exportToCSV = () => {
        if (filteredRecords.length === 0) {
            alert('No records to export');
            return;
        }

        // Prepare CSV headers
        const headers = ['Student Name', 'Enrollment ID', 'Course Name', 'Course Code', 'Date', 'Status', 'Marked By'];

        // Prepare CSV rows
        const rows = filteredRecords.map(record => [
            record.student?.name || 'N/A',
            record.student?.enrollmentId || record.student?.email || 'N/A',
            record.course?.name || 'N/A',
            record.course?.code || 'N/A',
            new Date(record.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            record.status,
            record.markedBy?.name || 'N/A'
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_records_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-secondary flex items-center justify-center">
                        <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Attendance Records</h1>
                        <p className="text-slate-400">View and filter attendance history</p>
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
                <div className="flex items-center gap-3 mb-6">
                    <Filter className="w-5 h-5 text-primary-400" />
                    <h2 className="text-lg font-semibold text-white">Filters</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="input-field pl-12"
                            placeholder="Search..."
                        />
                    </div>

                    {/* Course Filter */}
                    <select
                        value={filters.courseId}
                        onChange={(e) => handleFilterChange('courseId', e.target.value)}
                        className="input-field"
                    >
                        <option value="">All Courses</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>
                                {course.name} ({course.code})
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="input-field"
                    >
                        <option value="">All Status</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                    </select>

                    {/* Date Range */}
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="input-field"
                            placeholder="Start Date"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="input-field max-w-xs"
                        placeholder="End Date"
                    />
                    <button onClick={clearFilters} className="btn-ghost">
                        Clear Filters
                    </button>
                </div>
            </motion.div>

            {/* Records Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="table-container"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">
                            Records ({filteredRecords.length})
                        </h2>
                        <button onClick={exportToCSV} className="btn-ghost flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner"></div>
                        </div>
                    ) : filteredRecords.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="table-header">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Student</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Course</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Marked By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record, index) => (
                                        <motion.tr
                                            key={record._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="table-row"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-white">{record.student?.name}</p>
                                                    <p className="text-sm text-slate-400">{record.student?.enrollmentId || record.student?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-white">{record.course?.name}</p>
                                                    <p className="text-sm text-slate-400">{record.course?.code}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(record.status)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {record.markedBy?.name || 'N/A'}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No attendance records found</p>
                            <p className="text-sm mt-2">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AttendanceRecords;
