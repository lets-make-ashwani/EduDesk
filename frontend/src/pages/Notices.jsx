import { useEffect, useState } from 'react';
import api from '../lib/axios';

export default function Notices() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await api.get('notices/');
            setNotices(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                            <div className="flex justify-between items-start mb-3">
                                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                                <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">School Board & Notices</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition">
                    + Create Notice
                </button>
            </div>

            <div className="space-y-4">
                {notices.map((notice) => (
                    <div key={notice.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{notice.title}</h3>
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full shadow-sm">{new Date(notice.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 mt-2 whitespace-pre-line leading-relaxed">{notice.content}</p>
                    </div>
                ))}
                {notices.length === 0 && (
                    <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        No notices posted yet.
                    </div>
                )}
            </div>
        </div>
    );
}
