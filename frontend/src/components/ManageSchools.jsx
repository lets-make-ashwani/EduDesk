import React, { useState, useEffect } from 'react';
import { Building, Plus, Mail, User, Lock, X, Copy, Check, School, Server } from 'lucide-react';
import api from '../lib/axios';

export default function ManageSchools() {
  const [schools, setSchools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    school_name: '',
    email: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await api.get('schools/');
      setSchools(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    try {
      const res = await api.post('platform-admin/register-school/', formData);
      setSuccessData(res.data);
      fetchSchools();
      setFormData({ school_name: '', email: '', username: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to register school');
    } finally {
      setSubmitLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!successData) return;
    const text = `Welcome to EduDesk!\n\nSchool: ${successData.school}\nAdmin Username: ${successData.admin_credentials.username}\nAdmin Password: ${successData.admin_credentials.password}\nLogin URL: ${successData.admin_credentials.login_url}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSuccessData(null);
    setError(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Server className="w-7 h-7 mr-3 text-blue-600" />
            Platform Tenants
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage client schools and provision new administrative accounts.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="mt-4 sm:mt-0 flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all active:scale-95">
          <Plus className="w-5 h-5 mr-2" />
          Register New School
        </button>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">School Name</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="3" className="p-8 text-center text-slate-400">Loading tenants...</td></tr>
              ) : schools.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-slate-400">No schools registered yet. Click "Register New School" to add one.</td></tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500 font-medium">#{school.id}</td>
                    <td className="p-4 text-slate-900 font-semibold flex items-center"><School className="w-4 h-4 mr-2 text-slate-400"/> {school.name}</td>
                    <td className="p-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide">Active</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">{successData ? 'Tenant Provisioned!' : 'New School Tenant'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6">
              {successData ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm space-y-2">
                    <p className="font-semibold text-base mb-3 flex items-center"><Check className="w-5 h-5 mr-2 text-green-600"/> Setup Complete</p>
                    <p><span className="font-medium opacity-70">School:</span> {successData.school}</p>
                    <p><span className="font-medium opacity-70">Admin User:</span> {successData.admin_credentials.username}</p>
                    <p><span className="font-medium opacity-70">Password:</span> {successData.admin_credentials.password}</p>
                  </div>
                  <button onClick={copyToClipboard} className="w-full flex items-center justify-center px-4 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all active:scale-95">
                    {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
                  
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">School Name</label><div className="relative"><Building className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input required name="school_name" value={formData.school_name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" placeholder="e.g. Delhi Public School" /></div></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label><div className="relative"><Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" placeholder="admin@dps.com" /></div></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Admin Username</label><div className="relative"><User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input required name="username" value={formData.username} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" placeholder="dps_admin" /></div></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label><div className="relative"><Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input required type="text" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" placeholder="SecurePassword123" /></div></div>
                  
                  <button disabled={submitLoading} type="submit" className="w-full mt-6 flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all">
                    {submitLoading ? 'Provisioning Tenant...' : 'Create School & Admin'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}