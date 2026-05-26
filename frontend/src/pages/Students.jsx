import { useEffect, useState, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';

// ─── Student Profile Modal ────────────────────────────────────────────────────
function StudentProfileModal({ student, schools, classes, sections, onClose, onEdit }) {
    if (!student) return null;

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
    const getAvatarColor = (name) => {
        const colors = [
            ['#6366f1', '#818cf8'], ['#8b5cf6', '#a78bfa'], ['#ec4899', '#f472b6'],
            ['#14b8a6', '#2dd4bf'], ['#f59e0b', '#fbbf24'], ['#10b981', '#34d399'],
            ['#3b82f6', '#60a5fa'], ['#ef4444', '#f87171'],
        ];
        const idx = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[idx];
    };

    const [from, to] = getAvatarColor(student.name);

    const schoolName  = schools.find(s => s.id === student.school)?.name  || student.school_name  || '—';
    const className   = classes.find(c => c.id === student.student_class)?.name || student.class_name   || '—';
    const sectionName = sections.find(s => s.id === student.section)?.name || student.section_name || '—';

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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
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
                            {getInitials(student.name)}
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-extrabold leading-tight drop-shadow">{student.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
                                    {student.gender || 'Unknown Gender'}
                                </span>
                                {student.blood_group && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
                                        🩸 {student.blood_group}
                                    </span>
                                )}
                                {student.age && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
                                        Age: {student.age}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Class badge row */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        <div className="flex items-center gap-1.5 text-white text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: '5px 10px' }}>
                            🏫 {schoolName}
                        </div>
                        <div className="flex items-center gap-1.5 text-white text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: '5px 10px' }}>
                            📚 Class {className} — Section {sectionName}
                        </div>
                        {student.roll_number && (
                            <div className="flex items-center gap-1.5 text-white text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: '5px 10px' }}>
                                🎫 Roll #{student.roll_number}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="overflow-y-auto flex-1 p-6 space-y-5">

                    {/* Login Credentials */}
                    {student.username && (
                        <div className="rounded-xl p-4 border" style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', borderColor: '#bfdbfe' }}>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">🔐 Login Credentials</h3>
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Username</p>
                                    <span className="font-mono text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">{student.username}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Password</p>
                                    <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-lg">{student.temp_password || '••••••••'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Personal Info */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">👤 Personal Information</h3>
                            <InfoRow icon="📋" label="Admission No." value={student.admission_number} />
                            <InfoRow icon="📅" label="Admission Date" value={student.admission_date} />
                            <InfoRow icon="⚧" label="Gender" value={student.gender} />
                            <InfoRow icon="🎂" label="Age" value={student.age ? `${student.age} years` : null} />
                            <InfoRow icon="🩸" label="Blood Group" value={student.blood_group} />
                        </div>

                        {/* Family Info */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">👨‍👩‍👧 Family Information</h3>
                            <InfoRow icon="👨" label="Father's Name" value={student.father_name} />
                            <InfoRow icon="👩" label="Mother's Name" value={student.mother_name} />
                            <InfoRow icon="📞" label="Parent Phone" value={student.parent_phone} />
                            <InfoRow icon="📱" label="Alt. Contact" value={student.contact_number} />
                        </div>

                        {/* Academic Info */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">🎓 Academic Placement</h3>
                            <InfoRow icon="🏫" label="School" value={schoolName} />
                            <InfoRow icon="📚" label="Class" value={className} />
                            <InfoRow icon="🔠" label="Section" value={sectionName} />
                            <InfoRow icon="🎫" label="Roll Number" value={student.roll_number} />
                        </div>

                        {/* ID Numbers */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">🪪 ID & Documents</h3>
                            <InfoRow icon="🆔" label="Aadhar Number" value={student.aadhar_number} />
                            <InfoRow icon="📄" label="APAAR Number" value={student.apaar_number} />
                        </div>
                    </div>
                </div>

                {/* ── Footer actions ── */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400">Student ID: #{student.id}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => { onClose(); onEdit(student); }}
                            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            ✏️ Edit Student
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

// ─── Main Students Page ───────────────────────────────────────────────────────
export default function Students() {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [formErrors, setFormErrors] = useState(null);
    const [bulkErrors, setBulkErrors] = useState(null);

    // Profile modal state
    const [profileStudent, setProfileStudent] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        parent_phone: '',
        gender: '',
        age: '',
        roll_number: '',
        father_name: '',
        mother_name: '',
        contact_number: '',
        admission_number: '',
        aadhar_number: '',
        apaar_number: '',
        blood_group: '',
        school: '',
        student_class: '',
        section: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsRes, schoolsRes, classesRes, sectionsRes] = await Promise.all([
                api.get('students/'),
                api.get('schools/'),
                api.get('classes/'),
                api.get('sections/')
            ]);
            setStudents(studentsRes.data);
            setSchools(schoolsRes.data);
            setClasses(classesRes.data);
            setSections(sectionsRes.data);

            setFormData(prev => ({
                ...prev,
                school: schoolsRes.data.length > 0 ? schoolsRes.data[0].id : '',
                student_class: classesRes.data.length > 0 ? classesRes.data[0].id : '',
                section: sectionsRes.data.length > 0 ? sectionsRes.data[0].id : ''
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitSingle = async (e) => {
        e.preventDefault();

        const payload = { ...formData };
        if (payload.age === '') payload.age = null;
        if (payload.admission_number === '') payload.admission_number = null;
        if (payload.aadhar_number === '') payload.aadhar_number = null;
        if (payload.apaar_number === '') payload.apaar_number = null;
        if (payload.roll_number === '') payload.roll_number = null;

        try {
            if (isEditMode && editingStudentId) {
                await api.put(`students/${editingStudentId}/`, payload);
                alert('Student updated successfully!');
            } else {
                await api.post('students/', payload);
                alert('Student added successfully!');
            }
            closeSingleModal();
            fetchData();
        } catch (err) {
            setFormErrors(err.response?.data || { general: 'Error saving student. Please check the network log.' });
        }
    };

    const handleEditClick = (student) => {
        setIsEditMode(true);
        setEditingStudentId(student.id);
        setFormData({
            name: student.name || '',
            parent_phone: student.parent_phone || '',
            gender: student.gender || '',
            age: student.age || '',
            roll_number: student.roll_number || '',
            father_name: student.father_name || '',
            mother_name: student.mother_name || '',
            contact_number: student.contact_number || '',
            admission_number: student.admission_number || '',
            aadhar_number: student.aadhar_number || '',
            apaar_number: student.apaar_number || '',
            blood_group: student.blood_group || '',
            school: student.school || (schools.length > 0 ? schools[0].id : ''),
            student_class: student.student_class || (classes.length > 0 ? classes[0].id : ''),
            section: student.section || (sections.length > 0 ? sections[0].id : '')
        });
        setIsSingleModalOpen(true);
    };

    const handleDeleteClick = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete student: ${name}?`)) {
            try {
                await api.delete(`students/${id}/`);
                fetchData();
            } catch (err) {
                alert("Error deleting student.");
                console.error(err);
            }
        }
    };

    const closeSingleModal = () => {
        setIsSingleModalOpen(false);
        setIsEditMode(false);
        setEditingStudentId(null);
        setFormErrors(null);
        setFormData({
            name: '', parent_phone: '', gender: '', age: '', roll_number: '', father_name: '', mother_name: '', contact_number: '', admission_number: '', aadhar_number: '', apaar_number: '', blood_group: '',
            school: schools.length > 0 ? schools[0].id : '',
            student_class: classes.length > 0 ? classes[0].id : '',
            section: sections.length > 0 ? sections[0].id : ''
        });
    };

    const handleDeleteAllClick = async () => {
        if (window.confirm("WARNING: Are you absolutely sure you want to DELETE ALL STUDENTS? This action cannot be undone and will empty the entire database of students.")) {
            try {
                await api.delete('students/delete_all/');
                fetchData();
                alert("All students have been deleted.");
            } catch (err) {
                alert("Error deleting all students.");
                console.error(err);
            }
        }
    };

    const handleGenerateCredentials = async () => {
        setDropdownOpen(false);
        if (!window.confirm("This will generate username & password for all students who don't have login credentials yet. Continue?")) return;
        try {
            const res = await api.post('students/generate_credentials/');
            const { message, errors } = res.data;
            if (errors && errors.length > 0) {
                alert(`${message}\n\nErrors:\n${errors.join('\n')}`);
            } else {
                alert(`✅ ${message}`);
            }
            fetchData();
        } catch (err) {
            alert('Error generating credentials: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        setBulkErrors(null);
        if (!csvFile) { alert("Please select a file"); return; }

        const data = new FormData();
        data.append('file', csvFile);
        data.append('school_id', formData.school);

        try {
            const res = await api.post('students/bulk_upload/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.errors && res.data.errors.length > 0) {
                setBulkErrors(res.data.errors);
            } else {
                alert('Bulk upload completely successful!');
                setIsBulkModalOpen(false);
                setCsvFile(null);
            }
            fetchData();
        } catch (err) {
            setBulkErrors(err.response?.data?.errors || [err.response?.data?.error || 'Unknown error occurred during bulk upload.']);
        }
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
    const getAvatarBg = (name) => {
        const colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#10b981','#3b82f6','#ef4444'];
        return colors[(name?.charCodeAt(0) || 0) % colors.length];
    };

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500 relative">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-12 bg-gray-50 border-b border-gray-200 animate-pulse"></div>
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                                <div className="space-y-2 w-1/4">
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                                </div>
                                <div className="space-y-2 w-1/4">
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                </div>
                                <div className="space-y-2 w-1/4">
                                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                </div>
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
            {profileStudent && (
                <StudentProfileModal
                    student={profileStudent}
                    schools={schools}
                    classes={classes}
                    sections={sections}
                    onClose={() => setProfileStudent(null)}
                    onEdit={(s) => { setProfileStudent(null); handleEditClick(s); }}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Students Directory</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Click on a student name to view full profile</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition flex items-center"
                    >
                        + Add Student
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { setIsSingleModalOpen(true); setDropdownOpen(false); }}>Add Single Student</button>
                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { setIsBulkModalOpen(true); setDropdownOpen(false); }}>Bulk Import (CSV)</button>
                            <button className="block w-full text-left px-4 py-2 text-sm text-green-700 font-medium hover:bg-green-50" onClick={handleGenerateCredentials}>🔑 Generate Missing Credentials</button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button className="block w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700" onClick={() => { handleDeleteAllClick(); setDropdownOpen(false); }}>⚠️ Delete All Students</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3 mb-6">
                <span className="text-blue-500 mt-0.5 text-lg">ℹ️</span>
                <div>
                    <h4 className="font-bold text-blue-800 text-sm">Student Access Credentials</h4>
                    <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                        Every student registered in the system is automatically provisioned a unique login account.
                        Their specific <strong>Login ID</strong> and initial <strong>Password</strong> are shown in the directory table below.
                        <strong> Click any student's name</strong> to view their full profile.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration Info</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Login ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Profile</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class Info</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacts</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr
                                key={student.id}
                                className="hover:bg-indigo-50 transition-colors cursor-pointer group"
                                onClick={() => setProfileStudent(student)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{student.admission_number || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">Admitted: {student.admission_date}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {student.username ? (
                                        <div>
                                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-max">{student.username}</span>
                                            <p className="text-[10px] text-gray-500 font-semibold mt-1">Pwd: <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded">{student.temp_password || 'Changed'}</span></p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">No account linked</span>
                                    )}
                                </td>
                                {/* Clickable student name cell with avatar */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform"
                                            style={{ background: getAvatarBg(student.name) }}
                                        >
                                            {getInitials(student.name)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors underline-offset-2 group-hover:underline">
                                                {student.name}
                                            </div>
                                            <div className="text-xs text-gray-500">{student.gender || 'Unknown'} | {student.blood_group || 'No BG'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                    <div className="font-medium">{student.class_name} - {student.section_name}</div>
                                    <div className="text-xs text-gray-500">Roll: {student.roll_number || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    P: {student.parent_phone || student.contact_number || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(student); }} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(student.id, student.name); }} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 bg-gray-50">No students found. Add one to get started!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isSingleModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto pt-20">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl my-auto relative">
                        <div className="flex justify-between mb-4 border-b pb-2">
                            <h2 className="text-xl font-bold">{isEditMode ? 'Edit Student' : 'Add Single Student'}</h2>
                            <button onClick={closeSingleModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>

                        {schools.length === 0 || classes.length === 0 || sections.length === 0 ? (
                            <div className="text-amber-600 mb-4 p-3 bg-amber-50 rounded text-sm">
                                Notice: You should have at least one School, Class, and Section created before adding students manually.
                            </div>
                        ) : null}

                        {formErrors && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm whitespace-pre-wrap">
                                <p className="font-bold mb-1">Could not save student due to the following errors:</p>
                                <ul className="list-disc pl-5">
                                    {Object.entries(formErrors).map(([field, errList]) => (
                                        <li key={field}><strong>{field}</strong>: {Array.isArray(errList) ? errList.join(', ') : errList}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmitSingle} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Student Name *</label>
                                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Admission Number *</label>
                                    <input required type="text" name="admission_number" value={formData.admission_number} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                    <input type="text" name="blood_group" value={formData.blood_group} onChange={handleInputChange} placeholder="e.g. O+" className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Father Name</label>
                                    <input type="text" name="father_name" value={formData.father_name} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mother Name</label>
                                    <input type="text" name="mother_name" value={formData.mother_name} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Primary Phone / Contact *</label>
                                    <input required type="text" name="parent_phone" value={formData.parent_phone} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
                                    <input type="text" name="aadhar_number" value={formData.aadhar_number} onChange={handleInputChange} className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                                </div>
                            </div>

                            <hr className="my-4 border-gray-200" />
                            <h3 className="font-semibold text-gray-800">Academic Placement</h3>

                            <div className="grid grid-cols-3 gap-4">
                                {user?.role === 'SUPERADMIN' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">School *</label>
                                        <select required name="school" value={formData.school} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2 border">
                                            <option value="">Select...</option>
                                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Class *</label>
                                    <select required name="student_class" value={formData.student_class} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2 border">
                                        <option value="">Select...</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Section *</label>
                                    <select required name="section" value={formData.section} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2 border">
                                        <option value="">Select...</option>
                                        {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6 pt-4">
                                <button type="button" onClick={closeSingleModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">
                                    {isEditMode ? 'Update Student' : 'Save Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isBulkModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between mb-4 border-b pb-2">
                            <h2 className="text-xl font-bold">Bulk Import Students (CSV)</h2>
                            <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>

                        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
                            <p className="font-semibold mb-1">Required CSV Headers exactly as:</p>
                            <code className="text-xs break-words font-mono">Student Name, Gender, Class, Roll Number, Age, Father Name, Mother Name, Contact Number, Admission Number, Aadhaar Number, APPAR Number, Blood Group</code>
                            <p className="text-xs mt-1 text-gray-500">(Section will be automatically assigned to 'A' by default if not specified)</p>
                        </div>

                        {bulkErrors && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm max-h-48 overflow-y-auto">
                                <p className="font-bold text-red-700 mb-1">Bulk Upload Errors Encountered:</p>
                                <ul className="list-disc pl-5 text-red-600">
                                    {bulkErrors.map((err, idx) => (
                                        <li key={idx} className="mb-1">{typeof err === 'string' ? err : JSON.stringify(err)}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleBulkSubmit} className="space-y-4">
                            {user?.role === 'SUPERADMIN' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target School *</label>
                                    <select required name="school" value={formData.school} onChange={handleInputChange} className="w-full rounded-md sm:text-sm px-3 py-2 border">
                                        <option value="">Select Target School...</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV File *</label>
                                <input required type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">Upload & Process</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
