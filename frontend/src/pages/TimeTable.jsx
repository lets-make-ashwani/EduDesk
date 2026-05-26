import { useState, useEffect, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Clock, 
    BookOpen, 
    User, 
    Plus, 
    Trash2, 
    Calendar, 
    ListFilter, 
    CheckCircle, 
    AlertCircle, 
    X,
    FileText,
    Book
} from 'lucide-react';

export default function TimeTable() {
    const { user } = useContext(AuthContext);
    
    // Core data lists
    const [timetables, setTimetables] = useState([]);
    const [classSubjects, setClassSubjects] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // Loading & error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Tab control (for Admins)
    const isAdmin = ['SCHOOL_ADMIN', 'admin', 'SUPERADMIN'].includes(user?.role);
    const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'assignments' | 'subjects'

    // Modal Visibility
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    // Form inputs
    const [slotForm, setSlotForm] = useState({
        class_subject: '',
        day_of_week: 'Monday',
        start_time: '',
        end_time: ''
    });
    
    const [assignmentForm, setAssignmentForm] = useState({
        school_class: '',
        subject: '',
        teacher: ''
    });

    const [subjectForm, setSubjectForm] = useState({
        name: '',
        code: ''
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch core timetable and mapping lists from academics
            const [ttRes, csRes, subRes] = await Promise.all([
                api.get('/academics/timetables/').catch(() => ({ data: [] })),
                api.get('/academics/class-subjects/').catch(() => ({ data: [] })),
                api.get('/academics/subjects/').catch(() => ({ data: [] }))
            ]);
            
            setTimetables(ttRes.data);
            setClassSubjects(csRes.data);
            setSubjects(subRes.data);

            // If user is admin, fetch classes and teachers to populate dropdowns
            if (isAdmin) {
                const [classesRes, teachersRes] = await Promise.all([
                    api.get('/classes/').catch(() => ({ data: [] })),
                    api.get('/teachers/').catch(() => ({ data: [] }))
                ]);
                setClasses(classesRes.data);
                setTeachers(teachersRes.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch timetable data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Create handlers
    const handleCreateSubject = async (e) => {
        e.preventDefault();
        if (!subjectForm.name.trim()) {
            setFormError('Subject Name is required.');
            return;
        }

        setSubmitting(true);
        setFormError('');
        setFormSuccess('');

        try {
            const response = await api.post('/academics/subjects/', subjectForm);
            setSubjects(prev => [...prev, response.data]);
            setFormSuccess('Subject registered successfully!');
            setSubjectForm({ name: '', code: '' });
            setTimeout(() => {
                setShowSubjectModal(false);
                setFormSuccess('');
            }, 1200);
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.detail || 'Failed to create subject. Please check inputs.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!assignmentForm.school_class) {
            setFormError('Please select a Class.');
            return;
        }
        if (!assignmentForm.subject) {
            setFormError('Please select a Subject.');
            return;
        }
        if (!assignmentForm.teacher) {
            setFormError('Please select a Teacher.');
            return;
        }

        setSubmitting(true);
        setFormError('');
        setFormSuccess('');

        try {
            const response = await api.post('/academics/class-subjects/', assignmentForm);
            setClassSubjects(prev => [...prev, response.data]);
            setFormSuccess('Teaching assignment mapped successfully!');
            setAssignmentForm({ school_class: '', subject: '', teacher: '' });
            setTimeout(() => {
                setShowAssignmentModal(false);
                setFormSuccess('');
            }, 1200);
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.detail || 'Failed to map teaching assignment. Mappings must be unique.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        if (!slotForm.class_subject) {
            setFormError('Please select a Subject Class Mapping.');
            return;
        }
        if (!slotForm.start_time) {
            setFormError('Please select a start time.');
            return;
        }
        if (!slotForm.end_time) {
            setFormError('Please select an end time.');
            return;
        }

        setSubmitting(true);
        setFormError('');
        setFormSuccess('');

        try {
            const response = await api.post('/academics/timetables/', slotForm);
            setTimetables(prev => [...prev, response.data]);
            setFormSuccess('Time slot scheduled successfully!');
            setSlotForm({ class_subject: '', day_of_week: 'Monday', start_time: '', end_time: '' });
            setTimeout(() => {
                setShowSlotModal(false);
                setFormSuccess('');
            }, 1200);
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.detail || 'Failed to schedule time slot. Ensure timings are valid.');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete handlers
    const handleDeleteSubject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this Subject? Mapped assignments may be lost.")) return;
        try {
            await api.delete(`/academics/subjects/${id}/`);
            setSubjects(prev => prev.filter(item => item.id !== id));
            // Reload mappings and slots because cascade delete might occur on backend
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete subject.');
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this teaching assignment? Scheduled timetable slots will be removed.")) return;
        try {
            await api.delete(`/academics/class-subjects/${id}/`);
            setClassSubjects(prev => prev.filter(item => item.id !== id));
            // Reload timetables because cascade delete might occur on backend
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete teaching assignment.');
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm("Are you sure you want to remove this timetable slot?")) return;
        try {
            await api.delete(`/academics/timetables/${id}/`);
            setTimetables(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete timetable slot.');
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center space-y-4 mt-12 bg-red-50 rounded-2xl border border-red-100">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h2 className="text-xl font-bold text-red-800">Connection Error</h2>
                <p className="text-red-600">{error}</p>
                <button onClick={fetchData} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm">
                    Retry Loading
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
                            <Calendar className="mr-3 text-white w-8 h-8" />
                            Weekly Timetable
                        </h1>
                        <p className="text-blue-100 mt-1.5 font-medium">
                            {isAdmin 
                                ? "Manage your school's core subjects, teaching assignments, and timetable schedule." 
                                : user?.role === 'teacher' 
                                    ? "View your assigned subjects and scheduled teaching slots."
                                    : "View your classes and subject lectures."}
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="flex flex-wrap gap-2.5 mt-2 md:mt-0">
                            <button 
                                onClick={() => { setFormError(''); setFormSuccess(''); setShowSubjectModal(true); }}
                                className="flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-xl font-semibold text-white transition duration-200"
                            >
                                <Plus className="mr-1.5 w-4 h-4" /> Add Subject
                            </button>
                            <button 
                                onClick={() => { setFormError(''); setFormSuccess(''); setShowAssignmentModal(true); }}
                                className="flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-xl font-semibold text-white transition duration-200"
                            >
                                <Plus className="mr-1.5 w-4 h-4" /> Map Subject
                            </button>
                            <button 
                                onClick={() => { setFormError(''); setFormSuccess(''); setShowSlotModal(true); }}
                                className="flex items-center px-4 py-2.5 bg-white hover:bg-blue-50 active:scale-95 rounded-xl font-semibold text-indigo-700 transition duration-200 shadow-md"
                            >
                                <Plus className="mr-1.5 w-4 h-4" /> Schedule Slot
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Tab Switcher (Only visible to Admin) */}
            {isAdmin && (
                <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-2xl max-w-md">
                    {[
                        { id: 'schedule', label: 'Schedule', icon: Calendar },
                        { id: 'assignments', label: 'Teaching Map', icon: BookOpen },
                        { id: 'subjects', label: 'Subjects', icon: Book },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200 ${
                                    isActive 
                                        ? 'bg-white text-blue-700 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                }`}
                            >
                                <Icon className="mr-2 w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* TAB CONTENT: Weekly Schedule */}
            {activeTab === 'schedule' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {days.map((day) => {
                            const daySlots = timetables.filter(t => t.day_of_week.toLowerCase() === day.toLowerCase());
                            
                            // Hide empty days for students/teachers to keep it clean
                            if (daySlots.length === 0 && !isAdmin) return null;

                            return (
                                <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition duration-250">
                                    <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-extrabold text-gray-800 text-md">{day}</h3>
                                        <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                                            {daySlots.length} {daySlots.length === 1 ? 'lecture' : 'lectures'}
                                        </span>
                                    </div>
                                    <div className="p-4 flex-1 space-y-3 min-h-[140px] bg-slate-50/10">
                                        {daySlots.length === 0 ? (
                                            <div className="text-center py-10 text-gray-400 text-sm italic">
                                                No lectures scheduled.
                                            </div>
                                        ) : (
                                            daySlots
                                                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                                .map((slot) => (
                                                    <div key={slot.id} className="p-4 bg-white border border-gray-100 rounded-xl relative shadow-xs group hover:border-blue-200 transition duration-150">
                                                        {isAdmin && (
                                                            <button 
                                                                onClick={() => handleDeleteSlot(slot.id)}
                                                                className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                                                                title="Delete Time Slot"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between items-center pr-5">
                                                                <span className="font-extrabold text-gray-900 text-md">{slot.subject_name}</span>
                                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                                                                    {slot.class_name}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mt-1">
                                                                <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                                </span>
                                                                {user?.role !== 'teacher' && (
                                                                    <span className="flex items-center text-gray-500">
                                                                        <User className="w-3 h-3 mr-1 text-gray-400" />
                                                                        {slot.teacher_name || 'No Teacher'}
                                                                    </span>
                                                                )}
                                                            </div>
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

            {/* TAB CONTENT: Teaching Map Assignments */}
            {activeTab === 'assignments' && isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Teaching Mappings</h2>
                            <p className="text-slate-500 text-sm mt-0.5">Define subject teachers for each classroom grade.</p>
                        </div>
                        <button 
                            onClick={() => { setFormError(''); setFormSuccess(''); setShowAssignmentModal(true); }}
                            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-semibold text-sm transition"
                        >
                            <Plus className="mr-1.5 w-4 h-4" /> Map Subject
                        </button>
                    </div>

                    {classSubjects.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-semibold text-lg">No Subjects Mapped Yet</p>
                            <p className="text-sm text-gray-400 mt-1">Map school classes with subjects and teachers to enable scheduling.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600">Class</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600">Subject</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600">Teacher Assigned</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classSubjects.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition">
                                            <td className="py-4 px-6 font-bold text-gray-900">{item.class_name}</td>
                                            <td className="py-4 px-6 font-medium text-gray-700">{item.subject_name}</td>
                                            <td className="py-4 px-6 text-gray-600 font-semibold">{item.teacher_name || 'No teacher assigned'}</td>
                                            <td className="py-4 px-6 text-right">
                                                <button 
                                                    onClick={() => handleDeleteAssignment(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                                                    title="Delete Mapping"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: Subjects */}
            {activeTab === 'subjects' && isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Academic Subjects Directory</h2>
                            <p className="text-slate-500 text-sm mt-0.5">Register core courses available in the school program.</p>
                        </div>
                        <button 
                            onClick={() => { setFormError(''); setFormSuccess(''); setShowSubjectModal(true); }}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-semibold text-sm transition"
                        >
                            <Plus className="mr-1.5 w-4 h-4" /> Add Subject
                        </button>
                    </div>

                    {subjects.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <Book className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-semibold text-lg">No Subjects Registered</p>
                            <p className="text-sm text-gray-400 mt-1">Register courses like Mathematics, Biology, English literature, etc.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600">Subject Name</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600">Subject Code</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition">
                                            <td className="py-4 px-6 font-bold text-gray-900">{item.name}</td>
                                            <td className="py-4 px-6 font-semibold text-gray-500">{item.code || '—'}</td>
                                            <td className="py-4 px-6 text-right">
                                                <button 
                                                    onClick={() => handleDeleteSubject(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                                                    title="Delete Subject"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL: Register Subject */}
            {showSubjectModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Book className="mr-2 text-blue-600 w-5 h-5" />
                                Add Academic Subject
                            </h2>
                            <button 
                                onClick={() => setShowSubjectModal(false)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                {formError}
                            </div>
                        )}

                        {formSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleCreateSubject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={subjectForm.name}
                                    onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Mathematics" 
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject Code (Optional)</label>
                                <input 
                                    type="text" 
                                    value={subjectForm.code}
                                    onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value }))}
                                    placeholder="e.g. MATH-101" 
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 font-semibold"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowSubjectModal(false)} 
                                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition flex items-center shadow-md disabled:opacity-55"
                                >
                                    {submitting ? 'Registering...' : 'Add Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Map Class & Subject (Teaching Assignment) */}
            {showAssignmentModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <BookOpen className="mr-2 text-indigo-600 w-5 h-5" />
                                Map Teaching Assignment
                            </h2>
                            <button 
                                onClick={() => setShowAssignmentModal(false)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                {formError}
                            </div>
                        )}

                        {formSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleCreateAssignment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Classroom Grade</label>
                                <select 
                                    required
                                    value={assignmentForm.school_class}
                                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, school_class: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                >
                                    <option value="">Select class...</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Core Subject</label>
                                <select 
                                    required
                                    value={assignmentForm.subject}
                                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                >
                                    <option value="">Select subject...</option>
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name} {sub.code ? `(${sub.code})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Assigned Teacher</label>
                                <select 
                                    required
                                    value={assignmentForm.teacher}
                                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, teacher: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                >
                                    <option value="">Select teacher...</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.username} {t.email ? `(${t.email})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAssignmentModal(false)} 
                                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition flex items-center shadow-md disabled:opacity-55"
                                >
                                    {submitting ? 'Mapping...' : 'Map Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Assign Timetable Slot */}
            {showSlotModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Clock className="mr-2 text-indigo-600 w-5 h-5" />
                                Schedule Timetable Slot
                            </h2>
                            <button 
                                onClick={() => setShowSlotModal(false)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                {formError}
                            </div>
                        )}

                        {formSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleCreateSlot} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Class Subject (Teacher)</label>
                                <select 
                                    required
                                    value={slotForm.class_subject}
                                    onChange={(e) => setSlotForm(prev => ({ ...prev, class_subject: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                >
                                    <option value="">Select subject map...</option>
                                    {classSubjects.map(cs => (
                                        <option key={cs.id} value={cs.id}>{cs.class_name} - {cs.subject_name} ({cs.teacher_name || 'No Teacher'})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Day of Week</label>
                                <select 
                                    required
                                    value={slotForm.day_of_week}
                                    onChange={(e) => setSlotForm(prev => ({ ...prev, day_of_week: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                >
                                    {days.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Time</label>
                                    <input 
                                        type="time" 
                                        required
                                        value={slotForm.start_time}
                                        onChange={(e) => setSlotForm(prev => ({ ...prev, start_time: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">End Time</label>
                                    <input 
                                        type="time" 
                                        required
                                        value={slotForm.end_time}
                                        onChange={(e) => setSlotForm(prev => ({ ...prev, end_time: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowSlotModal(false)} 
                                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition flex items-center shadow-md disabled:opacity-55"
                                >
                                    {submitting ? 'Scheduling...' : 'Save Slot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}