"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import { Github, Linkedin, FileText } from 'lucide-react';
import { X } from 'lucide-react';
import Link from 'next/link';

export function NavBar(){

    {/*const [isVisible, setisVisible] = useState(true);*/}

    return (
        <div className="flex justify-between items-center w-full py-4 px-4">

{/* Left side of NavBar */}

            <a className="w-24 h-auto" href="https://www.youtube.com/watch?v=Tz8ullZfVvo&list=RDTz8ullZfVvo&start_radio=1">
                <motion.button
                    className="inline-block"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "center" }}>
                    
                    <X size={24} className="text-gray-400 hover:text-white transition-colors" />
                </motion.button>
            </a>

{/* Center of NavBar */}

            <div className="grid grid-cols-3 items-center justify-items-center w-fit gap-64">
                
                {/*onClick={() => setisVisible(!isVisible)}>*/}
                <Link href="/projects">
                    <motion.div className="relative text-center font-semibold h-6 w-auto rounded-xl text-Beige" whileHover="barHover">
                        Projects
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-darkBeige"
                            initial={{ opacity: 0, scaleX: 0}}
                            variants={{ barHover: { opacity: 1, scaleX: 1 } }}
                            transition={{duration: 0.5, ease: "backInOut"}}>
                        </motion.div>    
                    </motion.div>
                </Link>
                <Link href="/experience">
                    <motion.div className="relative text-center font-semibold h-6 w-auto rounded-xl text-Beige" whileHover="barHover">
                        Experience
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-darkBeige"
                            initial={{ opacity: 0, scaleX: 0}}
                            variants={{ barHover: { opacity: 1, scaleX: 1 } }}
                            transition={{duration: 0.5, ease: "backInOut"}}>
                        </motion.div>    
                    </motion.div>
                </Link>
                <Link href="/skills">
                    <motion.div className="relative text-center font-semibold h-6 w-auto rounded-xl text-Beige" whileHover="barHover">
                        Skills
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-darkBeige"
                            initial={{ opacity: 0, scaleX: 0}}
                            variants={{ barHover: { opacity: 1, scaleX: 1 } }}
                            transition={{duration: 0.5, ease: "backInOut"}}>
                        </motion.div>    
                    </motion.div>
                </Link>
            </div>

{/* Right side of NavBar */} 

            <div className="w-24 h-auto">
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
        </div>  
    );
}