import { useState, useEffect, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';

export default function Settings() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        school_name: '',
        contact_email: '',
        phone_number: '',
        address: '',
    });

    useEffect(() => {
        // Simulate fetching settings (Replace with real API call later)
        setTimeout(() => {
            setFormData({
                school_name: user?.school_name || 'EduDesk Institute',
                contact_email: 'admin@edudesk.com',
                phone_number: '+91 9876543210',
                address: '123 Education Hub, Knowledge City'
            });
            setLoading(false);
        }, 600);
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // await api.put('settings/', formData);
            await new Promise(resolve => setTimeout(resolve, 800)); // Mock delay
            alert('Settings saved successfully!');
        } catch (err) {
            alert('Error saving settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i}>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-50 rounded-xl animate-pulse"></div>
                            </div>
                        ))}
                        <div className="h-10 w-32 bg-gray-200 rounded-xl mt-8 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-800">General Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Update your platform or school details here.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization / School Name</label>
                            <input required type="text" name="school_name" value={formData.school_name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all" />
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label><input required type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all" /></div>
                        <div className="col-span-1 md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea rows="3" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all"></textarea></div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition disabled:opacity-70 flex items-center">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
