import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, CreditCard, ClipboardList, Bell, Settings, Building, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
    const location = useLocation();
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

    let menuItems = [];

    if (user?.role === 'SUPERADMIN') {
        menuItems = [
            { path: '/superadmin', label: 'Platform Dashboard', icon: LayoutDashboard },
            { path: '/superadmin/schools', label: 'Manage Schools', icon: Building },
            { path: '/superadmin/users', label: 'Platform Users', icon: Users },
            { path: '/superadmin/settings', label: 'Settings', icon: Settings },
        ];
    } else if (user?.role === 'SCHOOL_ADMIN') {
        const prefix = '/school-admin';
        menuItems = [
            { path: prefix, label: 'Dashboard', icon: LayoutDashboard },
            { path: `${prefix}/students`, label: 'Students', icon: Users },
            { path: `${prefix}/attendance`, label: 'Attendance', icon: CalendarCheck },
            { path: `${prefix}/fees`, label: 'Fees', icon: CreditCard },
            { path: `${prefix}/exams`, label: 'Exams', icon: ClipboardList },
            { path: `${prefix}/notices`, label: 'Notices', icon: Bell },
            { path: `${prefix}/users`, label: 'Manage Users', icon: Settings },
        ];
    } else {
        // Fallback for isolated minimal dashboards
        const prefix = `/${user?.role || ''}`;
        menuItems = [
            { path: prefix, label: 'Dashboard', icon: LayoutDashboard },
        ];
    }

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col shadow-xl z-10">
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                <h1 className="text-2xl font-bold tracking-wider">Edu<span className="text-blue-500">Desk</span></h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isBaseRoute = item.path === '/superadmin' || item.path === '/school-admin';
                    const isActive = location.pathname === item.path || (!isBaseRoute && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 mb-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 font-medium text-sm"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
                <div className="text-xs text-slate-500 text-center">EduDesk MVP v1.0</div>
            </div>
        </div>
    );
}
