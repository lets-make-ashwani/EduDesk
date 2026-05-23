import { useEffect, useState } from 'react';
import api from '../lib/axios';

export default function Exams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('exams/');
            setExams(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Exams & Results</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition">
                    + Create Exam
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => (
                    <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{exam.name}</h3>
                        <p className="text-sm font-medium text-gray-500 mb-4 bg-gray-50 inline-block px-3 py-1 rounded-md">Date: {exam.date || 'Not scheduled'}</p>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                            <button className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition">Edit Details</button>
                            <button className="text-sm font-bold text-blue-700 hover:bg-blue-100 bg-blue-50 px-4 py-2 rounded-lg transition">Enter Marks</button>
                        </div>
                    </div>
                ))}
                {exams.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        No exams scheduled. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
