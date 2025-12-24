"use client";

import './globals.css';
import React, { useState } from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { motion } from "framer-motion";
import  { NavBar }  from "@/components/ui/nav-bar";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

import McChicken1 from '@/pictures/iPalo.png';
import McChicken2 from '@/pictures/Knight_Finder.png';
import McChicken3 from '@/pictures/Face2Learn.jpg';
import McChicken from '@/pictures/ReCueCareer.png';
import McChicken7 from '@/pictures/KH2025Logo.png';
import McChicken9 from '@/pictures/CanvasLogo.png';
import McChicken4 from '@/pictures/DSC_0037.png';

import ProjectCard from '@/components/ui/ProjectCard';
import { CardDemo } from '@/components/ui/CardDemo';
import FloatExperience from '@/components/ui/FloatExperience';
import QuizComponent from '@/components/ui/quizComponent';

export default function Landing() {

  const projects = [
    { title: "ReCueCareer", date: "Jun 2025 - Present", image: McChicken, href: "https://github.com/adanjoserrojas/iPalo", description: "AI-powered job search optimizer for students." },
    { title: "iPalo", date: "Oct 2025", image: McChicken1, href: "https://github.com/adanjoserrojas/iPalo", description: "Replacing the traditional White Cane for blind users." },
    { title: "Face2Learn", date: "Sep 2025", image: McChicken3, href: "https://github.com/adanjoserrojas/ReCueCareer", description: "Help kids with social impairments recognize facial expressions and emotions." },
    { title: "Knight Finder", date: "May 2024", image: McChicken2, href: "https://github.com/jaysprogram/Knight-Finder", description: "myUCF portal helper extension." },
  ];

  const experience = [
    { title: "Workshop Instructor", company: "Knight Hacks", duration: "August 2025 - Present", description: "This is where I teach UI/UX to Knight Hacks members.\n Knight Hacks is awesome, you should join!", imageSrc: McChicken7.src, 
      innerDescription: "In this role, I get to share my passion for UI/UX design by leading workshops for Knight Hacks members, and honestly, one of the best parts is pushing myself outside my comfort zone through public speaking. Every workshop is a chance to grow while teaching others about design principles, tools, and best practices. I love creating presentations and hands-on activities that make user-centered design click for people. Beyond the workshops, I work one-on-one with members on their projects, giving feedback and guidance to help their designs shine. I also team up with other instructors to build out a curriculum that gives our members real, practical skills they can actually use in the field. It's rewarding to see people develop their design thinking while I develop my own confidence in front of a room."
     },
    { title: "Software Engineer Intern", company: "Dahiana Rojas De Rojas LLC", duration: "June 2025 - Present", description: "I helped this Real Estate company automating processes \nAgentic workflows made with N8N.", imageSrc: McChicken9.src,
      innerDescription: "I worked with a real estate firm to build agentic workflows using N8N that automated their manual processes. One of the most rewarding parts was presenting these solutions to clients and stakeholders—it really pushed me to develop my public speaking skills and get comfortable explaining technical concepts to non-technical audiences. I collaborated with their IT department to understand their pain points, then designed and implemented automation systems that streamlined their operations. Getting to see the impact firsthand and communicate that value to clients made stepping outside my comfort zone totally worth it."
     }
  ];

  const quizData = [
    {question: "Which is my favorite music genre?", options: ["McChicken", "Latin Music", "Don Toliver", "Harsh EDM (Miau)"], correctIndex: 3},
    {question: "What do I do on my free-time?", options: ["Going Out Often Nightly", "Make music", "Play Taylor Swift LOUDLY", "Growing Outdoor Organic Nature"], correctIndex: 1},
    {question: "Which is my favorite Language?", options: ["C--", "Spanish", "Banana", "Rust"], correctIndex: 0},
    {question: "Which is my favorite animal?", options: ["Michael", "Jack", "Dogs! I love dogs, please select dogs!", "Ducks"], correctIndex: 0},
    ];

  return (
    <main className="relative bg-primary min-h-screen overflow-hidden">
      <NavBar />
      <BackgroundGradientAnimation />
      
      <div className="relative z-50 w-screen bg-primary min-h-screen flex flex-col">
        <Spotlight />
        
        <div className="flex justify-center items-center min-h-screen">
          <div className="items-center justify-items-center inline-block">
            <motion.h1
              className="text-center text-darkBeige md:text-5xl text-4xl font-extralight mt-24 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              {'Hey there! I\'m Adan'}
            </motion.h1>
            {/*<AIChatSection />*/} {/* Chat section removed for cleaner intro, will work in V2 */}
            <section className="grid grid-cols-2 gap-16 items-center justify-items-center px-16 max-w-7xl mx-auto"> 
              <motion.p 
                  className="md:text-lg text-xs text-darkBeige/50 font-extralight leading-relaxed tracking-wide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                >
                  {'I\'m a Full-Stack Developer passionate about crafting elegant, efficient web solutions that feel as good to use as they are to build.'}
                  <br /><br />
                  {'I enjoy turning complex ideas into clean, intuitive experiences. Alongside web development, I\'m actively exploring machine learning and quantitative research. These fields I\'m just beginning to dive into, driven by curiosity and a desire to understand how data, models, and mathematics can power smarter systems.'}
                  <br /><br />
                  {'This minimalist portfolio reflects how I think and work: focused, intentional, and always evolving, where creativity meets functionality and learning never stops.'}
                </motion.p>
                <motion.img 
                  src={McChicken4.src} 
                  alt="Adan Rojas Professional Picture" 
                  className='md:w-[420px] md:h-[420px] sm:w-[280px] sm:h-[280px] rounded-full border border-white/20 shadow-lg object-cover'
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
            </section>
          </div> 
        </div>
        
        <h1 id="projects" className="text-center text-5xl text-darkBeige font-extralight transEffectText1 gap-8 m-8">Projects</h1>
        <p className="text-center text-lg text-darkBeige/40 font-extralight m-8">
          {'Here are some of my personal and collaborative projects that I\'ve worked on recently.'}
        </p>
        <div className="m-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-8 gap-8">
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

        <h2 id="skills" className='text-center text-5xl text-darkBeige font-extralight transEffectText1 gap-8 m-8'>Skills</h2>
        <p className="text-center text-lg text-darkBeige/40 font-extralight m-8">
          {'Here are some of the technologies and tools I work with:'}
        </p>
        <CardDemo />
            
        <h3 id="experience" className='text-center text-5xl text-darkBeige font-extralight transEffectText1 gap-8 m-8'> Experience</h3>
        <p className="text-center text-lg text-darkBeige/40 font-extralight m-8">
          {'A few roles I\'ve had the pleasure to work in recently:'}
        </p>
        <section className="items-center justify-items-center px-4">
          <div className='grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-4 sm:gap-8 m-4 sm:m-8 max-w-5xl mx-auto'>
          {experience.map((exp) => (
            <FloatExperience
              key={exp.title}
              title={exp.title}
              company={exp.company}
              duration={exp.duration}
              description={exp.description}
              innerDescription={exp.innerDescription}
              imageSrc={exp.imageSrc}
            />
          ))}
          </div>
        </section>
        
        <h4 className='text-center text-5xl text-darkBeige font-extralight gap-8 m-8'>A little quiz about Me</h4>
        <p className="text-center text-lg text-darkBeige/40 font-extralight m-8">
          {'To finish off, here is a fun little quiz to see how well you know me! If you guess all of them right, you will get redirected to a very important and secret project of mine'}
          <br></br>
          {'That I have been working on my own and very few people know about it! Good Luck, the quiz is Lowkey hard!'}
        </p>
        <div className='grid grid-cols-2 grid-rows-3 gap-12 items-center justify-items-center max-w-6xl mx-auto px-8 py-12'>
          <video
            src="/videos/headBanging.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-[500px] h-auto rounded-xl border border-white/10 shadow-lg"
          />
          {quizData.map((quiz) => (
            <QuizComponent
              key={quiz.question}
              question={quiz.question}
              options={quiz.options}
              correctIndex={quiz.correctIndex}
            />
          ))}
          <video
          src="/videos/CatBiting.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-w-[500px] h-auto rounded-xl border border-white/10 shadow-lg"/>
        </div>
      </div>
    </main>
  );
}
