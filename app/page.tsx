"use client";
import './globals.css';
import React, { useState } from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { motion, AnimatePresence } from "framer-motion";
import  { NavBar }  from "@/components/ui/nav-bar";
import AIChatSection from '@/components/ui/chat-section';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";

export default function Landing() {

    return (
    <main>
    <NavBar />
        <Parallax pages={2} className='no-scrollbar'>
            <ParallaxLayer offset={0} speed={1}>
                <div className="absolute z-50 h-screen w-full bg-primary antialiased">
                <Spotlight />
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="items-center justify-items-center inline-block">
                            <motion.h1
                                className="text-center text-darkBeige text-5xl font-thin mt-24"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{duration: 2}}>
                                Hey there! I'm Adan
                            </motion.h1>
                            <AIChatSection />
                        </div>   
                    </div>
                </div>
            </ParallaxLayer>
            <ParallaxLayer offset={1} speed={1}>
                <h2 className="text-center text-darkBeige text-5xl font-thin mt-24">
                    Hello Moto!
                </h2>
            </ParallaxLayer>
        </Parallax>
    </main>
    );
}
