import { useEffect, useState, useContext } from 'react';
import api from '../lib/axios';
import { AuthContext } from '../context/AuthContext';

export default function Fees() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('payments'); // 'payments' or 'structures'

    const [payments, setPayments] = useState([]);
    const [feeStructures, setFeeStructures] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);

    const [paymentFormData, setPaymentFormData] = useState({
        description: '',
        amount: '',
        due_date: '',
        school_class: ''
    });

    const [structureFormData, setStructureFormData] = useState({
        school_class: '',
        tuition_fee_monthly: '',
        annual_charges: '',
        exam_fee: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [paymentsRes, structuresRes, classesRes, studentsRes] = await Promise.all([
                api.get('payments/'),
                api.get('fee-structures/'),
                api.get('classes/'),
                api.get('students/')
            ]);
            setPayments(paymentsRes.data);
            setFeeStructures(structuresRes.data);
            setClasses(classesRes.data);
            setStudents(studentsRes.data);

            const defaultClass = classesRes.data.length > 0 ? classesRes.data[0].id : '';
            setPaymentFormData(prev => ({ ...prev, school_class: defaultClass }));
            setStructureFormData(prev => ({ ...prev, school_class: defaultClass }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async (id) => {
        try {
            await api.patch(`payments/${id}/`, { status: 'Paid', payment_date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (err) {
            alert("Error marking as paid");
        }
    };

    const handlePaymentInputChange = (e) => {
        setPaymentFormData({ ...paymentFormData, [e.target.name]: e.target.value });
    };

    const handleStructureInputChange = (e) => {
        setStructureFormData({ ...structureFormData, [e.target.name]: e.target.value });
    };

    const handleAssignFee = async (e) => {
        e.preventDefault();
        try {
            // 1. Create the Fee
            const feeRes = await api.post('fees/', paymentFormData);
            const newFeeId = feeRes.data.id;

            // 2. Find students in this class
            const targetStudents = students.filter(s => String(s.student_class) === String(paymentFormData.school_class));

            if (targetStudents.length === 0) {
                alert("Fee created, but no students found in this class to assign the fee to.");
            } else {
                // 3. Create a Payment (unpaid bill) for each student
                const promises = targetStudents.map(student =>
                    api.post('payments/', {
                        student: student.id,
                        fee: newFeeId,
                        amount_paid: 0,
                        status: 'Unpaid'
                    })
                );
                await Promise.all(promises);
                alert(`Fee assigned to ${targetStudents.length} students successfully!`);
            }

            setIsPaymentModalOpen(false);
            setPaymentFormData({ description: '', amount: '', due_date: '', school_class: classes.length > 0 ? classes[0].id : '' });
            fetchData();
        } catch (err) {
            alert("Error assigning fee. Please ensure all fields are correct.");
            console.error(err);
        }
    };

    const handleSaveStructure = async (e) => {
        e.preventDefault();
        try {
            // Check if structure for class already exists
            const existing = feeStructures.find(fs => String(fs.school_class) === String(structureFormData.school_class));
            if (existing) {
                await api.put(`fee-structures/${existing.id}/`, structureFormData);
                alert("Fee Structure updated successfully!");
            } else {
                await api.post('fee-structures/', structureFormData);
                alert("Fee Structure created successfully!");
            }
            setIsStructureModalOpen(false);
            setStructureFormData({ school_class: classes.length > 0 ? classes[0].id : '', tuition_fee_monthly: '', annual_charges: '', exam_fee: '' });
            fetchData();
        } catch (err) {
            alert("Error saving fee structure.");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500 relative">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-12 bg-gray-50 border-b border-gray-200 animate-pulse"></div>
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-white animate-pulse p-4 flex items-center justify-between">
                                <div className="h-4 w-1/5 bg-gray-200 rounded"></div>
                                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fee Management</h1>

                <div className="flex space-x-3">
                    {user?.role === 'Admin' && (
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'payments' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Payments</button>
                            <button onClick={() => setActiveTab('structures')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'structures' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Fee Structures</button>
                        </div>
                    )}

                    {activeTab === 'payments' ? (
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
                        >
                            + Assign New Fee
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsStructureModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
                        >
                            + Add/Edit Structure
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'payments' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{payment.student_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{payment.fee_description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 animate-pulse'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {payment.status === 'Unpaid' && (
                                            <button onClick={() => markAsPaid(payment.id)} className="text-white hover:bg-blue-700 font-bold bg-blue-600 px-4 py-2 rounded-lg shadow transition transform hover:scale-105">
                                                Mark Paid
                                            </button>
                                        )}
                                        {payment.status === 'Paid' && (
                                            <span className="text-gray-400 font-medium block mt-1">Paid on {payment.payment_date}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 bg-gray-50">No fee records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'structures' && user?.role === 'Admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tuition Fee (Monthly)</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Annual Charges</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Fee</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Total Annual Fee</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {feeStructures.map((fs) => (
                                <tr key={fs.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{fs.class_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹{fs.tuition_fee_monthly}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹{fs.annual_charges}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹{fs.exam_fee}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-bold bg-blue-50/50">₹{fs.total_annual_fee}</td>
                                </tr>
                            ))}
                            {feeStructures.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-50">No fee structures configured yet. Add one to see it here.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Assign Fee Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Assign New Fee to Class</h2>

                        {classes.length === 0 ? (
                            <div className="text-red-500 mb-4 p-3 bg-red-50 rounded text-sm">
                                Notice: You must have at least one Class created to assign fees.
                            </div>
                        ) : null}

                        <form onSubmit={handleAssignFee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fee Description</label>
                                <input required type="text" name="description" value={paymentFormData.description} onChange={handlePaymentInputChange} placeholder="e.g. Term 1 Tuition" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                                <input required type="number" step="0.01" name="amount" value={paymentFormData.amount} onChange={handlePaymentInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                <input required type="date" name="due_date" value={paymentFormData.due_date} onChange={handlePaymentInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Assign to Class</label>
                                <select required name="school_class" value={paymentFormData.school_class} onChange={handlePaymentInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
                                    <option value="">Select a class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">This will generate a fee record for every student in the selected class.</p>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                                    Cancel
                                </button>
                                <button type="submit" disabled={classes.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50">
                                    Assign Fee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Structure Config Modal */}
            {isStructureModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Configure Class Fee Structure</h2>
                        <form onSubmit={handleSaveStructure} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Class</label>
                                <select required name="school_class" value={structureFormData.school_class} onChange={handleStructureInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
                                    <option value="">Select a class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">This will OVERWRITE any existing structure for this class.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tuition Fee (Monthly ₹)</label>
                                <input required type="number" step="0.01" name="tuition_fee_monthly" value={structureFormData.tuition_fee_monthly} onChange={handleStructureInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Annual Charges (₹)</label>
                                <input required type="number" step="0.01" name="annual_charges" value={structureFormData.annual_charges} onChange={handleStructureInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Exam Fee (₹)</label>
                                <input required type="number" step="0.01" name="exam_fee" value={structureFormData.exam_fee} onChange={handleStructureInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsStructureModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                                    Cancel
                                </button>
                                <button type="submit" disabled={classes.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50">
                                    Save Structure
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
