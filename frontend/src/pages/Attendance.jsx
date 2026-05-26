import { useState, useEffect } from 'react';
import api from '../lib/axios';

export default function Attendance() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});

    useEffect(() => {
        // Fetch students to mark attendance
        api.get('students/').then(res => {
            setStudents(res.data);
            const initial = {};
            res.data.forEach(s => { initial[s.id] = 'Present' });
            setAttendanceData(initial);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const submitAttendance = async () => {
        const records = Object.keys(attendanceData).map(id => ({
            student_id: parseInt(id),
            status: attendanceData[id]
        }));
        try {
            await api.post('attendance/mark/', { date, records });
            alert('Attendance saved successfully!');
        } catch (err) {
            alert('Error saving attendance');
        }
    };

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-12 bg-gray-50 border-b border-gray-200 animate-pulse"></div>
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-16 bg-white animate-pulse p-4 flex items-center justify-between">
                                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
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
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mark Attendance</h1>
                <div className="flex items-center space-x-4 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="border-none bg-transparent rounded-md focus:ring-0 text-gray-700 font-medium px-4 py-2 outline-none"
                    />
                    <button
                        onClick={submitAttendance}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition"
                    >
                        Save Attendance
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{student.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                    {student.class_name} - {student.section_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <select
                                        value={attendanceData[student.id]}
                                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                        className={`rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-bold px-4 py-2 cursor-pointer ${attendanceData[student.id] === 'Present' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}
                                    >
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-500 bg-gray-50">No students available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
