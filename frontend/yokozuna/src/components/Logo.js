import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'

// Animation variants for the progressive drawing effect (5 minutes total)
const pathVariants = {
  hidden: { 
    pathLength: 0,
    opacity: 0 
  },
  visible: (custom) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 300, // 5 minutes total duration
        delay: custom * 1.5, // Stagger each path by 1.5 seconds
        ease: "easeInOut"
      },
      opacity: {
        duration: 1,
        delay: custom * 1.5,
        ease: "easeInOut"
      },
      repeat: Infinity,
      repeatDelay: 30 // 30 second pause between loops
    }
  })
}

const AnimatedLogo = (props) => {
  return (
    <motion.svg
      id="svg8449"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 151.8 156.82"
      width="64"
      height="64"
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      {...props}
    >
      <defs>
        <style>
          {
            ".cls-1,.cls-2{stroke:#2563eb;stroke-width:.15px;fill:none}.cls-1{fill:#2563eb;fill-opacity:0.1}"
          }
        </style>
      </defs>
      
      {/* First group - Main body structure */}
      <motion.path
        id="path5481"
        className="cls-2"
        d="M51.19 62.55l10.59 48.14-1.88 5.84-16.13 16.07 2.71 5.89 16.6-1.34 3.25.85.32 5.55s.05 2.34.43 4.59c.39 2.25 1.12 4.37 1.12 4.37s.33-2.16.46-3.67c.14-1.51.03-4.05.03-4.05l-.3-5.5 4.61-.12.45-.53-.32-7.93.68-.02-.18-5.13-.64.02-.3-8.49.33-46.74-6.89-8.77-.99-28.42s-.24-3.16-.55-5.85c-.32-2.7-.71-4.93-.71-4.93s-.25-1.72-.68-3.67c-.43-1.95-.55-3.1-1.04-4.13-.48-1.02-.89.03-.89.03s-.73 1.07-1.35 2.77c-.62 1.7-.78 2.16-1.39 4.33-.6 2.18-.74 2.64-1.28 4.67-.55 2.04-.65 3.17-.65 3.17l-.86 3.34-.47 2.44-.31 1.96-1.02.31.1 2.78.52-.02.04 1.86v.06s-1.08 1.1-3.33 5.93-.83 10.39-.83 10.39-.85-4.86.73 3.92z"
        variants={pathVariants}
        custom={0}
      />
      
      {/* Additional detail paths with progressive delays */}
      <motion.path
        id="path5483"
        className="cls-2"
        d="M51.46 63.73c3.39-2.17 3.41-2.2 3.41-2.2V49.89l1.88-5.93-2.14-2.45"
        variants={pathVariants}
        custom={1}
      />
      
      <motion.path
        id="path5485"
        className="cls-2"
        d="M56.76 43.96l8.73-.3"
        variants={pathVariants}
        custom={2}
      />
      
      <motion.path
        id="path5487"
        className="cls-2"
        d="M51.84 65.33l12.04-.42-.33-9.46-1.38.05.1 2.78 1.38-.05"
        variants={pathVariants}
        custom={3}
      />

      {/* Continue with more paths, each with incremental delays */}
      <motion.path
        id="path5489"
        className="cls-2"
        d="M62.86 64.98l-.2-5.75.97-.03"
        variants={pathVariants}
        custom={4}
      />

      <motion.path
        id="path5595"
        className="cls-1"
        d="M51.21 62.4l2.36-1.8-.34-9.67-2.41-1.56c-1.13 3.88-.75 7.23.39 13.03z"
        variants={pathVariants}
        custom={5}
      />

      <motion.path
        id="path5597"
        className="cls-1"
        d="M51.22 48.51l1.86 1.14.94.12.92-2.95-.12-3.49-.65-.37-.08.15c-.88 1.17-2 3.44-2.87 5.4z"
        variants={pathVariants}
        custom={6}
      />

      {/* Second major group */}
      <motion.path
        id="path5363"
        className="cls-2"
        d="M70.06 69.09L57.28 116.7l-4.36 4.32-21.72 6.82-.31 6.48 15.35 6.46 2.49 2.26-2.27 5.08s-1.04 2.1-1.73 4.28c-.69 2.17-1.02 4.39-1.02 4.39s1.28-1.77 2.1-3.05c.82-1.28 1.89-3.58 1.89-3.58l2.26-5.02 4.14 2.02.64-.26 3.37-7.19.61.29 2.21-4.64-.57-.27 3.65-7.67 21.83-41.33-2.07-10.95 12.22-25.68s1.25-2.91 2.21-5.45 1.64-4.71 1.64-4.71.57-1.64 1.09-3.57c.52-1.93.94-3.01.98-4.14.04-1.13-.8-.38-.8-.38s-1.14.61-2.47 1.83c-1.33 1.22-1.69 1.55-3.23 3.21-1.54 1.65-1.87 2-3.29 3.56s-2.03 2.52-2.03 2.52l-2.3 2.57-1.54 1.95-1.18 1.6-1.05-.19-1.19 2.51.47.22-.82 1.66-.04.04s-1.45.48-5.68 3.74-5.52 8.84-5.52 8.84 1.48-4.7-1.16 3.82z"
        variants={pathVariants}
        custom={20}
      />

      {/* Final complex sections with longer delays */}
      <motion.path
        id="path6190"
        className="cls-2"
        d="M95.29 84.1l-43.02 24.07-6.14-.11-20.05-10.8-4.86 4.3 6.09 15.51.12 3.36-5.22 1.91s-2.23.72-4.27 1.74c-2.04 1.02-3.86 2.33-3.86 2.33s2.16-.31 3.65-.62c1.49-.3 3.88-1.14 3.88-1.14l5.17-1.88 1.45 4.38.63.28 7.5-2.6.22.64 4.86-1.66-.21-.6 8.04-2.74 44.83-13.2 6.4-9.13 26.92-9.17s2.95-1.14 5.44-2.22c2.49-1.08 4.52-2.11 4.52-2.11s1.58-.74 3.32-1.71c1.74-.97 2.81-1.43 3.65-2.18.84-.76-.29-.84-.29-.84s-1.23-.39-3.04-.49c-1.81-.1-2.29-.13-4.55-.07-2.26.05-2.74.06-4.85.13s-3.22.3-3.22.3l-3.45.14-2.47.26-1.97.27-.59-.89-2.63.9.17.5-1.76.57h-.06s-1.36-.7-6.64-1.46c-5.28-.76-10.19 2.21-10.19 2.21s4.4-2.22-3.55 1.84z"
        variants={pathVariants}
        custom={80}
      />

      {/* Add a few more key structural paths with appropriate delays */}
      <motion.path
        id="path6304"
        className="cls-1"
        d="M95.43 84.08l2.4 1.74 9.16-3.12.8-2.76c-4.04.04-7.14 1.37-12.36 4.14z"
        variants={pathVariants}
        custom={85}
      />

      <motion.path
        id="path6306"
        className="cls-1"
        d="M108.73 80.07l-.55 2.11.15.93 3.09.03 3.31-1.13.17-.73-.17-.03c-1.37-.5-3.87-.92-6-1.19z"
        variants={pathVariants}
        custom={90}
      />
    </motion.svg>
  )
}

const Logo = () => {
  return (
    <div className='flex flex-col items-center justify-center mt-2'>
      <motion.div
        className='flex items-center justify-center rounded-full w-16 h-16 bg-white dark:bg-gray-800 border-2 border-solid border-gray-300 dark:border-light overflow-hidden p-2'
        whileHover={{
          scale: 1.1,
          transition: { duration: 0.3 }
        }}
      >
        <Link href="/">
          <AnimatedLogo className="w-full h-full object-contain" />
        </Link>
      </motion.div>
    </div>
  )
}

export default Logo
