"use client";
import './globals.css';
import React, { useState } from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { motion, AnimatePresence } from "framer-motion";
import  { NavBar }  from "@/components/ui/nav-bar";
import AIChatSection from '@/components/ui/chat-section';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import Image from 'next/image';
import McChicken1 from '@/pictures/iPalo.png';
import McChicken2 from '@/pictures/Knight_Finder.png';
import McChicken3 from '@/pictures/Face2Learn.jpg';
import McChicken from '@/pictures/ReCueCareer.png';
import ProjectCard from "@/components/ui/ProjectCard";
import { CardDemo } from '@/components/ui/CardDemo';

export default function Landing() {

    const GLASSHOVERANIMATION = {
        initial : { opacity: 0 },
        animate: { opacity: 0, scale: 0.9 },
        transition: { duration: 0.5, type: "spring" },
        whileHover: { opacity: 1, scale: 1 },
        whileTap: { scale: 0.9 }
    } as const;

    const projects = [
        { title: "ReCueCareer", date: "Jun 2025 - Present", image: McChicken, href: "https://github.com/adanjoserrojas/iPalo", description: "AI-powered job search optimizer for students." },
        { title: "iPalo", date: "Oct 2025", image: McChicken1, href: "https://github.com/adanjoserrojas/iPalo", description: "Replacing the traditional White Cane for blind users." },
        { title: "Face2Learn", date: "Sep 2025", image: McChicken3, href: "https://github.com/adanjoserrojas/ReCueCareer", description: "Help kids with social impairments recognize facial expressions and emotions." },
        { title: "Knight Finder", date: "May 2024", image: McChicken2, href: "https://github.com/jaysprogram/Knight-Finder", description: "myUCF portal helper extension." },
      ];

    
    return (
    <main className="relative bg-primary min-h-screen overflow-hidden">
        <NavBar />
        <BackgroundGradientAnimation />
    {/* First Layer - Hero */}
        <div className="relative z-50 w-screen bg-primary min-h-screen flex flex-col">
            <Spotlight />
            <div className="flex justify-center items-center min-h-screen">
                <div className="items-center justify-items-center inline-block">
                    <motion.h1
                        className="text-center text-darkBeige text-5xl mt-24 font-inter font-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{duration: 2}}>
                        Hey there! I'm Adan
                    </motion.h1>
                    <AIChatSection />
                </div>   
            </div>

        <h1 id="projects" className="text-center text-5xl text-darkBeige transEffectText1">Projects</h1>

        <div className="m-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((p) => (
              <ProjectCard
                key={p.title}
                title={p.title}
                date={p.date}
                image={p.image}
                href={p.href}
                description={p.description}
              />
            ))}
          </div>
        </div>

        <h2 className='sticky text-center text-5xl text-darkBeige transEffectText1'> Skills</h2>
        <CardDemo /> 
            
            
            
        <h3 id="experience" className='text-center text-5xl text-darkBeige font-bold transEffectText1'> Experience</h3>
        <div className='flex justify-center items-center min-h-screen'>
                
        </div>
        <h3 id="experience" className='text-center text-5xl text-darkBeige z-50 transEffectText1'> The End of the Page... Where the fun begins!</h3>
        <div className='flex justify-center items-center min-h-screen'>
                
        </div>
      </div>
    </main>
    );
}
