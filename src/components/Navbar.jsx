import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card sticky top-0 z-50 mb-6"
        >
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">
                            Attendance System
                        </span>
                    </Link>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300">
                            <Bell className="w-5 h-5 text-slate-300" />
                        </button>

                        {/* User Menu */}
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-white">{user?.name}</p>
                                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all duration-300 group"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
