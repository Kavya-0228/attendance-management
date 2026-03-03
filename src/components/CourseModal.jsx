import { useState, useEffect } from 'react';
import { X, Save, Loader2, UserPlus } from 'lucide-react';
import { courseAPI, userAPI } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const CourseModal = ({ isOpen, onClose, course, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        schedule: '',
        description: '',
        students: []
    });
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
            if (course) {
                setFormData({
                    name: course.name || '',
                    code: course.code || '',
                    schedule: course.schedule || '',
                    description: course.description || '',
                    students: course.students?.map(s => s._id || s) || []
                });
            } else {
                setFormData({
                    name: '',
                    code: '',
                    schedule: '',
                    description: '',
                    students: []
                });
            }
            setError('');
        }
    }, [isOpen, course]);

    const fetchStudents = async () => {
        try {
            const response = await userAPI.getAll({ role: 'student' });
            setAllStudents(response.data.users || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleStudentToggle = (studentId) => {
        setFormData(prev => ({
            ...prev,
            students: prev.students.includes(studentId)
                ? prev.students.filter(id => id !== studentId)
                : [...prev.students, studentId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (course) {
                await courseAPI.update(course._id, formData);
            } else {
                await courseAPI.create(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving course:', error);
            setError(error.response?.data?.message || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {course ? 'Edit Course' : 'Create New Course'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Course Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Course Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., Introduction to Computer Science"
                                required
                            />
                        </div>

                        {/* Course Code */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Course Code *
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., CSC101"
                                required
                            />
                        </div>

                        {/* Schedule */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Schedule
                            </label>
                            <input
                                type="text"
                                name="schedule"
                                value={formData.schedule}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., Mon/Wed/Fri 10:00 AM - 11:30 AM"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field min-h-[100px]"
                                placeholder="Brief description of the course..."
                            />
                        </div>

                        {/* Students */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Enroll Students ({formData.students.length} selected)
                            </label>
                            <div className="max-h-60 overflow-y-auto space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
                                {allStudents.length > 0 ? (
                                    allStudents.map(student => (
                                        <label
                                            key={student._id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.students.includes(student._id)}
                                                onChange={() => handleStudentToggle(student._id)}
                                                className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500"
                                            />
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{student.name}</p>
                                                <p className="text-sm text-slate-400">
                                                    {student.enrollmentId || student.email}
                                                </p>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 py-4">
                                        No students available
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-ghost flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {course ? 'Update Course' : 'Create Course'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CourseModal;
