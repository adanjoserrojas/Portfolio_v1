"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Github, Linkedin, FileText } from 'lucide-react';
import { X } from 'lucide-react';
import Link from 'next/link';

export function NavBar() {
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
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

    const navbarContent = (
        <motion.nav 
            className="fixed top-0 left-0 right-0 flex justify-between items-center w-full z-[100] px-4 py-4 backdrop-blur-xl border-Black border-b-1"
        >

            {/* Your existing navbar content with relative z-10 */}
            <div className="relative z-10 w-24 h-auto">
                <a href="https://www.youtube.com/watch?v=Tz8ullZfVvo&list=RDTz8ullZfVvo&start_radio=1">
                    <motion.button
                        className="inline-block"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: "center" }}>
                        <X size={24} className="text-gray-400 hover:text-white transition-colors" />
                    </motion.button>
                </a>
            </div>

            {/* Center navigation */}
            <div className="relative z-10 flex-1 flex justify-center">
                <motion.div className="grid grid-cols-3 items-center justify-items-center w-fit gap-64">
                    
                    <button>
                        <motion.div className="relative text-center font-semibold h-6 w-auto rounded-xl text-Beige" whileHover="barHover">
                            Projects
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-darkBeige"
                                initial={{ opacity: 0, scaleX: 0}}
                                variants={{ barHover: { opacity: 1, scaleX: 1 } }}
                                transition={{duration: 0.5, ease: "backInOut"}}>
                            </motion.div>    
                        </motion.div>
                    </button>
                    <button id="scroll-to-experience">
                        <motion.div className="relative text-center font-semibold h-6 w-auto rounded-xl text-Beige" whileHover="barHover">
                            Experience
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-darkBeige"
                                initial={{ opacity: 0, scaleX: 0}}
                                variants={{ barHover: { opacity: 1, scaleX: 1 } }}
                                transition={{duration: 0.5, ease: "backInOut"}}>
                            </motion.div>    
                        </motion.div>
                    </button>
                    <button id="scroll-to-skills">
                        <motion.div className="relative text-center font-semibold h-6 w-auto rounded-xl text-Beige" whileHover="barHover">
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

            {/* Right side */}
            <div className="relative z-10 w-24 h-auto">
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
                        onClick={() => window.open('/Adan_Rojas_Resume.pdf', '_blank')}
                        >
                        <FileText size={24} style={{ color: '#ffff' }}/>
                    </motion.button>

                </div>
            </div>
        </motion.nav>
    );
    if (!mounted) return null;
    return createPortal(navbarContent, document.body);
}