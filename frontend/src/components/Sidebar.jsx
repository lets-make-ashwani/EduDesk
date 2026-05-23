import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, CreditCard, ClipboardList, Bell, Settings } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
    const location = useLocation();
    const { user } = useContext(AuthContext);

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/students', label: 'Students', icon: Users },
        { path: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
        { path: '/admin/fees', label: 'Fees', icon: CreditCard },
        { path: '/admin/exams', label: 'Exams', icon: ClipboardList },
        { path: '/admin/notices', label: 'Notices', icon: Bell },
        { path: '/admin/users', label: 'Manage Users', icon: Settings },
    ];

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col shadow-xl z-10">
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                <h1 className="text-2xl font-bold tracking-wider">Edu<span className="text-blue-500">Desk</span></h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    // Exact match for dashboard, partial check for subpages
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
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
            <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                EduDesk MVP v1.0
            </div>
        </div>
    );
}
