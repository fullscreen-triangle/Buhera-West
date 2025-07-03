import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FadeTransition({ 
  show, 
  children, 
  className = '', 
  animationDuration = 1000,
  ...props 
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: animationDuration / 1000,
            ease: "easeInOut"
          }}
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 