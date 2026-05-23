import { useState, useEffect, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';
import { FiBook, FiUpload, FiDownload, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function TeacherDashboard() {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ homeworks: 0, materials: 0, classes: 0 });
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Mock stats for now until backend analytics are ready
        setStats({ homeworks: 12, materials: 5, classes: 3 });
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Teacher Portal</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.first_name || user?.username || 'Teacher'}! Manage your classes and materials.</p>
                </div>
                <div className="hidden sm:flex space-x-3">
                    <button onClick={() => setActiveTab('homework')} className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition">
                        <FiUpload className="mr-2" /> Upload Homework
                    </button>
                    <button onClick={() => setActiveTab('materials')} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition">
                        <FiFileText className="mr-2" /> Add Material
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FiBook className="w-6 h-6" /></div>
                        <div><p className="text-sm font-medium text-gray-500">My Classes</p><p className="text-2xl font-bold text-gray-900">{stats.classes}</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><FiUpload className="w-6 h-6" /></div>
                        <div><p className="text-sm font-medium text-gray-500">Homework Assigned</p><p className="text-2xl font-bold text-gray-900">{stats.homeworks}</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><FiFileText className="w-6 h-6" /></div>
                        <div><p className="text-sm font-medium text-gray-500">Study Materials</p><p className="text-2xl font-bold text-gray-900">{stats.materials}</p></div>
                    </div>
                </div>
            )}

            {/* Academic Forms area */}
            {(activeTab === 'homework' || activeTab === 'materials') && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 border-b pb-4">
                        {activeTab === 'homework' ? 'Upload New Homework' : 'Upload Study Material'}
                    </h2>

                    <form className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Class & Subject</label>
                                <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                    <option>Loading assigned subjects...</option>
                                </select>
                            </div>
                            {activeTab === 'homework' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                                    <input type="date" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input type="text" placeholder="e.g. Chapter 4 Math Exercises" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description / Instructions</label>
                            <textarea rows="4" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Enter instructions here..."></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Attach File (PDF, DOCX)</label>
                            <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button type="button" onClick={() => setActiveTab('overview')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center">
                                <FiUpload className="mr-2" /> Submit
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
