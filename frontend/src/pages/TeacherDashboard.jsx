import { useState, useEffect, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    FiBook, 
    FiUpload, 
    FiDownload, 
    FiFileText, 
    FiPlus, 
    FiTrash2, 
    FiCalendar, 
    FiClock, 
    FiAlertCircle, 
    FiCheckCircle, 
    FiGrid,
    FiX,
    FiPaperclip,
    FiInfo
} from 'react-icons/fi';

export default function TeacherDashboard() {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ homeworks: 0, materials: 0, classes: 0 });
    const [activeTab, setActiveTab] = useState('overview');
    
    // Core data lists
    const [classSubjects, setClassSubjects] = useState([]);
    const [homeworks, setHomeworks] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [timetables, setTimetables] = useState([]);
    
    // Status states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    
    // Modal states
    const [showHomeworkModal, setShowHomeworkModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);

    // Form inputs
    const [homeworkForm, setHomeworkForm] = useState({
        classSubjectId: '',
        title: '',
        description: '',
        dueDate: '',
        file: null
    });
    const [materialForm, setMaterialForm] = useState({
        classSubjectId: '',
        title: '',
        description: '',
        file: null
    });

    const getMediaUrl = (fileUrl) => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            return fileUrl;
        }
        const hostUrl = api.defaults.baseURL.replace(/\/api\/?$/, '');
        return `${hostUrl}${fileUrl}`;
    };

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [subjectsRes, homeworksRes, materialsRes, timetablesRes] = await Promise.all([
                api.get('/academics/class-subjects/'),
                api.get('/academics/homeworks/'),
                api.get('/academics/study-materials/'),
                api.get('/academics/timetables/')
            ]);
            setClassSubjects(subjectsRes.data);
            setHomeworks(homeworksRes.data);
            setMaterials(materialsRes.data);
            setTimetables(timetablesRes.data);
            setStats({
                classes: subjectsRes.data.length,
                homeworks: homeworksRes.data.length,
                materials: materialsRes.data.length
            });
        } catch (err) {
            console.error("Error fetching teacher dashboard data", err);
            setError('Failed to load dashboard data. Please reload the page.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Form validation and submit handlers
    const handleSubmitHomework = async (e) => {
        e.preventDefault();
        if (!homeworkForm.classSubjectId) {
            setFormError('Please select a Class & Subject.');
            return;
        }
        if (!homeworkForm.title.trim()) {
            setFormError('Please enter homework title.');
            return;
        }
        if (!homeworkForm.dueDate) {
            setFormError('Please select a due date.');
            return;
        }

        setSubmitting(true);
        setFormError('');
        setFormSuccess('');
        
        const formData = new FormData();
        formData.append('class_subject', homeworkForm.classSubjectId);
        formData.append('title', homeworkForm.title);
        formData.append('description', homeworkForm.description);
        formData.append('due_date', homeworkForm.dueDate);
        if (homeworkForm.file) {
            formData.append('file', homeworkForm.file);
        }

        try {
            const response = await api.post('/academics/homeworks/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setHomeworks(prev => [response.data, ...prev]);
            setStats(prev => ({ ...prev, homeworks: prev.homeworks + 1 }));
            setFormSuccess('Homework assigned successfully!');
            setHomeworkForm({ classSubjectId: '', title: '', description: '', dueDate: '', file: null });
            
            setTimeout(() => {
                setShowHomeworkModal(false);
                setFormSuccess('');
            }, 1200);
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.detail || 'Failed to assign homework. Please verify fields.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitMaterial = async (e) => {
        e.preventDefault();
        if (!materialForm.classSubjectId) {
            setFormError('Please select a Class & Subject.');
            return;
        }
        if (!materialForm.title.trim()) {
            setFormError('Please enter study material title.');
            return;
        }
        if (!materialForm.file) {
            setFormError('Please attach a study material file (PDF, DOCX, etc.).');
            return;
        }

        setSubmitting(true);
        setFormError('');
        setFormSuccess('');
        
        const formData = new FormData();
        formData.append('class_subject', materialForm.classSubjectId);
        formData.append('title', materialForm.title);
        formData.append('description', materialForm.description);
        formData.append('file', materialForm.file);

        try {
            const response = await api.post('/academics/study-materials/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMaterials(prev => [response.data, ...prev]);
            setStats(prev => ({ ...prev, materials: prev.materials + 1 }));
            setFormSuccess('Study material uploaded successfully!');
            setMaterialForm({ classSubjectId: '', title: '', description: '', file: null });
            
            setTimeout(() => {
                setShowMaterialModal(false);
                setFormSuccess('');
            }, 1200);
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.detail || 'Failed to upload study material. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Deletion handlers
    const handleDeleteHomework = async (id) => {
        if (!window.confirm("Are you sure you want to delete this homework assignment?")) return;
        try {
            await api.delete(`/academics/homeworks/${id}/`);
            setHomeworks(prev => prev.filter(hw => hw.id !== id));
            setStats(prev => ({ ...prev, homeworks: Math.max(0, prev.homeworks - 1) }));
        } catch (err) {
            console.error(err);
            alert('Failed to delete homework assignment.');
        }
    };

    const handleDeleteMaterial = async (id) => {
        if (!window.confirm("Are you sure you want to delete this study material?")) return;
        try {
            await api.delete(`/academics/study-materials/${id}/`);
            setMaterials(prev => prev.filter(mat => mat.id !== id));
            setStats(prev => ({ ...prev, materials: Math.max(0, prev.materials - 1) }));
        } catch (err) {
            console.error(err);
            alert('Failed to delete study material.');
        }
    };

    // Timetable days mapping
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center space-y-4 mt-12 bg-red-50 rounded-2xl border border-red-100">
                <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h2 className="text-xl font-bold text-red-800">Connection Error</h2>
                <p className="text-red-600">{error}</p>
                <button onClick={fetchData} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm">
                    Retry Loading
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-3xl shadow-xl text-white">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Teacher Workspace</h1>
                        <p className="text-blue-100 mt-1.5 font-medium">
                            Welcome back, {user?.first_name || user?.username || 'Teacher'}! Manage your classes, assignments, and materials.
                        </p>
                    </div>
                    <div className="flex space-x-3 mt-2 md:mt-0">
                        <button 
                            onClick={() => { setFormError(''); setFormSuccess(''); setShowHomeworkModal(true); }}
                            className="flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-xl font-semibold text-white transition duration-200"
                        >
                            <FiPlus className="mr-2 text-lg" /> Assign Homework
                        </button>
                        <button 
                            onClick={() => { setFormError(''); setFormSuccess(''); setShowMaterialModal(true); }}
                            className="flex items-center px-4 py-2.5 bg-white hover:bg-blue-50 active:scale-95 rounded-xl font-semibold text-indigo-700 transition duration-200 shadow-md"
                        >
                            <FiUpload className="mr-2 text-lg" /> Upload Material
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Tab Switcher */}
            <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-2xl max-w-2xl">
                {[
                    { id: 'overview', label: 'Overview', icon: FiGrid },
                    { id: 'classes', label: 'My Classes', icon: FiBook },
                    { id: 'homeworks', label: 'Homeworks', icon: FiUpload },
                    { id: 'materials', label: 'Study Materials', icon: FiFileText },
                    { id: 'timetable', label: 'Timetable', icon: FiCalendar },
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-250 ${
                                isActive 
                                    ? 'bg-white text-blue-700 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }`}
                        >
                            <Icon className="mr-2 text-base" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition duration-200">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><FiBook className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">My Classes</p>
                                <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.classes}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition duration-200">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><FiUpload className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Assigned Homeworks</p>
                                <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.homeworks}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition duration-200">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><FiFileText className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Study Materials</p>
                                <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.materials}</p>
                            </div>
                        </div>
                    </div>

                    {/* Today's Schedule Overview */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <FiCalendar className="mr-2.5 text-blue-600 text-lg" />
                                Today's Schedule
                            </h2>
                            <button onClick={() => setActiveTab('timetable')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                                View Full Timetable &rarr;
                            </button>
                        </div>

                        {(() => {
                            const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                            const todaysClasses = timetables.filter(t => t.day_of_week.toLowerCase() === todayName.toLowerCase());
                            
                            if (todaysClasses.length === 0) {
                                return (
                                    <div className="py-8 text-center text-gray-500 flex flex-col items-center justify-center space-y-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <FiClock className="w-8 h-8 text-gray-400" />
                                        <p className="font-medium">No classes scheduled for today ({todayName})</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {todaysClasses.map(slot => (
                                        <div key={slot.id} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{slot.subject_name}</h3>
                                                <p className="text-sm text-gray-600 font-semibold mt-0.5">{slot.class_name}</p>
                                            </div>
                                            <div className="flex items-center text-sm font-medium text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm">
                                                <FiClock className="mr-1.5" />
                                                {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: Classes */}
            {activeTab === 'classes' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Assigned Subject & Classes</h2>
                    {classSubjects.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FiBook className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-medium text-lg">No Subjects Assigned</p>
                            <p className="text-sm text-gray-400 mt-1">Please contact your administrator to map subjects to you.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600">Class Name</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600">Subject Name</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600">Subject Code</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classSubjects.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50/55 transition duration-150">
                                            <td className="py-4 px-6 font-semibold text-gray-900">{item.class_name}</td>
                                            <td className="py-4 px-6 font-medium text-gray-700">{item.subject_name}</td>
                                            <td className="py-4 px-6 text-gray-500 font-semibold">{item.subject?.code || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: Homeworks */}
            {activeTab === 'homeworks' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Homework Directory</h2>
                        <button 
                            onClick={() => { setFormError(''); setFormSuccess(''); setShowHomeworkModal(true); }}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-semibold text-sm transition duration-200"
                        >
                            <FiPlus className="mr-1.5" /> New Homework
                        </button>
                    </div>

                    {homeworks.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <FiUpload className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-semibold text-lg">No Homework Assigned Yet</p>
                            <p className="text-sm text-gray-400 mt-1">Assign homework to your student groups via the Assign Homework button.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {homeworks.map((hw) => (
                                <div key={hw.id} className="p-5 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition duration-250 bg-gradient-to-r from-white to-slate-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1.5 max-w-3xl">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">{hw.class_name}</span>
                                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">{hw.subject_name}</span>
                                            <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center">
                                                <FiCalendar className="mr-1" /> Due {hw.due_date}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900">{hw.title}</h3>
                                        <p className="text-gray-600 text-sm">{hw.description || 'No instructions provided.'}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 self-end md:self-center">
                                        {hw.file && (
                                            <a 
                                                href={getMediaUrl(hw.file)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-100 transition shadow-sm"
                                                title="Download Attachment"
                                            >
                                                <FiDownload className="w-4.5 h-4.5" />
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteHomework(hw.id)}
                                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl border border-red-100 transition shadow-sm"
                                            title="Delete Assignment"
                                        >
                                            <FiTrash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: Study Materials */}
            {activeTab === 'materials' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Study Materials Directory</h2>
                        <button 
                            onClick={() => { setFormError(''); setFormSuccess(''); setShowMaterialModal(true); }}
                            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-semibold text-sm transition duration-200"
                        >
                            <FiPlus className="mr-1.5" /> Upload Material
                        </button>
                    </div>

                    {materials.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <FiFileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-semibold text-lg">No Study Materials Uploaded Yet</p>
                            <p className="text-sm text-gray-400 mt-1">Upload reference materials, syllabus, or guides to share with students.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {materials.map((mat) => (
                                <div key={mat.id} className="p-5 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition duration-250 bg-gradient-to-r from-white to-slate-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1.5 max-w-3xl">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold uppercase tracking-wider">{mat.class_name}</span>
                                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider">{mat.subject_name}</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900">{mat.title}</h3>
                                        {mat.description && <p className="text-gray-600 text-sm">{mat.description}</p>}
                                    </div>
                                    <div className="flex items-center space-x-2 self-end md:self-center">
                                        <a 
                                            href={getMediaUrl(mat.file)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-100 transition shadow-sm"
                                            title="Download File"
                                        >
                                            <FiDownload className="w-4.5 h-4.5" />
                                        </a>
                                        <button 
                                            onClick={() => handleDeleteMaterial(mat.id)}
                                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl border border-red-100 transition shadow-sm"
                                            title="Delete Material"
                                        >
                                            <FiTrash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: Timetable */}
            {activeTab === 'timetable' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Weekly Class Schedule</h2>
                        <p className="text-gray-500 text-sm">Below is your complete mapped schedule of lectures throughout the week.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {daysOfWeek.map((day) => {
                            const daySlots = timetables.filter(t => t.day_of_week.toLowerCase() === day.toLowerCase());
                            return (
                                <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900 text-md">{day}</h3>
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200/80 rounded-md text-gray-600">
                                            {daySlots.length} {daySlots.length === 1 ? 'class' : 'classes'}
                                        </span>
                                    </div>
                                    <div className="p-4 flex-1 space-y-3 min-h-[140px] bg-slate-50/10">
                                        {daySlots.length === 0 ? (
                                            <p className="text-center text-gray-400 text-sm mt-8">No scheduled classes</p>
                                        ) : (
                                            daySlots
                                                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                                .map((slot) => (
                                                    <div key={slot.id} className="p-3.5 bg-white border border-gray-100 rounded-xl shadow-xs space-y-1.5">
                                                        <div className="flex justify-between items-start">
                                                            <span className="font-extrabold text-gray-900 text-sm">{slot.subject_name}</span>
                                                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                                                                {slot.class_name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-xs text-gray-500 font-semibold">
                                                            <FiClock className="mr-1 text-gray-400" />
                                                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* MODAL: Assign Homework */}
            {showHomeworkModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-xl w-full p-6 relative overflow-hidden transition-all transform scale-100">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <FiUpload className="mr-2 text-blue-600" />
                                Assign Homework
                            </h2>
                            <button 
                                onClick={() => setShowHomeworkModal(false)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                {formError}
                            </div>
                        )}

                        {formSuccess && (
                            <div className="mb-4 p-3.5 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleSubmitHomework} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Class & Subject</label>
                                <select 
                                    value={homeworkForm.classSubjectId}
                                    onChange={(e) => setHomeworkForm(prev => ({ ...prev, classSubjectId: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 font-semibold"
                                >
                                    <option value="">Select subject-class map...</option>
                                    {classSubjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.class_name} - {sub.subject_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Homework Title</label>
                                    <input 
                                        type="text" 
                                        value={homeworkForm.title}
                                        onChange={(e) => setHomeworkForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g. Worksheet on Quadratic Equations" 
                                        className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Due Date</label>
                                    <input 
                                        type="date" 
                                        value={homeworkForm.dueDate}
                                        onChange={(e) => setHomeworkForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Instructions / Description</label>
                                <textarea 
                                    rows="3" 
                                    value={homeworkForm.description}
                                    onChange={(e) => setHomeworkForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter assignments instructions or reading guidance..."
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Attach File (PDF, DOCX, etc. - Optional)</label>
                                <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        onChange={(e) => setHomeworkForm(prev => ({ ...prev, file: e.target.files[0] }))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="text-center space-y-1">
                                        <FiPaperclip className="mx-auto w-6 h-6 text-gray-400" />
                                        <p className="text-xs font-semibold text-gray-600">
                                            {homeworkForm.file ? homeworkForm.file.name : "Click or drag to select file"}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-semibold">Maximum file size: 10MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowHomeworkModal(false)} 
                                    className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition flex items-center shadow-md disabled:opacity-55"
                                >
                                    {submitting ? 'Assigning...' : 'Assign Homework'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Upload Study Material */}
            {showMaterialModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-xl w-full p-6 relative overflow-hidden transition-all transform scale-100">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <FiFileText className="mr-2 text-indigo-600" />
                                Upload Study Material
                            </h2>
                            <button 
                                onClick={() => setShowMaterialModal(false)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                {formError}
                            </div>
                        )}

                        {formSuccess && (
                            <div className="mb-4 p-3.5 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleSubmitMaterial} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Class & Subject</label>
                                <select 
                                    value={materialForm.classSubjectId}
                                    onChange={(e) => setMaterialForm(prev => ({ ...prev, classSubjectId: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                >
                                    <option value="">Select subject-class map...</option>
                                    {classSubjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.class_name} - {sub.subject_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Material Title</label>
                                <input 
                                    type="text" 
                                    value={materialForm.title}
                                    onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Chapter 3 Calculus Reference Guide" 
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description / Chapters Cover</label>
                                <textarea 
                                    rows="3" 
                                    value={materialForm.description}
                                    onChange={(e) => setMaterialForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter reference descriptions or study tips..."
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Attach Study File (PDF, slides, DOCX - Required)</label>
                                <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        onChange={(e) => setMaterialForm(prev => ({ ...prev, file: e.target.files[0] }))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <div className="text-center space-y-1">
                                        <FiPaperclip className="mx-auto w-6 h-6 text-gray-400" />
                                        <p className="text-xs font-semibold text-gray-600">
                                            {materialForm.file ? materialForm.file.name : "Click or drag to select file"}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-semibold">Maximum file size: 10MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowMaterialModal(false)} 
                                    className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition flex items-center shadow-md disabled:opacity-55"
                                >
                                    {submitting ? 'Uploading...' : 'Upload Material'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
