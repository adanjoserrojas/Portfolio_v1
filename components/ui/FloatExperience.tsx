"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const FloatExperience = ({
    title, company, duration, description, imageSrc
}: {
    title?: string;
    company?: string;
    duration?: string | number;
    description?: string;
    imageSrc?: string | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    // Get navbar height on mount and window resize
    const updateNavbarHeight = () => {
      const navbar = document.querySelector('nav') || document.querySelector('[class*="nav"]') || document.querySelector('.fixed');
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight);
      } else {
        // Fallback: assume standard navbar height
        setNavbarHeight(80);
      }
    };

    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);
    
    return () => window.removeEventListener('resize', updateNavbarHeight);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = ''; // Restore scroll
  };
  return (
    <section className="flex flex-col items-center justify-items-center">
      <h1 className="text-darkBeige text-3xl font-bold mb-4 text-center">{title}</h1>
      <motion.button
          className="h-64 w-64 rounded-full bg-transparent shadow-3xl backdrop-blur-xl border-Beige/30 border-2 mx-auto p-2 m-8 cursor-pointer flex items-center justify-center"
          initial={{ y: 0 }}
          animate={{ 
              y: [0, -10, 0], 
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          whileHover={{ scale: 1.2}}
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
          alt=""
          width={256}
          height={256}
          className="relative z-20 rounded-full"
        />
      </motion.button>

      {/*Description*/}
      <div className="text-center text-darkBeige">{description}</div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ 
              zIndex: 999 // Lower than navbar so navbar stays visible
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal} // Close on backdrop click
          >
            {/* Modal Content */}
            <motion.div
              className="bg-primary border-2 border-Beige rounded-lg overflow-hidden absolute"
              style={{
                top: `${navbarHeight}px`, // Position below navbar with margin
                left: '8px',
                width: 'calc(100vw - 16px)', // Screen width minus 8px margins
                height: `calc(100vh - ${navbarHeight + 24}px)` // Available height minus navbar and margins
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-darkBeige hover:text-white z-10 text-2xl"
              >
                ×
              </button>
              
              {/* Modal content */}
              <div className="p-8 h-full overflow-y-auto">
                <h2 className="text-3xl font-bold text-darkBeige mb-4">{title}</h2>
                {company && <h3 className="text-xl text-darkBeige mb-2">{company}</h3>}
                {duration && <p className="text-lg text-darkBeige mb-4">{duration}</p>}
                {description && <p className="text-darkBeige mb-6">{description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default FloatExperience;