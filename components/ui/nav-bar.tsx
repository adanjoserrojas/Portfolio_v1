"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, FileText } from 'lucide-react';
import { X } from 'lucide-react';

export function NavBar(){

    /*const [isVisible, setisVisible] = useState(true);
    const [isHovered, setisHovered] = useState(false);*/

    return (
        <div className="flex justify-between items-center w-full py-4 px-4">

            <motion.div
                className="inline-block"
                animate={{ rotate: 360 }}
                transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                style={{ transformOrigin: "center" }}>
                <X size={24} className="text-gray-400 hover:text-white transition-colors" />
            </motion.div>

            <div className="w-24 h-auto">
                <div className="grid grid-cols-3 ml-auto w-fit gap-4">

                    <a href="https://github.com/adanjoserrojas">
                        <motion.button
                            className="" 
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                            <Github size={24} style={{ color: '#c6c3b6' }}/>
                        </motion.button>
                    </a>

                    <a href="https://www.linkedin.com/in/adan-rojas/">
                        <motion.button

                            className=""
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            >

                            <Linkedin size={24} style={{ color: '#c6c3b6' }}/>
                        </motion.button>
                    </a>

                    <motion.button
                        className=""
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={() => window.open('/Adan_Rojas_Resume.pdf', '_blank')}
                        >
                        <FileText size={24} style={{ color: '#c6c3b6' }}/>
                    </motion.button>

                </div>
            </div>
        </div>  
    );
}