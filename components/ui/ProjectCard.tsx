"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import type { StaticImageData } from 'next/image';
import { RotatingCube } from "./RotatingCube";
import { flushSync } from "react-dom";

type ProjectCardProps = {
  title: string;
  date: string;
  image: any;
  href?: string;
  description?: string;
  className?: string;
};

const GLASSHOVERANIMATION = {
  initial: { opacity: 0 },
  animate: { opacity: 0, scale: 0.9 },
  transition: { duration: 1, type: "spring" },
  whileHover: { opacity: 1, scale: 1 },
  whileTap: { scale: 0.98 },
} as const;

export default function ProjectCard({
  title,
  date,
  image,
  href = "#",
  description = "Brief description goes here.",
  className = "",
}: ProjectCardProps) {

  const [isDisappearing, setIsDisappearing] = useState(false);
  const [showCube, setShowCube] = useState(false);

  const handleLearnMore = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDisappearing(true);
    await new Promise(res => setTimeout(res, 100));

    flushSync(() => setShowCube(true)); // cube renders right away

    await new Promise(res => setTimeout(res, 2000));
    window.open(href, "_blank");

    flushSync(() => setShowCube(false));
    setIsDisappearing(false);
  };
  
  return (
    <div className="w-full h-120">
      {!showCube ? (
        <motion.div 
          className="w-full h-full bg-Black-100 rounded-lg shadow-md flex flex-col overflow-hidden border-Beige/30 border-1 relative"
          initial={{ opacity: 1 }}
          animate={isDisappearing ? { 
            opacity: 0
          } : { 
            opacity: 1
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h3 className="text-darkBeige text-lg font-semibold text-center p-3">{title}</h3>

          <div className="flex-1 flex items-center justify-center relative pointer-events-none">
            <Image src={image} alt={title} className="w-full h-full object-cover" />
            <span className="absolute bottom-2 right-2 bg-Black-100/80 text-darkBeige px-3 py-1 rounded text-sm">{date}</span>
          </div>

          <div className="p-3 flex justify-center pointer-events-none">
            <button
              onClick={handleLearnMore}
              className="text-darkBeige text-sm pointer-events-auto relative z-10 hover:text-Beige transition-colors cursor-pointer"
            >
              Click to learn more!
            </button>
          </div>

          <motion.div
            className="absolute inset-0 border-black rounded-lg backdrop-blur-lg bg-Laguna/30 flex items-center justify-center p-6 pointer-events-auto"
            {...GLASSHOVERANIMATION}
          >
            <p className="text-darkBeige text-center text-sm">{description}</p>
          </motion.div>
        </motion.div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
            <RotatingCube/>
        </div>
      )}
    </div>
  );
}