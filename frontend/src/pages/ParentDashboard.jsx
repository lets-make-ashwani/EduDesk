import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiUserCheck, FiCreditCard, FiBell, FiActivity } from 'react-icons/fi';

export default function ParentDashboard() {
    const { user } = useContext(AuthContext);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-extrabold mb-2">Welcome, {user?.username}</h1>
                <p className="text-teal-100 text-lg">Parent Portal - Stay up to date with your child's education.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-3 hover:shadow-md transition cursor-pointer">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full"><FiUserCheck className="w-8 h-8" /></div>
                    <h3 className="font-bold text-gray-900">Child's Profile</h3>
                    <p className="text-sm text-gray-500">View attendance & grades</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-3 hover:shadow-md transition cursor-pointer">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full"><FiCreditCard className="w-8 h-8" /></div>
                    <h3 className="font-bold text-gray-900">Fee Payments</h3>
                    <p className="text-sm text-gray-500">View dues & pay online</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-3 hover:shadow-md transition cursor-pointer">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full"><FiActivity className="w-8 h-8" /></div>
                    <h3 className="font-bold text-gray-900">Homework</h3>
                    <p className="text-sm text-gray-500">Track active assignments</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-3 hover:shadow-md transition cursor-pointer">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-full"><FiBell className="w-8 h-8" /></div>
                    <h3 className="font-bold text-gray-900">Notices</h3>
                    <p className="text-sm text-gray-500">School announcements</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 mt-8">
                <FiBell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No recent alerts for your child.</p>
            </div>
        </div>
    );
}
