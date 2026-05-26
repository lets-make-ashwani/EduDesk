import { useState, useEffect, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';

export default function ManageUsers() {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'teacher',
        school: ''
    });

    // School Info Modal states
    const [showSchoolModal, setShowSchoolModal] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [loadingSchool, setLoadingSchool] = useState(false);

    useEffect(() => {
        fetchUsers();
        if (currentUser?.role === 'SUPERADMIN') {
            fetchSchools();
        }
    }, [currentUser]);

    const handleSchoolClick = async (schoolId) => {
        setLoadingSchool(true);
        setShowSchoolModal(true);
        setSelectedSchool(null);
        try {
            const res = await api.get(`schools/${schoolId}/`);
            setSelectedSchool(res.data);
        } catch (error) {
            console.error('Error fetching school details:', error);
            alert('Failed to load school details.');
            setShowSchoolModal(false);
        } finally {
            setLoadingSchool(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('users/');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchools = async () => {
        try {
            const res = await api.get('schools/');
            setSchools(res.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (u) => {
        setIsEditMode(true);
        setEditingUserId(u.id);
        setFormData({
            username: u.username,
            password: '',
            role: u.role,
            school: u.school || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (payload.school === '') {
                payload.school = null;
            }
            if (isEditMode) {
                if (payload.password === '') {
                    delete payload.password; // Do not update password if left blank
                }
                await api.put(`users/${editingUserId}/`, payload);
                alert('User updated successfully!');
            } else {
                await api.post('users/', payload);
                alert('User created successfully!');
            }
            closeModal();
            fetchUsers();
        } catch (error) {
            alert('Error saving user. Username might exist or password too simple.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.delete(`users/${id}/`);
                fetchUsers();
            } catch (error) {
                alert('Error deleting user.');
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingUserId(null);
        setFormData({ username: '', password: '', role: 'teacher', school: '' });
    };

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div></th>
                                <th className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div></th>
                                <th className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></th>
                                {currentUser?.role === 'SUPERADMIN' && <th className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></th>}
                                <th className="px-6 py-4 flex justify-end"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i}>
                                    <td className="px-6 py-5"><div className="h-4 w-6 bg-gray-200 rounded animate-pulse"></div></td>
                                    <td className="px-6 py-5"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div></td>
                                    <td className="px-6 py-5"><div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div></td>
                                    {currentUser?.role === 'SUPERADMIN' && <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>}
                                    <td className="px-6 py-5 flex justify-end"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{currentUser?.role === 'SUPERADMIN' ? 'Platform Users & Roles' : 'School Users & Roles'}</h1>
                <button
                    onClick={() => { setIsEditMode(false); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
                >
                    + Add New User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Role</th>
                            {currentUser?.role === 'SUPERADMIN' && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School</th>}
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u, index) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${u.role === 'SUPERADMIN' ? 'bg-red-100 text-red-800' :
                                        u.role === 'SCHOOL_ADMIN' || u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        u.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                                        u.role === 'student' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'}`
                                    }>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                {currentUser?.role === 'SUPERADMIN' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                        {u.school ? (
                                            <button 
                                                onClick={() => handleSchoolClick(u.school)}
                                                className="text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide transition active:scale-95 text-left"
                                            >
                                                {u.school_name}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 italic bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-medium">Platform</span>
                                        )}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {u.role !== 'SUPERADMIN' && (
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => handleEdit(u)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">{isEditMode ? 'Edit User' : 'Create New User'}</h2>
                        {currentUser?.role !== 'SUPERADMIN' && !isEditMode && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">This user will automatically be assigned to <strong>{currentUser?.school_name || 'your school'}</strong>.</div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input required type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password {isEditMode && '(leave blank to keep unchanged)'}</label>
                                <input required={!isEditMode} type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select required name="role" value={formData.role} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border">
                                    {currentUser?.role === 'SUPERADMIN' && <option value="SCHOOL_ADMIN">School Admin</option>}
                                    <option value="teacher">Teacher</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                            {currentUser?.role === 'SUPERADMIN' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                                    <select name="school" value={formData.school} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border">
                                        <option value="">Platform (No School)</option>
                                        {schools.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{isEditMode ? 'Update User' : 'Create User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSchoolModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg mr-2">🏢</span>
                                School Details
                            </h2>
                            <button 
                                onClick={() => setShowSchoolModal(false)}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded-full transition"
                            >
                                ✕
                            </button>
                        </div>

                        {loadingSchool ? (
                            <div className="py-12 flex flex-col items-center justify-center space-y-3">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-semibold text-gray-500">Fetching school details...</p>
                            </div>
                        ) : selectedSchool ? (
                            <div className="space-y-5">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</p>
                                    <p className="text-lg font-extrabold text-gray-900 mt-0.5">{selectedSchool.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                    <p className="text-sm font-semibold text-gray-600 mt-0.5">{selectedSchool.address || <span className="text-gray-400 italic">No address registered.</span>}</p>
                                </div>
                                <div className="border-t pt-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">SaaS Statistics</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl">
                                            <p className="text-xs font-semibold text-blue-600">Students</p>
                                            <p className="text-xl font-bold text-slate-800 mt-0.5">{selectedSchool.student_count}</p>
                                        </div>
                                        <div className="p-3 bg-purple-50/50 border border-purple-100/50 rounded-xl">
                                            <p className="text-xs font-semibold text-purple-600">Classes</p>
                                            <p className="text-xl font-bold text-slate-800 mt-0.5">{selectedSchool.class_count}</p>
                                        </div>
                                        <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl">
                                            <p className="text-xs font-semibold text-indigo-600">Teachers</p>
                                            <p className="text-xl font-bold text-slate-800 mt-0.5">{selectedSchool.teacher_count}</p>
                                        </div>
                                        <div className="p-3 bg-green-50/50 border border-green-100/50 rounded-xl">
                                            <p className="text-xs font-semibold text-green-600">School Admins</p>
                                            <p className="text-xl font-bold text-slate-800 mt-0.5">{selectedSchool.admin_count}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">Failed to load school details.</p>
                        )}

                        <div className="flex justify-end pt-5 mt-6 border-t border-gray-100">
                            <button 
                                onClick={() => setShowSchoolModal(false)}
                                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition shadow-sm active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
