import React from 'react';
import { motion } from 'motion/react';

export default function Preloader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-12"
    >
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Concentric Diamonds with staggered animations */}
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 405 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="absolute inset-0 border-[8px] border-matrix-navy bg-matrix-navy shadow-2xl"
        />
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 405 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "circOut" }}
          className="absolute inset-[15%] border-[6px] border-matrix-blue-dark bg-matrix-blue-dark shadow-xl"
        />
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 405 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "circOut" }}
          className="absolute inset-[30%] border-[4px] border-matrix-blue-primary bg-matrix-blue-primary shadow-lg"
        />
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 405 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "circOut" }}
          className="absolute inset-[45%] border-[2px] border-matrix-blue-light bg-matrix-blue-light shadow-md"
        />

        {/* The MX+AX Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase whitespace-nowrap drop-shadow-sm">
              MX + AX + TX + RX + IX
            </span>
          </div>
        </motion.div>
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="text-matrix-navy font-black text-2xl tracking-[0.2em] uppercase">
          Matrix Solutions
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-matrix-blue-primary"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
