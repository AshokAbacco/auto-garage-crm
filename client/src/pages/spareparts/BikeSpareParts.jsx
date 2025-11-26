import React from "react";
import {
    Wrench, Layers, Package, ShoppingCart,
    Bike, Shield, Zap, Star, CheckCircle,
    Clock, Truck, Award, Users, Settings
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import PublicLayout from "../../components/PublicLayout";
import Footer from "../../components/Footer";

export default function BikeSpareParts() {
    const { isDark } = useTheme();

    // Main features
    const features = [
        { icon: Layers, title: "Quality Components", desc: "Genuine OEM and aftermarket parts." },
        { icon: Package, title: "Inventory Management", desc: "Track part availability and stock levels." },
        { icon: ShoppingCart, title: "Easy Procurement", desc: "Order and restock with one click." },
    ];

    // Popular categories
    const categories = [
        {
            icon: Bike,
            title: "Engine Parts",
            desc: "Pistons, cylinders, gaskets, and more",
            items: ["Spark Plugs", "Air Filters", "Oil Filters", "Gasket Kits"]
        },
        {
            icon: Shield,
            title: "Brake System",
            desc: "Complete braking components for safety",
            items: ["Brake Pads", "Brake Discs", "Brake Shoes", "Brake Cables"]
        },
        {
            icon: Zap,
            title: "Electrical",
            desc: "Lights, batteries, and wiring components",
            items: ["Batteries", "Headlights", "Indicators", "Wiring Harness"]
        },
        {
            icon: Settings,
            title: "Transmission",
            desc: "Chains, sprockets, and clutch components",
            items: ["Drive Chains", "Sprockets", "Clutch Plates", "Gear Levers"]
        }
    ];

    // Featured products (reduced to 3 items)
    const featuredProducts = [
        { name: "Premium Engine Oil", brand: "Motul", price: "₹899", rating: 4.8 },
        { name: "Performance Air Filter", brand: "K&N", price: "₹2,499", rating: 4.7 },
        { name: "Brake Pad Set", brand: "Brembo", price: "₹1,899", rating: 4.9 }
    ];

    // Brands
    const brands = [
        { name: "Yamaha", icon: Bike },
        { name: "Honda", icon: Bike },
        { name: "Suzuki", icon: Bike },
        { name: "Kawasaki", icon: Bike },
        { name: "Bajaj", icon: Bike },
        { name: "Royal Enfield", icon: Bike }
    ];

    // Benefits
    const benefits = [
        { icon: CheckCircle, title: "100% Genuine Parts", desc: "Authentic products with manufacturer warranty" },
        { icon: Clock, title: "Fast Delivery", desc: "Same-day shipping for orders before 2 PM" },
        { icon: Truck, title: "Free Shipping", desc: "On orders above ₹2,000 within the city" },
        { icon: Award, title: "Quality Assurance", desc: "All parts tested for performance and durability" }
    ];

    return (
        <PublicLayout>
            <div className={`min-h-screen py-20 mt-[7%] ${isDark ? "bg-gray-950 text-gray-200" : "bg-gray-50 text-gray-900"}`}>
                <div className="max-w-6xl mx-auto px-6 text-center">
                    {/* Hero Section */}
                    <div className="inline-flex items-center justify-center gap-3 mb-8">
                        <div className={`p-4 rounded-2xl shadow-lg ${isDark ? "bg-indigo-900/30" : "bg-indigo-100"}`}>
                            <Wrench className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                            Bike Spare Parts
                        </h1>
                    </div>

                    <p className="max-w-3xl mx-auto text-lg text-gray-500">
                        Browse and manage your bike spare parts inventory — from brakes and chains to full service kits.
                    </p>

                    {/* Features Section */}
                    <div className="mt-16">
                        <h2 className={`text-3xl font-bold mb-8 ${isDark ? "text-white" : "text-gray-900"}`}>Platform Features</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((f, i) => (
                                <div key={i} className={`p-6 rounded-2xl shadow-lg ${isDark ? "bg-white/10" : "bg-white"} hover:scale-[1.03] transition-all`}>
                                    <f.icon className="w-8 h-8 mb-4 text-indigo-500 mx-auto" />
                                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                                    <p className="text-sm text-gray-500">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Categories Section */}
                    <div className="mt-20">
                        <div className="flex flex-col items-center mb-12">
                            <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Popular Categories</h2>
                            <div className={`w-24 h-1 rounded-full ${isDark ? "bg-indigo-500" : "bg-indigo-400"} mb-4`}></div>
                            <p className={`text-lg max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                Browse our extensive collection of bike spare parts by category.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((category, i) => (
                                <div key={i} className={`p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.03] ${isDark ? "bg-white/10" : "bg-white"}`}>
                                    <div className={`p-3 rounded-xl ${isDark ? "bg-indigo-900/30" : "bg-indigo-100"} w-fit mx-auto mb-4`}>
                                        <category.icon className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{category.desc}</p>
                                    <div className="space-y-2">
                                        {category.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center text-sm">
                                                <div className={`w-2 h-2 rounded-full mr-2 ${isDark ? "bg-indigo-400" : "bg-indigo-500"}`}></div>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Featured Products Section with Infinite Scroll */}
                    <div className="mt-20">
                        <div className="flex flex-col items-center mb-12">
                            <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Featured Products</h2>
                            <div className={`w-24 h-1 rounded-full ${isDark ? "bg-purple-500" : "bg-purple-400"} mb-4`}></div>
                            <p className={`text-lg max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                Our top-selling bike parts and accessories.
                            </p>
                        </div>

                        {/* Infinite Scroll Container */}
                        <div className="overflow-hidden">
                            <div className="flex animate-scroll-left-to-right">
                                {/* First set of products */}
                                {featuredProducts.map((product, i) => (
                                    <div key={`first-${i}`} className={`flex-shrink-0 w-80 mx-4 p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.03] ${isDark ? "bg-white/10" : "bg-white"}`}>
                                        <div className={`h-40 rounded-xl mb-4 ${isDark ? "bg-gray-800" : "bg-gray-200"} flex items-center justify-center`}>
                                            <Package className="w-16 h-16 text-indigo-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold">{product.price}</span>
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                <span className="text-sm">{product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Duplicate set for seamless loop */}
                                {featuredProducts.map((product, i) => (
                                    <div key={`second-${i}`} className={`flex-shrink-0 w-80 mx-4 p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.03] ${isDark ? "bg-white/10" : "bg-white"}`}>
                                        <div className={`h-40 rounded-xl mb-4 ${isDark ? "bg-gray-800" : "bg-gray-200"} flex items-center justify-center`}>
                                            <Package className="w-16 h-16 text-indigo-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold">{product.price}</span>
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                <span className="text-sm">{product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Brands Section */}
                    <div className="mt-20">
                        <div className="flex flex-col items-center mb-12">
                            <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Popular Brands</h2>
                            <div className={`w-24 h-1 rounded-full ${isDark ? "bg-indigo-500" : "bg-indigo-400"} mb-4`}></div>
                            <p className={`text-lg max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                We stock parts from all major bike manufacturers.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {brands.map((brand, i) => (
                                <div key={i} className={`p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.03] ${isDark ? "bg-white/10" : "bg-white"}`}>
                                    <div className={`p-4 rounded-xl ${isDark ? "bg-indigo-900/30" : "bg-indigo-100"} w-fit mx-auto mb-3`}>
                                        <brand.icon className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <h3 className="font-medium">{brand.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="mt-20">
                        <div className="flex flex-col items-center mb-12">
                            <h2 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Why Choose Us</h2>
                            <div className={`w-24 h-1 rounded-full ${isDark ? "bg-purple-500" : "bg-purple-400"} mb-4`}></div>
                            <p className={`text-lg max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                Benefits of using our platform for your bike spare parts needs.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, i) => (
                                <div key={i} className={`p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.03] ${isDark ? "bg-white/10" : "bg-white"}`}>
                                    <div className={`p-3 rounded-xl ${isDark ? "bg-purple-900/30" : "bg-purple-100"} w-fit mx-auto mb-4`}>
                                        <benefit.icon className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                                    <p className="text-sm text-gray-500">{benefit.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className={`mt-20 p-8 rounded-3xl ${isDark ? "bg-gradient-to-r from-indigo-900/30 to-purple-900/30" : "bg-gradient-to-r from-indigo-50 to-purple-50"}`}>
                        <h2 className="text-3xl font-bold mb-4">Ready to streamline your spare parts inventory?</h2>
                        <p className={`text-lg max-w-2xl mx-auto mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            Join hundreds of bike shops that have transformed their operations with our management platform.
                        </p>
                        <button className={`px-6 py-3 rounded-full font-semibold transition-all ${isDark ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
                            Get Started Today
                        </button>
                    </div>
                </div>

                {/* CSS for infinite scroll animation */}
                <style>{`
                    @keyframes scroll-left-to-right {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-50%);
                        }
                    }
                    .animate-scroll-left-to-right {
                        animation: scroll-left-to-right 20s linear infinite;
                    }
                `}</style>
            </div>
            <Footer />
        </PublicLayout>
    );
}