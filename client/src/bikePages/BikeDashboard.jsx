import React, { useState } from 'react';
import { Wrench, Clock, CheckCircle, DollarSign, TrendingUp, Users, AlertTriangle, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const BikeDashboard = () => {
    const { isDark } = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState('today');

    const stats = [
        { icon: Wrench, label: 'Total Repairs', value: '142', change: '+15%', color: 'from-blue-500 to-blue-600' },
        { icon: Clock, label: 'In Service', value: '18', change: '+5%', color: 'from-orange-500 to-orange-600' },
        { icon: CheckCircle, label: 'Completed', value: '124', change: '+22%', color: 'from-green-500 to-green-600' },
        { icon: DollarSign, label: 'Revenue', value: '₹68,450', change: '+18%', color: 'from-purple-500 to-purple-600' },
    ];

    const activeRepairs = [
        { id: '#RG3847', customer: 'Rajesh Kumar', bike: 'Royal Enfield Classic 350', issue: 'Engine Overhaul', time: '2 hrs left', progress: 65, priority: 'high' },
        { id: '#RG3846', customer: 'Priya Sharma', bike: 'Honda Activa 6G', issue: 'Brake Service', time: '45 mins left', progress: 80, priority: 'medium' },
        { id: '#RG3845', customer: 'Amit Patel', bike: 'Yamaha FZ-S', issue: 'Suspension Repair', time: '3 hrs left', progress: 40, priority: 'low' },
        { id: '#RG3844', customer: 'Sneha Reddy', bike: 'TVS Jupiter', issue: 'Oil Change & Service', time: '30 mins left', progress: 90, priority: 'medium' },
    ];

    const services = [
        { name: 'Engine Repair', count: 28, revenue: '₹28,400', percentage: 75, color: 'from-red-400 to-red-600' },
        { name: 'General Service', count: 45, revenue: '₹18,000', percentage: 95, color: 'from-blue-400 to-blue-600' },
        { name: 'Brake Service', count: 32, revenue: '₹12,800', percentage: 68, color: 'from-green-400 to-green-600' },
        { name: 'Electrical Work', count: 22, revenue: '₹15,200', percentage: 58, color: 'from-purple-400 to-purple-600' },
    ];

    const upcomingAppointments = [
        { time: '11:00 AM', customer: 'Arjun Mehta', bike: 'KTM Duke 390', service: 'Full Service' },
        { time: '12:30 PM', customer: 'Sanjana Roy', bike: 'Suzuki Access', service: 'Chain Cleaning' },
        { time: '02:00 PM', customer: 'Karthik Rao', bike: 'Bajaj Pulsar', service: 'Clutch Repair' },
        { time: '03:30 PM', customer: 'Neha Gupta', bike: 'Hero Splendor', service: 'Tire Change' },
    ];

    const getPriorityColor = (priority) => {
        if (isDark) {
            switch (priority) {
                case 'high': return 'bg-red-900/30 text-red-400';
                case 'medium': return 'bg-yellow-900/30 text-yellow-400';
                case 'low': return 'bg-green-900/30 text-green-400';
                default: return 'bg-gray-700 text-gray-300';
            }
        } else {
            switch (priority) {
                case 'high': return 'bg-red-100 text-red-700';
                case 'medium': return 'bg-yellow-100 text-yellow-700';
                case 'low': return 'bg-green-100 text-green-700';
                default: return 'bg-gray-100 text-gray-700';
            }
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100'} p-6`}>
            {/* Header */}
            <div className="mb-8 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-4xl py-5 font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            Bike Garage Dashboard
                        </h1>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage repairs, service & maintenance</p>
                    </div>
                    <div className="flex gap-2">
                        {['today', 'week', 'month'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${selectedPeriod === period
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                                        : isDark 
                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-green-500 text-sm font-semibold flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {stat.change}
                            </span>
                        </div>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>{stat.label}</p>
                        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Active Repairs */}
                <div className={`lg:col-span-2 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Active Repairs</h2>
                        <span className={`px-3 py-1 ${isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'} rounded-full text-sm font-semibold`}>
                            {activeRepairs.length} in progress
                        </span>
                    </div>
                    <div className="space-y-4">
                        {activeRepairs.map((repair, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl ${
                                    isDark 
                                        ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600' 
                                        : 'bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border border-orange-200'
                                } transition-all duration-300`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                                            <Wrench className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{repair.customer}</p>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{repair.bike}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>{repair.id}</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(repair.priority)}`}>
                                            {repair.priority}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                        <Settings className="w-4 h-4 inline mr-1" />
                                        {repair.issue}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                                            <span>Progress</span>
                                            <span className="font-semibold">{repair.progress}%</span>
                                        </div>
                                        <div className={`w-full h-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                                                style={{ width: `${repair.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-medium text-orange-600">
                                        <Clock className="w-4 h-4" />
                                        {repair.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>Appointments</h2>
                    <div className="space-y-3">
                        {upcomingAppointments.map((appointment, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg ${
                                    isDark 
                                        ? 'bg-gray-700/50 border border-gray-600 hover:border-orange-500' 
                                        : 'bg-gradient-to-r from-slate-50 to-orange-50 border border-slate-200 hover:border-orange-300'
                                } transition-all duration-300`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} text-sm`}>{appointment.time}</span>
                                </div>
                                <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} text-sm`}>{appointment.customer}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{appointment.bike}</p>
                                    <span className={`text-xs px-2 py-1 ${isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'} rounded-full font-medium`}>
                                        {appointment.service}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Services Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>Service Categories</h2>
                    <div className="space-y-5">
                        {services.map((service, index) => (
                            <div key={index} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className={`font-semibold ${isDark ? 'text-white group-hover:text-orange-400' : 'text-gray-800 group-hover:text-orange-600'} transition-colors`}>
                                        {service.name}
                                    </p>
                                    <span className="text-sm font-medium text-green-600">{service.revenue}</span>
                                </div>
                                <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                                    <span>{service.count} repairs</span>
                                    <span className="text-xs font-medium">{service.percentage}% capacity</span>
                                </div>
                                <div className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                                    <div
                                        className={`h-full bg-gradient-to-r ${service.color} rounded-full transition-all duration-500`}
                                        style={{ width: `${service.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Insights */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300">
                    <h2 className="text-2xl font-bold mb-6">Today's Insights</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Avg Repair Time</p>
                                <p className="text-2xl font-bold">3.2 hrs</p>
                            </div>
                            <Clock className="w-10 h-10 opacity-80" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Customer Rating</p>
                                <p className="text-2xl font-bold">4.8/5.0</p>
                            </div>
                            <Users className="w-10 h-10 opacity-80" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Parts in Stock</p>
                                <p className="text-2xl font-bold">287</p>
                            </div>
                            <Settings className="w-10 h-10 opacity-80" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <Wrench className="w-8 h-8 mb-2" />
                    <p className="font-semibold text-lg">New Repair</p>
                    <p className="text-sm opacity-90">Add repair job</p>
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <CheckCircle className="w-8 h-8 mb-2" />
                    <p className="font-semibold text-lg">Mark Complete</p>
                    <p className="text-sm opacity-90">Finish service</p>
                </button>
                <button className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <AlertTriangle className="w-8 h-8 mb-2" />
                    <p className="font-semibold text-lg">Parts Order</p>
                    <p className="text-sm opacity-90">Order inventory</p>
                </button>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
        </div>
    );
};

export default BikeDashboard;