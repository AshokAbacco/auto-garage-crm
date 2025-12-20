import React, { useState, useEffect } from 'react';
import { X, History, Calendar } from 'lucide-react';
import api from "../../utils/axiosInstance";

const SalaryHistoryModal = ({ staff, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (staff) {
      fetchHistory();
    }
  }, [staff]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get(
        `/api/bike-staff-salary/${staff.id}/history`
      );
      console.log("Salary history:", response.data);
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!staff) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="w-6 h-6" />
              Salary History
            </h3>
            <p className="text-blue-100 text-sm mt-1">{staff.name} - {staff.role}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-blue-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading history...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history && history.length > 0 ? (
                history.map((record, index) => (
                  <div 
                    key={index} 
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{record.month}</div>
                          <div className="text-xs text-gray-600">
                            Paid on {new Date(record.paidDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 font-bold text-lg">
                          ₹{record.netSalary.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Net Salary</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Base</div>
                        <div className="text-gray-900 font-medium">
                          ₹{record.baseSalary.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Bonus</div>
                        <div className="text-green-600 font-medium">
                          +₹{record.bonus.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Deductions</div>
                        <div className="text-red-600 font-medium">
                          -₹{record.deductions.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No salary history available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryHistoryModal;