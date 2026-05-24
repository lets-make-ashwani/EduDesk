import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function DashboardLayout() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        // 1. Remove security tokens from the browser
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // 2. Clear global user state and redirect to login
        if (logout) logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">EduDesk Manager</h2>
                        <div className="flex items-center space-x-4">
                            {user?.role !== 'SUPERADMIN' && (
                                <span className="text-sm text-blue-700 font-semibold bg-blue-50 border border-blue-100 px-3 py-1 rounded-full shadow-sm">
                                    {user?.school_name || "My School"}
                                </span>
                            )}
                            <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">{user?.username} ({user?.role})</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
