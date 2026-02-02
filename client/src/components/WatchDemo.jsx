import React, { useState } from "react";

export default function WatchDemo({ isOpen, onClose }) {
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (!isOpen) return null;

  const videos = [
    {
      id: 1,
      title: "English",
      subtitle: "Product Overview",
      src: "/Videos/English.mp4",
      gradient: "from-blue-500 to-pink-500",
    },
    {
      id: 2,
      title: "Telugu",
      subtitle: "తెలుగు వివరణ",
      src: "/Videos/Telugu-website.mp4",
      gradient: "from-blue-500 to-pink-500",
    },
    // {
    //   id: 3,
    //   title: "Kannada",
    //   subtitle: "ಕನ್ನಡ ವಿವರಣೆ",
    //   src: "/videos/demo3.mp4",
    //   gradient: "from-orange-500 to-red-500",
    // },
  ];

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const closeFullscreen = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 sm:p-6 py-15">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="relative w-full top-20 max-w-[800px] max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)]">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200/80 px-6 py-6 sm:px-10 sm:py-8">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
                    Product Demos
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 ml-5 font-medium">
                  Experience our product in multiple languages
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-90 duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="overflow-y-auto max-h-[calc(65vh-180px)] p-6 sm:p-10">
            <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="group cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] border border-gray-200/50">
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
                    
                    {/* Video Container */}
                    <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden">
                      <video
                        className="w-full h-full object-cover"
                        preload="metadata"
                      >
                        <source src={video.src} type="video/mp4" />
                      </video>
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="relative">
                          {/* Pulsing Ring */}
                          <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
                          
                          {/* Play Button */}
                          <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${video.gradient} flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 sm:h-12 sm:w-12 text-white ml-1"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Language Badge */}
                      <div className="absolute top-4 left-4">
                        <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${video.gradient} text-white text-xs font-semibold shadow-lg backdrop-blur-sm`}>
                          {video.title}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="mt-5 px-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {video.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 font-medium">
                      {video.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200/80 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 sm:px-10 sm:py-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 font-medium">
                Click any video to watch
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal - Centered with Fixed Size */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 mt-[150px]">
          {/* Video Container */}
          <div className="relative w-full max-w-5xl mx-auto">
            {/* Top Bar with Controls */}
         
            <div className="mb-4 flex items-center justify-between">
              {/* Back Button */}
              {/* <button
                onClick={closeFullscreen}
                className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg"
                aria-label="Go back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:-translate-x-1 duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm sm:text-base">Back</span>
              </button> */}

              {/* Video Title */}
              <div className="text-center flex-1 mx-4">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                  {selectedVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-1 drop-shadow">
                  {selectedVideo.subtitle}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={closeFullscreen}
                className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-500/90 backdrop-blur-md hover:bg-red-600 text-white transition-all duration-300 shadow-lg hover:shadow-red-500/50 border border-red-400/30"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-7 sm:w-7 transition-transform group-hover:rotate-90 duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Video Player - Fixed Aspect Ratio */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video">
                <video
                  controls
                  autoPlay
                  className="w-full h-full object-contain py-10"
                >
                  <source src={selectedVideo.src} type="video/mp4" />
                </video>
              </div>
              
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Custom Scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        /* Smooth video transitions */
        video {
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}