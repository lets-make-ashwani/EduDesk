import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiBookOpen, FiClock, FiDownload, FiCheckCircle } from 'react-icons/fi';

export default function StudentDashboard() {
    const { user } = useContext(AuthContext);

    // Mock data for UI layout
    const homeworks = [
        { id: 1, subject: 'Mathematics', title: 'Calculus Exercises Ch 3', due: '2026-03-10', status: 'Pending' },
        { id: 2, subject: 'Physics', title: 'Lab Report on Gravity', due: '2026-03-08', status: 'Submitted' }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-extrabold mb-2">Welcome back, {user?.username}!</h1>
                <p className="text-blue-100 text-lg">Here's what's happening in your classes today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Homework */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center"><FiClock className="mr-2 text-blue-600" /> Current Homework</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{homeworks.length} Due Soon</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {homeworks.map(hw => (
                            <li key={hw.id} className="p-6 hover:bg-gray-50 transition flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{hw.subject}</p>
                                    <p className="font-semibold text-gray-900">{hw.title}</p>
                                    <p className="text-sm text-gray-500 mt-1">Due: {hw.due}</p>
                                </div>
                                <div>
                                    {hw.status === 'Pending' ? (
                                        <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 flex items-center">
                                            <FiDownload className="mr-2" /> Download
                                        </button>
                                    ) : (
                                        <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-lg">
                                            <FiCheckCircle className="mr-1.5" /> Submitted
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Study Materials */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center"><FiBookOpen className="mr-2 text-indigo-600" /> Recent Study Materials</h2>
                    </div>
                    <div className="p-8 text-center text-gray-500">
                        <FiBookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>No new materials posted recently by your teachers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
