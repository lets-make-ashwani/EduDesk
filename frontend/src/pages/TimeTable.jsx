import { useState, useEffect, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';
import { Clock, BookOpen, User } from 'lucide-react';

export default function TimeTable() {
    const { user } = useContext(AuthContext);
    const [timetables, setTimetables] = useState([]);
    const [classSubjects, setClassSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ class_subject: '', day_of_week: 'Monday', start_time: '', end_time: '' });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ttRes, csRes] = await Promise.all([
                api.get('timetables/').catch(() => ({ data: [] })),
                api.get('class-subjects/').catch(() => ({ data: [] }))
            ]);
            setTimetables(ttRes.data);
            setClassSubjects(csRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('timetables/', formData);
            alert('Time slot scheduled successfully!');
            setIsModalOpen(false);
            setFormData({ class_subject: '', day_of_week: 'Monday', start_time: '', end_time: '' });
            fetchData();
        } catch (err) {
            alert('Error scheduling time slot. Ensure all fields are filled.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this time slot?")) {
            try {
                await api.delete(`timetables/${id}/`);
                fetchData();
            } catch (err) { alert('Error deleting time slot'); }
        }
    };

    if (loading) {
        return <div className="p-8 animate-pulse bg-gray-200 h-64 rounded-xl"></div>;
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Clock className="w-6 h-6 mr-3 text-blue-600" /> Weekly Schedule
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {user?.role === 'teacher' ? "Your teaching schedule." : user?.role === 'student' ? "Your class schedule." : "Manage school-wide timetables."}
                    </p>
                </div>
                {['SCHOOL_ADMIN', 'admin', 'SUPERADMIN'].includes(user?.role) && (
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all">
                        + Assign Time Slot
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {days.map(day => {
                    const dayClasses = timetables.filter(t => t.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
                    if (dayClasses.length === 0 && !['SCHOOL_ADMIN', 'admin', 'SUPERADMIN'].includes(user?.role)) return null; // Hide empty days for students/teachers
                    
                    return (
                        <div key={day} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
                                <h2 className="font-bold text-slate-800 text-lg">{day}</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {dayClasses.length === 0 ? (
                                    <p className="text-slate-400 italic text-sm py-4">No classes scheduled.</p>
                                ) : (
                                    dayClasses.map(slot => (
                                        <div key={slot.id} className="relative p-5 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all group">
                                            {['SCHOOL_ADMIN', 'admin', 'SUPERADMIN'].includes(user?.role) && (
                                                <button onClick={() => handleDelete(slot.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold">&times;</button>
                                            )}
                                            <div className="flex items-center text-blue-600 font-bold mb-3 bg-blue-50 w-max px-3 py-1 rounded-lg text-sm">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-lg mb-2 truncate">{slot.subject_name}</h3>
                                            <div className="space-y-1.5 text-sm text-slate-500 font-medium">
                                                {user?.role !== 'student' && <p className="flex items-center"><BookOpen className="w-4 h-4 mr-2 text-slate-400" /> Class: {slot.class_name}</p>}
                                                {user?.role !== 'teacher' && <p className="flex items-center"><User className="w-4 h-4 mr-2 text-slate-400" /> {slot.teacher_name}</p>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">Assign Time Slot</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class & Subject (Teacher)</label>
                                <select required name="class_subject" value={formData.class_subject} onChange={handleInputChange} className="w-full border-gray-300 rounded-xl shadow-sm p-2.5 border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Select a teaching assignment...</option>
                                    {classSubjects.map(cs => (
                                        <option key={cs.id} value={cs.id}>{cs.school_class_name} - {cs.subject_name} ({cs.teacher_name})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                                <select required name="day_of_week" value={formData.day_of_week} onChange={handleInputChange} className="w-full border-gray-300 rounded-xl shadow-sm p-2.5 border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label><input required type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} className="w-full border-gray-300 rounded-xl shadow-sm p-2.5 border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><input required type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className="w-full border-gray-300 rounded-xl shadow-sm p-2.5 border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200">Save Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}