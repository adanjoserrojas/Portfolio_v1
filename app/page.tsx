"use client";
import './globals.css';
import React, { useState } from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { motion, AnimatePresence } from "framer-motion";
import { NavBar } from "@/components/ui/nav-bar";

export default function Landing() {

    return (
        <div className="h-screen w-full bg-primary antialiased bg-grid-white/[0.02] relative overflow-x-hidden">
        <NavBar />
        <Spotlight />
        <div className="flex justify-center items-center min-h-screen">
            <div className="items-center justify-items-center inline-block"> 
                <motion.h1

                    className="flex items-center justify-center text-darkBeige text-7xl font-thin"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{duration: 2}}
                    exit={{}}>
                    Hi, I'm Adan!
                    
                </motion.h1>

                <motion.div

                    className="w-full h-0.5 mt-2 bg-darkBeige"
                    initial={{ opacity: 0, scaleX: 0}}
                    animate={{ opacity: 1, scaleX: 1}}
                    transition={{duration: 2}}
                    exit={{opacity: 0 }}>
                    
                </motion.div>
            </div>   
        
        </div>
        </div>
    );
}
