import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, FileText, TrendingUp, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { user } = useAuth();

    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: LayoutDashboard,
            roles: ['admin', 'teacher', 'student'],
        },
        {
            name: 'Mark Attendance',
            path: '/mark-attendance',
            icon: Calendar,
            roles: ['admin', 'teacher'],
        },
        {
            name: 'Attendance Records',
            path: '/records',
            icon: FileText,
            roles: ['admin', 'teacher', 'student'],
        },
        {
            name: 'Reports',
            path: '/reports',
            icon: TrendingUp,
            roles: ['admin', 'teacher', 'student'],
        },
        {
            name: 'Courses',
            path: '/courses',
            icon: BookOpen,
            roles: ['admin', 'teacher', 'student'],
        },
        {
            name: 'Users',
            path: '/users',
            icon: Users,
            roles: ['admin'],
        },
    ];

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(user?.role)
    );

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-card p-4 h-fit sticky top-24"
        >
            <nav className="space-y-2">
                {filteredNavItems.map((item, index) => (
                    <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    </motion.div>
                ))}
            </nav>
        </motion.aside>
    );
};

export default Sidebar;
