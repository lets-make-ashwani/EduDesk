import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Users, CreditCard, CalendarCheck } from 'lucide-react';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        students: 0,
        dueFees: 0,
        presentToday: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [studentsObj, paymentsObj, attendanceObj] = await Promise.all([
                    api.get('students/'),
                    api.get('payments/due/'),
                    api.get('attendance/')
                ]);

                const studentsCount = studentsObj.data.length;
                const dueFeesCount = paymentsObj.data.length;

                const today = new Date().toISOString().split('T')[0];
                const presentToday = attendanceObj.data.filter(a => a.date === today && a.status === 'Present').length;

                setStats({
                    students: studentsCount,
                    dueFees: dueFeesCount,
                    presentToday
                });
            } catch (err) {
                console.error("Error fetching dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center animate-pulse">
                            <div className="w-16 h-16 rounded-xl bg-gray-200 mr-5"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                    <div className="p-4 rounded-xl bg-blue-50 text-blue-600 mr-5">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Students</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                    <div className="p-4 rounded-xl bg-red-50 text-red-600 mr-5">
                        <CreditCard className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Due Fees</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.dueFees}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
                    <div className="p-4 rounded-xl bg-green-50 text-green-600 mr-5">
                        <CalendarCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Present Today</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.presentToday}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
