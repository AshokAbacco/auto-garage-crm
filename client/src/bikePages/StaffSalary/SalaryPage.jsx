// client/src/bikePages/StaffSalary/SalaryPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, DollarSign, Users, TrendingUp, Calendar, ChevronDown, History, Check, AlertCircle } from 'lucide-react';
import api from "../../utils/axiosInstance";
import AddEditStaffModal from './AddStaff';
import SalaryHistoryModal from './SalaryHistory';
import { useNavigate } from "react-router-dom";
const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

const HOLD_DAYS_THRESHOLD = 3;

const StaffSalaryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { fetchStaffData(); }, []);
  useEffect(() => { if (selectedYear === 'all') setSelectedMonth('all'); }, [selectedYear]);

  // Auto-check for hold status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndUpdateHoldStatus();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [staffData]);

  useEffect(() => {
    if (!staffData.length) { setAvailableYears([]); return; }
    const years = new Set();
    staffData.forEach(s => {
      if (s.joiningDate) years.add(new Date(s.joiningDate).getFullYear());
      if (s.lastPaid) years.add(new Date(s.lastPaid).getFullYear());
      if (s.createdDate) years.add(new Date(s.createdDate).getFullYear());
    });
    setAvailableYears([...years].sort((a, b) => a - b));
  }, [staffData]);

  useEffect(() => {
    if (selectedYear === 'all' || !staffData.length) { setAvailableMonths([]); return; }
    const months = new Set();
    const year = parseInt(selectedYear);
    staffData.forEach(s => {
      if (s.joiningDate) {
        const d = new Date(s.joiningDate);
        if (d.getFullYear() === year) months.add(d.getMonth() + 1);
      }
      if (s.lastPaid) {
        const d = new Date(s.lastPaid);
        if (d.getFullYear() === year) months.add(d.getMonth() + 1);
      }
      if (s.createdDate) {
        const d = new Date(s.createdDate);
        if (d.getFullYear() === year) months.add(d.getMonth() + 1);
      }
    });
    setAvailableMonths([...months].sort((a, b) => a - b));
  }, [staffData, selectedYear]);

  useEffect(() => {
    if (!availableYears.length) { setSelectedYear('all'); setSelectedMonth('all'); return; }
    const currentYear = new Date().getFullYear();
    setSelectedYear(availableYears.includes(currentYear) ? currentYear.toString() : availableYears[availableYears.length - 1].toString());
  }, [availableYears]);

  useEffect(() => {
    if (selectedYear === 'all' || !availableMonths.length) { setSelectedMonth('all'); return; }
    const currentMonth = new Date().getMonth() + 1;
    setSelectedMonth(availableMonths.includes(currentMonth) ? currentMonth.toString() : availableMonths[0].toString());
  }, [selectedYear, availableMonths]);


  // yearly-based (annual salary / 365 days) and then deduct per leave day.
  const DAYS_IN_YEAR = 365;

  const calculatePerDaySalary = (monthlySalary) => {
    const annualSalary = monthlySalary * 12;
    return annualSalary / DAYS_IN_YEAR;
  };

  const calculateYearlyDeduction = (monthlySalary, leaves) => {
    const perDay = calculatePerDaySalary(monthlySalary);
    return Math.round(perDay * leaves); // rounded
  };

  const calculateNetSalary = (staff) => {
    const yearlyDeduction = calculateYearlyDeduction(
      staff.baseSalary,
      staff.leaves
    );

    return staff.baseSalary + staff.bonus - yearlyDeduction;
  };


  const checkAndUpdateHoldStatus = async () => {
    const now = new Date();
    let hasChanges = false;
    const updates = [];

    for (const staff of staffData) {
      if (staff.status === 'pending' && staff.createdDate) {
        const daysSince = Math.floor((now - new Date(staff.createdDate)) / (1000 * 60 * 60 * 24));
        
        if (daysSince >= HOLD_DAYS_THRESHOLD) {
          hasChanges = true;
          updates.push({
            id: staff.id,
            status: 'hold'
          });
        }
      }
    }

    if (hasChanges) {
      try {
        // Update each staff to hold and move to history
        for (const update of updates) {
          await api.put(`/api/bike-staff-salary/${update.id}/hold`);
        }
        fetchStaffData(); // Refresh data
      } catch (error) {
        console.error('Error updating hold status:', error);
      }
    }
  };

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/bike-staff-salary");
      setStaffData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffData([]);
    } finally {
      setLoading(false);
    }
  };

 

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    
    let matchesDate = true;
    if (selectedYear !== 'all') {
      const year = parseInt(selectedYear);
      const hasYear = (staff.lastPaid && new Date(staff.lastPaid).getFullYear() === year) ||
                      (staff.joiningDate && new Date(staff.joiningDate).getFullYear() === year) ||
                      (staff.createdDate && new Date(staff.createdDate).getFullYear() === year);
      
      if (!hasYear) {
        matchesDate = false;
      } else if (selectedMonth !== 'all') {
        const month = parseInt(selectedMonth);
        matchesDate = (staff.lastPaid && new Date(staff.lastPaid).getFullYear() === year && new Date(staff.lastPaid).getMonth() + 1 === month) ||
                     (staff.joiningDate && new Date(staff.joiningDate).getFullYear() === year && new Date(staff.joiningDate).getMonth() + 1 === month) ||
                     (staff.createdDate && new Date(staff.createdDate).getFullYear() === year && new Date(staff.createdDate).getMonth() + 1 === month);
      }
    }
    
    return matchesSearch && matchesRole && matchesDate;
  });

  const handleSaveStaff = async (staffInfo) => {
    try {
      if (selectedStaff) {
        await api.put(`/api/bike-staff-salary/${selectedStaff.id}`, staffInfo);
      } else {
        // Add new staff with createdDate
        await api.post("/api/bike-staff-salary", {
          ...staffInfo,
          status: 'pending',
          createdDate: new Date()
        });
      }
      fetchStaffData();
      setShowAddModal(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!selectedStaff?.id) return;
    try {
      // Process payment - this will move to history and create next month entry
      await api.post(`/api/bike-staff-salary/${selectedStaff.id}/pay`);
      await fetchStaffData();
      setShowPaymentModal(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed");
    }
  };
const StatCard = ({ icon: Icon, color, label, value }) => (
  <div className={`bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-${color}-500 transition-all`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);


const PaymentModal = ({ staff, onClose, onPay }) => {
  if (!staff) return null;

  const yearlyDeduction = calculateYearlyDeduction(
    staff.baseSalary,
    staff.leaves
  );

  const netSalary = staff.baseSalary + staff.bonus - yearlyDeduction;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-2xl">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Process Salary Payment
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{staff.name}</div>
                  <div className="text-sm text-gray-600">{staff.role}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              {[
                { label: 'Base Salary', value: staff.baseSalary, color: 'gray-900' },
                { label: 'Bonus', value: staff.bonus, color: 'green-600', prefix: '+' },
                { label: 'Leave Deduction (Yearly)', value: yearlyDeduction, color: 'red-600', prefix: '-' }
              ].map(({ label, value, color, prefix = '' }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-semibold text-${color}`}>{prefix}₹{value.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-300 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Net Salary</span>
                <span className="font-bold text-gray-900 text-xl">₹{netSalary.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
              <div className="text-blue-500 mt-0.5">ℹ️</div>
              <div>This will mark the salary as paid, move it to history, and create a new entry for next month with reset bonus, leaves, and deductions.</div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button onClick={onPay} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Loading staff data...</p>
        </div>
      </div>
    );
  }

  const totalSalaryExpense = staffData.reduce((sum, s) => sum + calculateNetSalary(s), 0);
  const pendingPayments = staffData.filter(s => s.status === 'pending').length;
  const holdPayments = staffData.filter(s => s.status === 'hold').length;
  const uniqueRoles = [...new Set(staffData.map(s => s.role))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Salary Management</h1>
          <p className="text-gray-600">Manage payroll and compensation</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users} color="blue" label="Total Staff" value={staffData.length} />
        <StatCard icon={DollarSign} color="blue" label="Total Salary Expense" value={`₹${totalSalaryExpense.toLocaleString()}`} />
        <StatCard icon={TrendingUp} color="blue" label="Pending Payments" value={pendingPayments} />
        <StatCard icon={AlertCircle} color="blue" label="On Hold" value={holdPayments} />
      </div>


      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          {[
            { value: filterRole, onChange: setFilterRole, options: ['all', ...uniqueRoles], labels: { all: 'All Roles' } },
            { value: selectedYear, onChange: (v) => { setSelectedYear(v); if (v === 'all') setSelectedMonth('all'); }, options: ['all', ...availableYears], labels: { all: 'All Years' } },
            { value: selectedMonth, onChange: setSelectedMonth, options: ['all', ...availableMonths.map(m => MONTHS.find(mn => mn.value === m))], labels: { all: 'All Months' }, disabled: selectedYear === 'all' }
          ].map(({ value, onChange, options, labels, disabled }, idx) => (
            <div key={idx} className="relative">
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {options.map(opt => {
                  const val = opt?.value || opt;
                  const lbl = opt?.label || labels?.[opt] || opt;
                  return <option key={val} value={val}>{lbl}</option>;
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          ))}

          <button onClick={() => setShowAddModal(true)} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Staff', 'Role', 'Base Salary', 'Bonus', 'Leaves', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-600">Since {new Date(staff.joiningDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{staff.role}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">₹{staff.baseSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">+₹{staff.bonus.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {staff.leaves} days
                    </span>
                  </td>
                  <td className="px-6 py-4 text-red-600 font-medium">-₹{calculateYearlyDeduction(staff.baseSalary, staff.leaves).toLocaleString()}</td>

                  <td className="px-6 py-4 text-gray-900 font-bold text-lg">₹{calculateNetSalary(staff).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {staff.status === 'paid' ? (
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium w-fit">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                          Paid
                        </span>
                        <span className="text-xs text-gray-600 mt-1">{staff.lastPaid ? new Date(staff.lastPaid).toLocaleDateString() : ''}</span>
                      </div>
                    ) : staff.status === 'hold' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        On Hold
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {[
                        { icon: History, color: 'blue', action: () => { setSelectedStaff(staff); setShowHistoryModal(true); }, title: 'View History' },
                        { icon: DollarSign, color: 'blue', action: () => { setSelectedStaff(staff); setShowPaymentModal(true); }, title: 'Process Payment', disabled: staff.status === 'hold' },
                        { icon: Edit2, color: 'blue', action: () => { setSelectedStaff(staff); setShowAddModal(true); }, title: 'Edit' }
                      ].map(({ icon: Icon, color, action, title, disabled }, i) => (
                        <button 
                          key={i} 
                          onClick={action} 
                          disabled={disabled}
                          className={`p-2 bg-${color}-100 text-${color}-600 rounded-lg hover:bg-${color}-200 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
                          title={title}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredStaff.length && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No staff members found</p>
            {(selectedYear !== 'all' || selectedMonth !== 'all') && (
              <p className="text-gray-500 text-sm mt-2">Try adjusting your date filters</p>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <AddEditStaffModal staff={selectedStaff} onClose={() => { setShowAddModal(false); setSelectedStaff(null); }} onSave={handleSaveStaff} />}
      {showPaymentModal && <PaymentModal staff={selectedStaff} onClose={() => { setShowPaymentModal(false); setSelectedStaff(null); }} onPay={handlePayment} />}
      {showHistoryModal && <SalaryHistoryModal staff={selectedStaff} onClose={() => { setShowHistoryModal(false); setSelectedStaff(null); }} />}
    </div>
  );
};

export default StaffSalaryManagement;