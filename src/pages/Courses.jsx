import { useState, useEffect } from 'react';
import { courseAPI } from '../utils/api';
import { BookOpen, Plus, Edit2, Trash2, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import CourseModal from '../components/CourseModal';

const Courses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseAPI.getAll();
            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = () => {
        setSelectedCourse(null);
        setIsModalOpen(true);
    };

    const handleEditCourse = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleDeleteCourse = async (courseId) => {
        try {
            await courseAPI.delete(courseId);
            fetchCourses();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting course:', error);
            alert(error.response?.data?.message || 'Failed to delete course');
        }
    };

    const canManageCourses = user?.role === 'admin' || user?.role === 'teacher';

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-secondary flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Courses</h1>
                            <p className="text-slate-400">
                                {canManageCourses ? 'Manage your courses' : 'View enrolled courses'}
                            </p>
                        </div>
                    </div>
                    {canManageCourses && (
                        <button
                            onClick={handleAddCourse}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Course
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Courses Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="spinner"></div>
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <motion.div
                            key={course._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card-hover p-6 relative group"
                        >
                            {/* Course Icon */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>

                                {/* Action Buttons */}
                                {canManageCourses && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditCourse(course)}
                                            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(course._id)}
                                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Course Info */}
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                                {course.name}
                            </h3>
                            <p className="text-primary-400 font-mono font-semibold mb-3">
                                {course.code}
                            </p>

                            {/* Schedule */}
                            {course.schedule && (
                                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                                    <Calendar className="w-4 h-4" />
                                    <span className="line-clamp-1">{course.schedule}</span>
                                </div>
                            )}

                            {/* Description */}
                            {course.description && (
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                    {course.description}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-between text-sm pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Users className="w-4 h-4" />
                                    <span>{course.students?.length || 0} Students</span>
                                </div>
                                <span className="text-slate-400">
                                    Teacher: {course.teacher?.name || 'N/A'}
                                </span>
                            </div>

                            {/* Delete Confirmation */}
                            {deleteConfirm === course._id && (
                                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center gap-4">
                                    <p className="text-white text-center font-semibold">
                                        Delete this course?
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="btn-ghost px-6"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course._id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-12 text-center"
                >
                    <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
                    <p className="text-slate-400 mb-6">
                        {canManageCourses
                            ? 'Get started by creating your first course'
                            : 'You are not enrolled in any courses yet'}
                    </p>
                    {canManageCourses && (
                        <button
                            onClick={handleAddCourse}
                            className="btn-primary flex items-center gap-2 mx-auto"
                        >
                            <Plus className="w-5 h-5" />
                            Create Course
                        </button>
                    )}
                </motion.div>
            )}

            {/* Course Modal */}
            <CourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                course={selectedCourse}
                onSuccess={fetchCourses}
            />
        </div>
    );
};

export default Courses;
