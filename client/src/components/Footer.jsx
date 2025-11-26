import React, { useState, useEffect } from 'react';
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";

const Footer = () => {
    const { isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <>
            <style>{`
                @keyframes spin-fast {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-5px); }
                    60% { transform: translateY(-3px); }
                }
                @keyframes glow {
                    0%, 100% { 
                        filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.6));
                    }
                    50% { 
                        filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.9));
                    }
                }
                @keyframes shine {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .animate-spin-fast {
                    animation: spin-fast 3s linear infinite;
                }
                .animate-slide-up {
                    animation: slideUp 0.5s ease-out forwards;
                }
                .animate-bounce-soft {
                    animation: bounce 2s infinite;
                }
                .animate-glow {
                    animation: glow 2s ease-in-out infinite;
                }
                .animate-shine {
                    animation: shine 3s ease-in-out infinite;
                }
                .footer-shiny-dark {
                    background: linear-gradient(
                        135deg,
                        #000000 0%,
                        #0a0a0a 25%,
                        #111111 50%,
                        #0a0a0a 75%,
                        #000000 100%
                    );
                    background-size: 200% 200%;
                    position: relative;
                }
                .footer-shiny-dark::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        45deg,
                        transparent 0%,
                        rgba(59, 130, 246, 0.05) 50%,
                        transparent 100%
                    );
                    animation: shine 4s ease-in-out infinite;
                }
                .footer-gradient-light {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%);
                }
                .glass-dark {
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .glass-light {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }
                .link-hover {
                    position: relative;
                    transition: all 0.3s ease;
                }
                .link-hover::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: -2px;
                    left: 0;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                    transition: width 0.3s ease;
                }
                .link-hover:hover::after {
                    width: 100%;
                }
                .social-icon {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .social-icon:hover {
                    transform: translateY(-3px) scale(1.1);
                }
                .policy-link {
                    transition: all 0.3s ease;
                }
                .policy-link:hover {
                    animation: bounce 0.6s ease;
                }
                .shiny-card {
                    background: linear-gradient(
                        145deg,
                        rgba(30, 41, 59, 0.8) 0%,
                        rgba(15, 23, 42, 0.9) 50%,
                        rgba(30, 41, 59, 0.8) 100%
                    );
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    position: relative;
                    overflow: hidden;
                }
                .shiny-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(59, 130, 246, 0.1),
                        transparent
                    );
                    transition: left 0.6s ease;
                }
                .shiny-card:hover::before {
                    left: 100%;
                }
                .logo-container-light {
                   
                }
                .logo-container-dark {
                    
                }
            `}</style>

            <footer
                className={`relative overflow-hidden ${isDark ? 'footer-shiny-dark text-gray-100' : 'footer-gradient-light text-gray-700'
                    } border-t ${isDark ? "border-gray-900" : "border-gray-200"}`}
            >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute -top-8 -right-8 w-20 h-20 rounded-full ${isDark ? 'bg-blue-900/10' : 'bg-blue-200/30'
                        } animate-pulse`}></div>
                    <div className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-full ${isDark ? 'bg-purple-900/10' : 'bg-purple-200/30'
                        } animate-pulse`} style={{ animationDelay: '1s' }}></div>
                    {/* Shiny particles */}
                    <div className={`absolute top-1/4 left-1/4 w-2 h-2 rounded-full ${isDark ? 'bg-blue-400/20' : 'bg-blue-400/30'
                        } animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
                    <div className={`absolute top-3/4 right-1/4 w-1 h-1 rounded-full ${isDark ? 'bg-purple-400/20' : 'bg-purple-400/30'
                        } animate-pulse`} style={{ animationDelay: '1.5s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                    {/* Bottom Section with Bouncing Links - Fixed Position */}
                    <div className={`pt-6  flex flex-col justify-between items-center space-y-3 gap-3 md:space-y-0`}>
                        <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'} text-center md:text-left`}>
                            © {new Date().getFullYear()} Auto Garage Desk by Abacco Technology. All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                            {/* <Link
                                to="/terms"
                                className={`policy-link text-sm font-medium px-2 py-1 rounded ${isDark ? 'text-blue-300 hover:text-blue-200 hover:bg-blue-900/30' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                                    } transition-all duration-300`}
                            >
                                Terms & Conditions
                            </Link> */}
                            <Link
                                to="/referencet&c"
                                className={`policy-link text-sm font-medium px-2 py-1 rounded ${isDark ? 'text-blue-300 hover:text-blue-200 hover:bg-blue-900/30' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                                    } transition-all duration-300`}
                            >
                                Reference Bounce T&C
                            </Link>
                            <Link
                                to="/term&conditions"
                                className={`policy-link text-sm font-medium px-2 py-1 rounded ${isDark ? 'text-blue-300 hover:text-blue-200 hover:bg-blue-900/30' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                                    } transition-all duration-300`}
                            >
                                Terms & Conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer