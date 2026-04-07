import React from "react";
import { Users, Phone, Bike, Mail, Hash, Calendar } from "lucide-react";

export default function BikeClientsReport({ clients = [], isDark }) {
  return (
    <div className="space-y-6">
      {clients.length === 0 ? (
        <div
          className={`text-center py-20 rounded-2xl transition-all duration-300 ${
            isDark 
              ? "bg-gray-800/50 border border-gray-700" 
              : "bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100"
          }`}
        >
          <Users 
            size={64} 
            className={`mx-auto mb-4 transition-all duration-300 ${
              isDark ? "text-gray-600" : "text-gray-300"
            }`} 
          />
          <p className={`text-xl font-semibold mb-2 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}>
            No clients found
          </p>
          <p className={`text-sm ${
            isDark ? "text-gray-500" : "text-gray-500"
          }`}>
            Client data will appear here once available
          </p>
        </div>
      ) : (
        <>
          {/* Stats Header */}
          <div className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${
            isDark 
              ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" 
              : "bg-gradient-to-br from-white to-gray-50 border border-gray-100"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  {clients.length}
                </h2>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Total Clients
                </p>
              </div>
            </div>
          </div>

          {/* Client Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clients.map((client, index) => (
              <div
                key={client.id}
                className={`group p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 animate-fade-in ${
                  isDark 
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50" 
                    : "bg-white border-gray-200 hover:border-blue-400/50 hover:shadow-blue-100"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* HEADER */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-bold mb-1 transition-colors duration-300 ${
                        isDark 
                          ? "text-white group-hover:text-blue-400" 
                          : "text-gray-900 group-hover:text-blue-600"
                      }`}
                    >
                      {client.ownerName || client.fullName || "Unknown"}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                      <div className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        isDark
                          ? "bg-blue-900/30 text-blue-400 group-hover:bg-blue-900/50"
                          : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                      }`}>
                        {client.bikeBrand} {client.bikeModel}
                      </div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    isDark
                      ? "bg-blue-900/30 group-hover:bg-blue-900/50 group-hover:scale-110"
                      : "bg-blue-50 group-hover:bg-blue-100 group-hover:scale-110"
                  }`}>
                    <Bike className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300" size={28} />
                  </div>
                </div>

                {/* DETAILS GRID */}
                <div className={`pt-5 border-t transition-colors duration-300 ${
                  isDark ? "border-gray-700" : "border-gray-100"
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PHONE */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isDark
                        ? "bg-gray-800/50 hover:bg-gray-700/50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}>
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isDark ? "bg-gray-700" : "bg-white shadow-sm"
                      }`}>
                        <Phone size={16} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium mb-0.5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Phone
                        </p>
                        <p className={`text-sm font-semibold truncate ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}>
                          {client.phone || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isDark
                        ? "bg-gray-800/50 hover:bg-gray-700/50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}>
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isDark ? "bg-gray-700" : "bg-white shadow-sm"
                      }`}>
                        <Mail size={16} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium mb-0.5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Email
                        </p>
                        <p className={`text-sm font-semibold truncate ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}>
                          {client.email || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* REG NUMBER */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isDark
                        ? "bg-gray-800/50 hover:bg-gray-700/50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}>
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isDark ? "bg-gray-700" : "bg-white shadow-sm"
                      }`}>
                        <Hash size={16} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium mb-0.5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Registration
                        </p>
                        <p className={`text-sm font-semibold truncate ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}>
                          {client.regNumber || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* YEAR */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isDark
                        ? "bg-gray-800/50 hover:bg-gray-700/50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}>
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isDark ? "bg-gray-700" : "bg-white shadow-sm"
                      }`}>
                        <Calendar size={16} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium mb-0.5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Year
                        </p>
                        <p className={`text-sm font-semibold truncate ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}>
                          {client.bikeYear || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}