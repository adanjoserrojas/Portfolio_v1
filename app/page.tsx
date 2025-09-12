"use client";
import './globals.css';
import React, { useState } from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { motion, AnimatePresence } from "framer-motion";
import { NavBar } from "@/components/ui/nav-bar";
import AIChatSection from '@/components/ui/chat-section';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export default function Landing() {

    return (
        <BackgroundGradientAnimation>
            <div className="absolute z-50 h-screen w-full bg-primary antialiased">
            <NavBar />
            <Spotlight />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="items-center justify-items-center inline-block">
                        <motion.h1
                            className="grid grid-row-3 gap-12 text-center text-darkBeige text-5xl font-thin"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{duration: 2}}
                            exit={{}}>
                            <p className="text-darkBeige"></p>
                            Hey there! I'm Adan 
                        </motion.h1>
                        <AIChatSection />

                    </div>   
                </div>
            </div>
        </BackgroundGradientAnimation>
    );
}
