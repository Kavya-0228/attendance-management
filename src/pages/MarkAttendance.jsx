import { useState, useEffect } from 'react';
import { courseAPI, attendanceAPI, userAPI } from '../utils/api';
import { CheckCircle, XCircle, Clock, Calendar, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MarkAttendance = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchStudents();
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseAPI.getAll();
            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setMessage({ type: 'error', text: 'Failed to load courses' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const course = courses.find(c => c._id === selectedCourse);
            if (course && course.students) {
                setStudents(course.students);
                // Initialize attendance data
                const initialData = {};
                course.students.forEach(student => {
                    initialData[student._id] = 'present';
                });
                setAttendanceData(initialData);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setMessage({ type: 'error', text: 'Failed to load students' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleMarkAll = (status) => {
        const newData = {};
        students.forEach(student => {
            newData[student._id] = status;
        });
        setAttendanceData(newData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCourse) {
            setMessage({ type: 'error', text: 'Please select a course' });
            return;
        }

        if (students.length === 0) {
            setMessage({ type: 'error', text: 'No students in this course' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const attendanceRecords = students.map(student => ({
                studentId: student._id,
                status: attendanceData[student._id] || 'present',
            }));

            await attendanceAPI.mark({
                courseId: selectedCourse,
                attendanceRecords,
                date,
            });

            setMessage({ type: 'success', text: 'Attendance marked successfully!' });

            // Reset after 2 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            console.error('Error marking attendance:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to mark attendance'
            });
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-500/20 border-green-500/30 text-green-400';
            case 'absent':
                return 'bg-red-500/20 border-red-500/30 text-red-400';
            case 'late':
                return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
            default:
                return 'bg-white/5 border-white/10 text-slate-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return CheckCircle;
            case 'absent':
                return XCircle;
            case 'late':
                return Clock;
            default:
                return CheckCircle;
        }
    };

    if (user?.role === 'student') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="glass-card p-8 text-center">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400">Only teachers and admins can mark attendance.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Mark Attendance</h1>
                        <p className="text-slate-400">Record student attendance for your courses</p>
                    </div>
                </div>
            </motion.div>

            {/* Message */}
            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${message.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Course and Date Selection */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Select Course
                            </label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="input-field"
                                required
                            >
                                <option value="">Choose a course...</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        {course.name} ({course.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    {students.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => handleMarkAll('present')}
                                className="btn-ghost flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Mark All Present
                            </button>
                            <button
                                type="button"
                                onClick={() => handleMarkAll('absent')}
                                className="btn-ghost flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Mark All Absent
                            </button>
                            <button
                                type="button"
                                onClick={() => handleMarkAll('late')}
                                className="btn-ghost flex items-center gap-2"
                            >
                                <Clock className="w-4 h-4" />
                                Mark All Late
                            </button>
                        </div>
                    )}

                    {/* Students List */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner"></div>
                        </div>
                    ) : students.length > 0 ? (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Students ({students.length})
                            </h3>
                            <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
                                {students.map((student, index) => {
                                    const status = attendanceData[student._id] || 'present';
                                    const StatusIcon = getStatusIcon(status);

                                    return (
                                        <motion.div
                                            key={student._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-white">{student.name}</h4>
                                                        <p className="text-sm text-slate-400">{student.enrollmentId || student.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    {['present', 'late', 'absent'].map((statusOption) => {
                                                        const Icon = getStatusIcon(statusOption);
                                                        const isActive = status === statusOption;

                                                        return (
                                                            <button
                                                                key={statusOption}
                                                                type="button"
                                                                onClick={() => handleStatusChange(student._id, statusOption)}
                                                                className={`px-4 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${isActive
                                                                        ? getStatusColor(statusOption)
                                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                <Icon className="w-4 h-4" />
                                                                <span className="capitalize text-sm font-medium">{statusOption}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : selectedCourse ? (
                        <div className="text-center py-12 text-slate-400">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No students enrolled in this course</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Select a course to view students</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    {students.length > 0 && (
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary flex items-center gap-2 px-8"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Attendance
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default MarkAttendance;
