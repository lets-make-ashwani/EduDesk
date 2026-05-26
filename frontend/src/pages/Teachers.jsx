import { useState, useEffect, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';

export default function Teachers() {
    const { user: currentUser } = useContext(AuthContext);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTeacherId, setEditingTeacherId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        qualification: '',
        password: ''
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await api.get('teachers/');
            setTeachers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (t) => {
        setIsEditMode(true);
        setEditingTeacherId(t.id);
        setFormData({
            username: t.username || '',
            email: t.email || '',
            phone: t.phone || '',
            qualification: t.qualification || '',
            password: ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete teacher: ${name}?`)) {
            try {
                await api.delete(`teachers/${id}/`);
                fetchTeachers();
            } catch (error) {
                alert('Error deleting teacher.');
                console.error(error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (isEditMode) {
                if (payload.password === '') {
                    delete payload.password; // Do not update password if left blank
                }
                await api.put(`teachers/${editingTeacherId}/`, payload);
                alert('Teacher updated successfully!');
            } else {
                await api.post('teachers/', payload);
                alert('Teacher added successfully!');
            }
            closeModal();
            fetchTeachers();
        } catch (error) {
            alert('Error saving teacher. Username might exist or password too simple.');
            console.error(error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingTeacherId(null);
        setFormData({ username: '', email: '', phone: '', qualification: '', password: '' });
    };

    const filteredTeachers = teachers.filter(t => 
        (t.username && t.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.qualification && t.qualification.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-12 bg-gray-50 border-b border-gray-200 animate-pulse"></div>
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                                <div className="space-y-2 w-1/4">
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                <div className="flex space-x-2">
                                    <div className="h-4 w-8 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Teachers Directory</h1>
                <button
                    onClick={() => { setIsEditMode(false); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition flex items-center"
                >
                    + Add Teacher
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name, email, or qualification..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher Profile</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qualification</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Number</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTeachers.map((teacher, index) => (
                            <tr key={teacher.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                    <div className="font-bold text-gray-800">{teacher.username}</div>
                                    <div className="text-xs text-gray-500">{teacher.email || 'No Email'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                                    {teacher.qualification || <span className="text-gray-400 italic">Not set</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {teacher.phone || <span className="text-gray-400 italic">Not set</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEditClick(teacher)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                    <button onClick={() => handleDeleteClick(teacher.id, teacher.username)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {filteredTeachers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-50">No teachers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md my-auto relative">
                        <div className="flex justify-between mb-4 border-b pb-2">
                            <h2 className="text-xl font-bold">{isEditMode ? 'Edit Teacher' : 'Add Teacher'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username / Name *</label>
                                <input required type="text" name="username" value={formData.username} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone / Contact</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Qualification</label>
                                <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g. B.Ed, M.Sc" className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password {isEditMode && '(leave blank to keep unchanged)'}</label>
                                <input required={!isEditMode} type="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">
                                    {isEditMode ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
