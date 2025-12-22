"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

interface QuizProps {
  question: string;
  options: string[];
  correctIndex: number; // 0-based index of the correct answer
}

export default function QuizComponent({ question, options, correctIndex }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return; // Prevent re-selection after answering
    setSelected(index);
    setAnswered(true);
  };

  const getOptionStyles = (index: number) => {
    if (!answered || selected !== index) {
      return {
        borderColor: "rgba(255, 255, 255, 0.1)",
        boxShadow: "none",
        backgroundColor: "transparent",
      };
    }

    const isCorrect = index === correctIndex;
    
    if (isCorrect) {
      return {
        borderColor: "#4ade80", // Light green
        boxShadow: "0 0 20px rgba(74, 222, 128, 0.4), 0 0 40px rgba(74, 222, 128, 0.2)",
        backgroundColor: "rgba(74, 222, 128, 0.1)",
      };
    } else {
      return {
        borderColor: "#0b7b8e", // Laguna
        boxShadow: "0 0 20px rgba(11, 123, 142, 0.4), 0 0 40px rgba(11, 123, 142, 0.2)",
        backgroundColor: "rgba(11, 123, 142, 0.1)",
      };
    }
  };

  const reset = () => {
    setSelected(null);
    setAnswered(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <p className="text-xl text-darkBeige/70 font-light tracking-wide">{question}</p>
      
      <div className="flex flex-col gap-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleSelect(index)}
            className="text-left px-5 py-3 rounded-lg border text-darkBeige/60 font-extralight tracking-wide transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              ...getOptionStyles(index),
            }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              boxShadow: { duration: 0.3 },
              borderColor: { duration: 0.3 },
              backgroundColor: { duration: 0.3 },
            }}
            whileHover={!answered ? { 
              borderColor: "rgba(255, 255, 255, 0.3)",
              x: 4,
            } : {}}
            whileTap={!answered ? { scale: 0.98 } : {}}
          >
            <span className="text-darkBeige/30 mr-3">{index + 1}.</span>
            {option}
          </motion.button>
        ))}
      </div>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-between mt-2"
        >
          <p className={`text-sm font-light tracking-wide ${
            selected === correctIndex ? "text-green-400/70" : "text-Laguna/70"
          }`}>
            {selected === correctIndex ? "Correct!" : `The answer was: ${options[correctIndex]}`}
          </p>
          <button
            onClick={reset}
            className="text-sm text-darkBeige/30 hover:text-darkBeige/50 transition-colors font-light"
          >
            Try again
          </button>
        </motion.div>
      )}
    </div>
  );
}