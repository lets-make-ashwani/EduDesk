import { useState, useEffect, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';

// ─── Teacher Profile Modal ────────────────────────────────────────────────────
function TeacherProfileModal({ teacher, onClose, onEdit }) {
    if (!teacher) return null;

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
    const getAvatarColor = (name) => {
        const colors = [
            ['#3b82f6', '#60a5fa'], ['#6366f1', '#818cf8'], ['#8b5cf6', '#a78bfa'],
            ['#ec4899', '#f472b6'], ['#14b8a6', '#2dd4bf'], ['#10b981', '#34d399'],
            ['#f59e0b', '#fbbf24'], ['#ef4444', '#f87171']
        ];
        const idx = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[idx];
    };

    const [from, to] = getAvatarColor(teacher.username);

    const InfoRow = ({ icon, label, value }) => (
        <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
            <span className="text-lg mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value || <span className="text-gray-400 font-normal italic">Not provided</span>}</p>
            </div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
                style={{ animation: 'slideUp 0.25s ease-out' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header / Hero ── */}
                <div className="relative flex-shrink-0" style={{ background: `linear-gradient(135deg, ${from}, ${to})`, padding: '32px 28px 24px' }}>
                    {/* Close btn */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors text-lg font-bold"
                    >
                        ×
                    </button>

                    {/* Avatar + name */}
                    <div className="flex items-end gap-5">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shadow-lg flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.5)' }}>
                            {getInitials(teacher.username)}
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-extrabold leading-tight drop-shadow">{teacher.username}</h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
                                    🎓 Teacher
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="overflow-y-auto flex-1 p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Personal & Contact Info */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">👤 Personal & Contact</h3>
                            <InfoRow icon="📧" label="Email Address" value={teacher.email} />
                            <InfoRow icon="📞" label="Phone Number" value={teacher.phone} />
                        </div>

                        {/* Professional Info */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">💼 Professional</h3>
                            <InfoRow icon="🏫" label="School" value={teacher.school_name || '—'} />
                            <InfoRow icon="📜" label="Qualification" value={teacher.qualification} />
                        </div>
                    </div>
                </div>

                {/* ── Footer actions ── */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400">Teacher ID: #{teacher.id}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => { onClose(); onEdit(teacher); }}
                            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                        >
                            ✏️ Edit Teacher
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}

export default function Teachers() {
    const { user: currentUser } = useContext(AuthContext);
    const [profileTeacher, setProfileTeacher] = useState(null);

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
    const getAvatarBg = (name) => {
        const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6', '#ef4444'];
        return colors[(name?.charCodeAt(0) || 0) % colors.length];
    };
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
        <div className="animate-in fade-in duration-500 relative">
            {/* ── Profile Modal ── */}
            {profileTeacher && (
                <TeacherProfileModal
                    teacher={profileTeacher}
                    onClose={() => setProfileTeacher(null)}
                    onEdit={(t) => { setProfileTeacher(null); handleEditClick(t); }}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Teachers Directory</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Click on a teacher name to view full profile</p>
                </div>
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
                            <tr
                                key={teacher.id}
                                className="hover:bg-blue-50 transition-colors cursor-pointer group"
                                onClick={() => setProfileTeacher(teacher)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"
                                            style={{ background: getAvatarBg(teacher.username) }}
                                        >
                                            {getInitials(teacher.username)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors underline-offset-2 group-hover:underline">
                                                {teacher.username}
                                            </div>
                                            <div className="text-xs text-gray-500">{teacher.email || 'No Email'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                                    {teacher.qualification || <span className="text-gray-400 italic">Not set</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {teacher.phone || <span className="text-gray-400 italic">Not set</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(teacher); }} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(teacher.id, teacher.username); }} className="text-red-600 hover:text-red-900">Delete</button>
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
