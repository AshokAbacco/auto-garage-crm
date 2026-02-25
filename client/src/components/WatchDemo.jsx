import React, { useState } from "react";
import {
  FiPlay,
  FiX,
  FiActivity,
  FiVideo,
  FiChevronLeft,
} from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

export default function WatchDemo({ isOpen, onClose }) {
  const { isDark } = useTheme();
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (!isOpen) return null;

  const videos = [
    {
      id: 1,
      title: "English",
      subtitle: "Product Overview",
      src: "https://pub-42af405ceba340aebd5fb14bbd59d42d.r2.dev/vedios/English.mp4",
    },
    {
      id: 2,
      title: "Telugu",
      subtitle: "తెలుగు వివರಣ",
      src: "https://pub-42af405ceba340aebd5fb14bbd59d42d.r2.dev/vedios/Telugu-website.mp4",
    },
    {
      id: 3,
      title: "Kannada",
      subtitle: "ಕನ್ನಡ ವಿವರಣೆ",
      src: "https://pub-42af405ceba340aebd5fb14bbd59d42d.r2.dev/vedios/Kannada.mp4",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* OS Backdrop Protocol */}
      <div
        className="absolute inset-0 bg-[#000814]/90 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Main Terminal Window - Responsive height logic applied */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-500 shadow-2xl ${
          isDark ? "bg-[#000814] border-white/10" : "bg-white border-[#CBD5E1]"
        }`}
      >
        {/* Window Header Utility - Optimized for Mobile Padding */}
        <div
          className={`px-5 py-4 sm:px-8 sm:py-5 border-b flex items-center justify-between ${
            isDark
              ? "border-white/5 bg-[#001F3F]/30"
              : "bg-[#F8FAFC] border-[#CBD5E1]"
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
            <div className="h-4 w-[1px] bg-slate-300 mx-1 sm:mx-2"></div>
            <div>
              <h2
                className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-none mb-1 ${
                  isDark ? "text-white" : "text-[#001F3F]"
                }`}
              >
                System.Media_Player
              </h2>
              <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                V1.0 DEMO PROTOCOLS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              isDark
                ? "hover:bg-white/5 text-slate-400"
                : "hover:bg-slate-200 text-[#001F3F]"
            }`}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Video Grid Deployment - Internal Scroll Locked to Parent height */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-12">
          {!selectedVideo ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="group cursor-pointer space-y-3 sm:space-y-4"
                >
                  <div
                    className={`relative aspect-video rounded-xl sm:rounded-2xl border-2 overflow-hidden transition-all duration-500 group-hover:scale-[1.02] ${
                      isDark
                        ? "bg-[#001F3F] border-white/5"
                        : "bg-[#F8FAFC] border-[#CBD5E1] group-hover:border-[#001F3F]"
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#001F3F] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <FiPlay className="ml-1" size={20} sm:size={24} />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-[#000814]/20 group-hover:bg-transparent transition-all"></div>
                  </div>

                  <div className="px-1 text-center sm:text-left">
                    <h3
                      className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-1 ${
                        isDark ? "text-white" : "text-[#001F3F]"
                      }`}
                    >
                      {video.title} Node
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {video.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <FiChevronLeft /> Return
                </button>
                <div className="flex items-center gap-2">
                  <FiActivity
                    className="text-green-500 animate-pulse"
                    size={12}
                  />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
                    STREAMING_ACTIVE
                  </span>
                </div>
              </div>

              <div
                className={`rounded-xl sm:rounded-2xl border-2 overflow-hidden shadow-2xl bg-black ${
                  isDark ? "border-white/10" : "border-[#CBD5E1]"
                }`}
              >
                <video
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[40vh] sm:max-h-[50vh]"
                >
                  <source src={selectedVideo.src} type="video/mp4" />
                </video>
              </div>
            </div>
          )}
        </div>

        {/* System Registry Footer - Compact for Mobile */}
        <div
          className={`px-5 py-4 sm:px-8 sm:py-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark
              ? "border-white/5 bg-[#001F3F]/10"
              : "bg-[#F8FAFC] border-[#CBD5E1]"
          }`}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FiVideo className="text-blue-500" size={14} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Nodes: 03
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiActivity className="text-green-500" size={14} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Sync: Optimized
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#001F3F] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all border border-white/10 shadow-lg active:scale-95"
          >
            Close Stream
          </button>
        </div>
      </div>
    </div>
  );
}
