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

                {/* Logo - Top Center */}
                <div className="relative z-10 pt-6 flex justify-center">
                <div className="w-20 h-20 sm:w-28 sm:h-18 rounded-2xl   overflow-hidden">
                    <img
                    src="/Logos/transLogo.png"
                    alt="Motor Desk Logo"
                    className="w-full h-full object-contain"
                    />
                </div>
                </div>


                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                    {/* Bottom Section with Bouncing Links - Fixed Position */}
                    <div className={`  flex flex-col justify-between items-center space-y-3 gap-3 md:space-y-0`}>
                        <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'} text-center md:text-left`}>
                            © {new Date().getFullYear()} Moter Desk by Abacco Technology. All rights reserved.
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