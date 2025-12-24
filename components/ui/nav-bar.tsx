"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Github, Linkedin, FileText, Menu, X as CloseIcon } from 'lucide-react';
import { X } from 'lucide-react';
import Link from 'next/link';

export function NavBar() {
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    
    const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.9]);
    const backgroundScale = useTransform(scrollY, [0, 100], [0.3, 1]);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when screen size increases
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Animation variants for mobile menu
    const menuVariants = {
        closed: {
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut" as const,
                when: "afterChildren" as const
            }
        },
        open: {
            opacity: 1,
            height: "auto",
            transition: {
                duration: 0.3,
                ease: "easeInOut" as const,
                when: "beforeChildren" as const,
                staggerChildren: 0.1
            }
        }
    };

    const menuItemVariants = {
        closed: {
            opacity: 0,
            y: -10,
            transition: { duration: 0.2 }
        },
        open: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2 }
        }
    };

    const navbarContent = (
        <motion.nav 
            className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-xl border-Black border-1"
        >
            {/* Main navbar row */}
            <div className="flex justify-between items-center w-full px-4 py-4">
                {/* Left side - Logo/Icon */}
                <div className="relative z-10 w-24 h-auto">
                    <a href="https://www.youtube.com/shorts/zMGNeaeyHR4">
                        <motion.button
                            className="inline-block"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: "center" }}>
                            <X size={24} className="text-gray-400 hover:text-white transition-colors" />
                        </motion.button>
                    </a>
                </div>

                {/* Center navigation - Desktop only */}
                <div className="relative z-10 flex-1 justify-center hidden md:flex">
                    <motion.div className="flex items-center justify-center gap-8 lg:gap-16 xl:gap-64">
                        
                        <button onClick={() => scrollToSection('projects')}>
                            <motion.div className="relative text-center font-extralight h-6 w-auto rounded-xl text-Beige" whileHover="barHover">
                                Projects
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-darkBeige"
                                    initial={{ opacity: 0, scaleX: 0}}
                                    variants={{ barHover: { opacity: 1, scaleX: 1 } }}
                                    transition={{duration: 0.5, ease: "backInOut"}}>
                                </motion.div>    
                            </motion.div>
                        </button>
                        <button onClick={() => scrollToSection('experience')}>
                            <motion.div className="relative text-center font-extralight h-6 w-auto rounded-xl text-Beige" whileHover="barHover">
                                Experience
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-darkBeige"
                                    initial={{ opacity: 0, scaleX: 0}}
                                    variants={{ barHover: { opacity: 1, scaleX: 1 } }}
                                    transition={{duration: 0.5, ease: "backInOut"}}>
                                </motion.div>    
                            </motion.div>
                        </button>
                        <button onClick={() => scrollToSection('skills')}>
                            <motion.div className="relative text-center font-extralight h-6 w-auto rounded-xl text-Beige" whileHover="barHover">
                                Skills
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-darkBeige"
                                    initial={{ opacity: 0, scaleX: 0}}
                                    variants={{ barHover: { opacity: 1, scaleX: 1 } }}
                                    transition={{duration: 0.5, ease: "backInOut"}}>
                                </motion.div>    
                            </motion.div>
                        </button>
                    </motion.div>
                </div>

                {/* Right side - Desktop social icons */}
                <div className="relative z-10 w-24 h-auto hidden md:block">
                    <div className="grid grid-cols-3 ml-auto w-fit gap-4">
                        <a href="https://github.com/adanjoserrojas">
                            <motion.button
                                className="" 
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                >
                                <Github size={24} style={{ color: '#ffff' }}/>
                            </motion.button>
                        </a>

                        <a href="https://www.linkedin.com/in/adan-rojas/">
                            <motion.button
                                className=""
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                >
                                <Linkedin size={24} style={{ color: '#ffff' }}/>
                            </motion.button>
                        </a>

                        <motion.button
                            className=""
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onClick={() => window.open('/Adan_Rojas_Resume_Oct.pdf', '_blank')}
                            >
                            <FileText size={24} style={{ color: '#ffff' }}/>
                        </motion.button>
                    </div>
                </div>

                {/* Hamburger menu button - Mobile only */}
                <motion.button
                    className="relative z-10 md:hidden p-2"
                    onClick={toggleMobileMenu}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.div
                        animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isMobileMenuOpen ? (
                            <CloseIcon size={24} className="text-white" />
                        ) : (
                            <Menu size={24} className="text-white" />
                        )}
                    </motion.div>
                </motion.button>
            </div>

            {/* Mobile menu dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="md:hidden overflow-hidden bg-Black/20 backdrop-blur-xl border-t border-gray-800"
                        variants={menuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >
                        <div className="flex flex-col items-center py-6 space-y-6">
                            {/* Navigation links */}
                            <motion.button 
                                variants={menuItemVariants}
                                onClick={() => scrollToSection('projects')}
                                className="text-Beige font-extralight text-lg hover:text-darkBeige transition-colors"
                            >
                                Projects
                            </motion.button>
                            <motion.button 
                                variants={menuItemVariants}
                                onClick={() => scrollToSection('experience')}
                                className="text-Beige font-extralight text-lg hover:text-darkBeige transition-colors"
                            >
                                Experience
                            </motion.button>
                            <motion.button 
                                variants={menuItemVariants}
                                onClick={() => scrollToSection('skills')}
                                className="text-Beige font-extralight text-lg hover:text-darkBeige transition-colors"
                            >
                                Skills
                            </motion.button>

                            {/* Divider */}
                            <motion.div 
                                variants={menuItemVariants}
                                className="w-32 h-px bg-gray-600"
                            />

                            {/* Social icons */}
                            <motion.div 
                                variants={menuItemVariants}
                                className="flex items-center gap-6"
                            >
                                <a href="https://github.com/adanjoserrojas">
                                    <motion.button
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    >
                                        <Github size={28} style={{ color: '#ffff' }}/>
                                    </motion.button>
                                </a>

                                <a href="https://www.linkedin.com/in/adan-rojas/">
                                    <motion.button
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    >
                                        <Linkedin size={28} style={{ color: '#ffff' }}/>
                                    </motion.button>
                                </a>

                                <motion.button
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    onClick={() => {
                                        window.open('/Adan_Rojas_Resume_Oct.pdf', '_blank');
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    <FileText size={28} style={{ color: '#ffff' }}/>
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
    if (!mounted) return null;
    return createPortal(navbarContent, document.body);
}