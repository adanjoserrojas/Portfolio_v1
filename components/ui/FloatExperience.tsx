"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Image from "next/image";

const FloatExperience = ({
    title, company, duration, description, imageSrc, innerDescription
}: {
    title?: string;
    company?: string;
    duration?: string | number;
    description?: string;
    imageSrc?: string | undefined;
    innerDescription?: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <section className="flex flex-col items-center justify-items-center border-2 border-Beige/30 rounded-4xl p-3 sm:p-4 m-2 sm:m-4 shadow-3xl bg-primary/30 backdrop-blur-lg w-full max-w-sm sm:max-w-none">
      <h1 className="text-darkBeige text-xl sm:text-2xl md:text-3xl font-extralight mb-2 sm:mb-4 text-center px-2">{title}</h1>
      <motion.button
          className="h-32 w-32 sm:h-48 sm:w-48 md:h-64 md:w-64 rounded-full bg-transparent shadow-3xl backdrop-blur-xl border-Beige/30 border-2 mx-auto p-1 sm:p-2 m-4 sm:m-8 cursor-pointer flex items-center justify-center"
          initial={{ y: 0 }}
          animate={{ 
              y: [0, -10, 0], 
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenModal}
      >
        {/* Blurred ring shadow behind image */}
        <div className="absolute inset-0 z-5 rounded-full">
          <div 
            className="absolute inset-0 rounded-full blur-lg"
            style={{
              background: `radial-gradient(circle, transparent 52%, #5DADE2 95%, #5DADE2 100%)`
            }}
          ></div>
        </div>
        <Image
          src={imageSrc || '/placeholder-profile.png'}
          alt={`${company || title} logo`}
          width={256}
          height={256}
          className="relative z-20 rounded-full w-full h-full object-cover"
        />
      </motion.button>

      {/* Description */}
      <div className="text-center text-darkBeige/50 font-extralight whitespace-pre-line text-xs sm:text-sm md:text-base px-2">{description}</div>

      {/* Modal Overlay */}
      {mounted && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col"
              style={{ zIndex: 9999 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            >
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-darkBeige z-10 text-3xl sm:text-4xl font-light transition-colors p-2"
                aria-label="Close modal"
              >
                ×
              </button>
              
              {/* Modal Content */}
              <motion.div
                className="flex-1 w-full h-full overflow-y-auto p-4 sm:p-6 md:p-8 pt-16 sm:pt-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">{title}</h2>
                  {company && <h3 className="text-lg sm:text-xl md:text-2xl text-darkBeige mb-1 sm:mb-2">{company}</h3>}
                  {duration && <p className="text-base sm:text-lg md:text-xl text-darkBeige/80 mb-4 sm:mb-6">{duration}</p>}
                  {innerDescription && (
                    <p className="text-sm sm:text-base md:text-lg text-white/90 whitespace-pre-line leading-relaxed">
                      {innerDescription}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

export default FloatExperience;