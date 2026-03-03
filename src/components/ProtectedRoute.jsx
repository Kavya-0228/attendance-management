import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If allowedRoles specified, check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect to user's appropriate dashboard
        return <Navigate to={`/dashboard/${user?.role || 'student'}`} />;
    }

    return children;
};

export default ProtectedRoute;
