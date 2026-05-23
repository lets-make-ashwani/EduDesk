import { useEffect, useState } from 'react';
import api from '../lib/axios';

export default function Students() {
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

            // Set defaults for the form if data exists
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

        // Clean payload for backend (e.g. empty strings for integers should be null)
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
        // Map backend representation back to form state, handling nested IDs if needed
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
            // Handle HTTP 207 Multi-Status or generic successes
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="animate-in fade-in duration-500 relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Students Directory</h1>
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
                            <div className="border-t border-gray-100 my-1"></div>
                            <button className="block w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700" onClick={() => { handleDeleteAllClick(); setDropdownOpen(false); }}>⚠️ Delete All Students</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration Info</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Profile</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class Info</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacts</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{student.admission_number || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">Admitted: {student.admission_date}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                    <div className="font-bold text-gray-800">{student.name}</div>
                                    <div className="text-xs text-gray-500">{student.gender || 'Unknown'} | {student.blood_group || 'No BG'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                    <div className="font-medium">{student.class_name} - {student.section_name}</div>
                                    <div className="text-xs text-gray-500">Roll: {student.roll_number || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    P: {student.parent_phone || student.contact_number || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEditClick(student)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                    <button onClick={() => handleDeleteClick(student.id, student.name)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-50">No students found. Add one to get started!</td>
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">School *</label>
                                    <select required name="school" value={formData.school} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2 border">
                                        <option value="">Select...</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target School *</label>
                                <select required name="school" value={formData.school} onChange={handleInputChange} className="w-full rounded-md sm:text-sm px-3 py-2 border">
                                    <option value="">Select Target School...</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
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
