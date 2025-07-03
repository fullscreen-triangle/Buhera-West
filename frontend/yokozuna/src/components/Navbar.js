import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeSwitch } from "./Hooks/useThemeSwitch";
import { TwitterIcon, LinkedInIcon, PinterestIcon, DribbbleIcon, GithubIcon, SunIcon, MoonIcon } from "./Icons";

// Custom sensor system icons
const SatelliteIcon = ({ className = "", isActive = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2L8 6L10 8L14 4L12 2Z" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2" 
      fill={isActive ? "#3b82f6" : "none"}
      filter={isActive ? "drop-shadow(0 0 6px #3b82f6)" : "none"}
    />
    <path 
      d="M16 8L20 12L18 14L14 10L16 8Z" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2" 
      fill={isActive ? "#3b82f6" : "none"}
    />
    <circle 
      cx="12" 
      cy="12" 
      r="3" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2" 
      fill={isActive ? "#3b82f6" : "none"}
    />
    <path 
      d="M8 16L4 20L6 22L10 18L8 16Z" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2" 
      fill={isActive ? "#3b82f6" : "none"}
    />
  </svg>
);

const CellTowerIcon = ({ className = "", isActive = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2V22" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
      filter={isActive ? "drop-shadow(0 0 6px #3b82f6)" : "none"}
    />
    <path 
      d="M8 6L16 6" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M6 10L18 10" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M4 14L20 14" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <circle 
      cx="12" 
      cy="18" 
      r="2" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2" 
      fill={isActive ? "#3b82f6" : "none"}
    />
  </svg>
);

const WeatherStationIcon = ({ className = "", isActive = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2V6" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
      filter={isActive ? "drop-shadow(0 0 6px #3b82f6)" : "none"}
    />
    <circle 
      cx="12" 
      cy="8" 
      r="2" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2" 
      fill={isActive ? "#3b82f6" : "none"}
    />
    <path 
      d="M12 10V14" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M8 14H16" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M10 18H14" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M12 18V22" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
  </svg>
);

const GPSIcon = ({ className = "", isActive = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle 
      cx="12" 
      cy="12" 
      r="8" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
      filter={isActive ? "drop-shadow(0 0 6px #3b82f6)" : "none"}
    />
    <circle 
      cx="12" 
      cy="12" 
      r="3" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2" 
      fill={isActive ? "#3b82f6" : "none"}
    />
    <path 
      d="M12 2V4" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M12 20V22" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M2 12H4" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M20 12H22" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
  </svg>
);

const AtmosphericSensorIcon = ({ className = "", isActive = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M3 12H7" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
      filter={isActive ? "drop-shadow(0 0 6px #3b82f6)" : "none"}
    />
    <path 
      d="M17 12H21" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M5 8H9" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M15 8H19" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M7 16H11" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <path 
      d="M13 16H17" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="2" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2" 
      fill={isActive ? "#3b82f6" : "none"}
    />
  </svg>
);

const SoilSensorIcon = ({ className = "", isActive = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M2 18H22" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
      filter={isActive ? "drop-shadow(0 0 6px #3b82f6)" : "none"}
    />
    <path 
      d="M4 18V20H20V18" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2" 
      fill={isActive ? "#3b82f6" : "none"}
    />
    <circle 
      cx="8" 
      cy="14" 
      r="1" 
      fill={isActive ? "#60a5fa" : "currentColor"}
    />
    <circle 
      cx="16" 
      cy="14" 
      r="1" 
      fill={isActive ? "#60a5fa" : "currentColor"}
    />
    <path 
      d="M12 4V18" 
      stroke={isActive ? "#60a5fa" : "currentColor"} 
      strokeWidth="2"
    />
    <circle 
      cx="12" 
      cy="8" 
      r="1" 
      fill={isActive ? "#60a5fa" : "currentColor"}
    />
    <circle 
      cx="12" 
      cy="12" 
      r="1" 
      fill={isActive ? "#60a5fa" : "currentColor"}
    />
  </svg>
);

const DropdownMenu = ({ title, items, isActive = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const router = useRouter();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const isItemActive = items.some(item => router.asPath === item.href);

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className={`${isItemActive ? 'text-blue-500 dark:text-blue-400' : ''} rounded relative group lg:text-light lg:dark:text-dark text-sm flex items-center px-3 py-2 transition-colors duration-200 hover:text-blue-500 dark:hover:text-blue-400`}
      >
        {title}
        <svg 
          className={`ml-1 w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span
          className={`
            inline-block h-[1px] bg-dark absolute left-0 -bottom-0.5 
            group-hover:w-full transition-[width] ease duration-300 dark:bg-light
            ${isItemActive ? "w-full" : " w-0"} lg:bg-light lg:dark:bg-dark
          `}
        >
          &nbsp;
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="py-2">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    router.asPath === item.href 
                      ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomLink = ({ href, title, className = "" }) => {
  const router = useRouter();

  return (
    <Link href={href} className={`${className} relative group`}>
      {title}

      <span
        className={`
          h-[1px] inline-block bg-dark absolute left-0 -bottom-0.5
          group-hover:w-full transition-[width] ease duration-300
          ${router.asPath === href ? 'w-full' : 'w-0'}
          dark:bg-light`}
      >
        &nbsp;
      </span>
    </Link>
  );
};

const MobileDropdownMenu = ({ title, items, toggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (href) => {
    toggle();
    router.push(href);
  };

  const isItemActive = items.some(item => router.asPath === item.href);

  return (
    <div className="w-full">
      <button 
        onClick={handleToggle}
        className={`${isItemActive ? 'text-blue-400' : 'text-light dark:text-dark'} w-full text-left rounded relative group text-sm flex items-center justify-between px-4 py-3 transition-colors duration-200`}
      >
        <span>{title}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span
          className={`
            inline-block h-[1px] bg-light dark:bg-dark absolute left-0 -bottom-0.5 
            group-hover:w-full transition-[width] ease duration-300
            ${isItemActive ? "w-full" : " w-0"}
          `}
        >
          &nbsp;
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-4 pb-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item.href)}
                  className={`block w-full text-left px-4 py-2 text-sm rounded transition-colors duration-150 ${
                    router.asPath === item.href 
                      ? 'text-blue-400 bg-blue-900/20' 
                      : 'text-light dark:text-dark hover:bg-light/10 dark:hover:bg-dark/10'
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs text-light/60 dark:text-dark/60 mt-1">
                      {item.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomMobileLink = ({ href, title, className = "", toggle }) => {
  const router = useRouter();

  const handleClick = () => {
    toggle();
    router.push(href);
  }

  return (
    <button href={href} className={`${className} relative group text-light dark:text-dark my-2`} onClick={handleClick}>
      {title}

      <span
        className={`
          h-[1px] inline-block bg-light absolute left-0 -bottom-0.5
          group-hover:w-full transition-[width] ease duration-300
          ${router.asPath === href ? 'w-full' : 'w-0'}
          dark:bg-dark`}
      >
        &nbsp;
      </span>
    </button>
  );
};

const Navbar = () => {
  const [mode, setMode] = useThemeSwitch();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  // Navigation menu structure
  const navigationMenus = {
    environmental: {
      title: "Environmental",
      items: [
        {
          href: "/weather/weather",
          title: "Weather",
          icon: "🌦️",
          description: "Atmospheric analysis & forecasting"
        },
        {
          href: "/weather/atmosphere",
          title: "Atmosphere",
          icon: "🌪️",
          description: "Immersive atmospheric visualization"
        },
        {
          href: "/agriculture/agriculture", 
          title: "Agriculture",
          icon: "🌾",
          description: "Crop monitoring & optimization"
        },
        {
          href: "/agriculture/crops",
          title: "Crops",
          icon: "🌽",
          description: "Crop field analysis & monitoring"
        },
        {
          href: "/water/hydrology",
          title: "Hydrology", 
          icon: "💧",
          description: "Groundwater detection & analysis"
        },
        {
          href: "/water/subterrainian",
          title: "Subterranean",
          icon: "🏔️",
          description: "3D water table visualization"
        }
      ]
    },
    geological: {
      title: "Geological",
      items: [
        {
          href: "/geology/geography",
          title: "Geography",
          icon: "🗺️", 
          description: "Terrain mapping & analysis"
        },
        {
          href: "/geology/geology",
          title: "Geology",
          icon: "🪨",
          description: "Mineral detection & subsurface"
        }
      ]
    },
    technology: {
      title: "Technology",
      items: [
        {
          href: "/sensors/distributed",
          title: "Distributed Sensors",
          icon: "📡",
          description: "Global sensor network infrastructure"
        },
        {
          href: "/sensors/terrestrial",
          title: "Terrestrial Sensors",
          icon: "🗼",
          description: "Ground-based sensor systems"
        },
        {
          href: "/sensors/extraterrestrial-mechanics",
          title: "Extraterrestrial",
          icon: "🛰️",
          description: "Satellite orbital mechanics"
        },
        {
          href: "/sensors/reconstruction",
          title: "Reconstruction",
          icon: "🔄",
          description: "Signal reconstruction & analysis"
        },
        {
          href: "/location",
          title: "Location",
          icon: "📍",
          description: "Geographic positioning & mapping"
        }
      ]
    },
    analysis: {
      title: "Analysis", 
      items: [
        {
          href: "/weather/state",
          title: "State Analysis",
          icon: "📊",
          description: "System state & diagnostics"
        }
      ]
    },
    cosmology: {
      title: "Cosmology",
      items: [
        {
          href: "/cosmology/properties",
          title: "Properties",
          icon: "⚛️",
          description: "Cosmological properties & analysis"
        },
        {
          href: "/cosmology/solar-system",
          title: "Solar System",
          icon: "☀️",
          description: "Solar system visualization"
        }
      ]
    },
    oceanography: {
      title: "Oceanography",
      items: [
        {
          href: "/oceanoegraphy/agulhas",
          title: "Agulhas Current",
          icon: "🌊",
          description: "Indian Ocean current analysis"
        },
        {
          href: "/oceanoegraphy/benguela",
          title: "Benguela Current",
          icon: "🐟",
          description: "Atlantic Ocean upwelling system"
        }
      ]
    },
    tools: {
      title: "Tools",
      items: [
        {
          href: "/test-timeline",
          title: "Timeline",
          icon: "⏰",
          description: "Global timeline visualization"
        },
        {
          href: "/audio-demo",
          title: "Audio Demo",
          icon: "🔊",
          description: "Ambient audio demonstration"
        }
      ]
    },
    resources: {
      title: "Resources",
      items: [
        {
          href: "/articles",
          title: "Articles",
          icon: "📰",
          description: "Technical articles & documentation"
        },
        {
          href: "/projects",
          title: "Projects",
          icon: "🚀",
          description: "Featured projects & case studies"
        },
        {
          href: "/about",
          title: "About",
          icon: "ℹ️",
          description: "About the platform & team"
        }
      ]
    }
  };

  // Determine which sensors should be active based on current page
  const getSensorStates = () => {
    const path = router.asPath;
    return {
      satellite: path.includes('weather') || path.includes('geography') || path.includes('location') || path.includes('extraterrestrial-mechanics') || path.includes('sensors') || path.includes('cosmology') || path.includes('oceanoegraphy'),
      cellTower: path.includes('weather') || path.includes('hydrology') || path.includes('terrestrial') || path.includes('sensors') || path.includes('location'),
      weatherStation: path.includes('weather') || path.includes('agriculture') || path.includes('sensors'),
      gps: path.includes('geography') || path.includes('geology') || path.includes('location') || path.includes('sensors') || path.includes('distributed') || path.includes('reconstruction'),
      atmospheric: path.includes('weather') || path.includes('agriculture') || path.includes('sensors') || path.includes('atmosphere'),
      soil: path.includes('agriculture') || path.includes('geology') || path.includes('hydrology') || path.includes('sensors') || path.includes('subterrainian')
    };
  };

  const sensorStates = getSensorStates();

  return (
    <header
      className='w-full px-32 py-8 font-medium flex items-center justify-between
      dark:text-light relative z-10 lg:px-16 md:px-12 sm:px-8'
    >

      <button className='flex-col justify-center items-center hidden lg:flex' onClick={handleClick}>
        <span className={`bg-dark dark:bg-light block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
        <span className={`bg-dark dark:bg-light block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
        <span className={`bg-dark dark:bg-light block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
      </button>

      <div className='w-full flex justify-between items-center lg:hidden'>
        <nav className='flex items-center'>
          <CustomLink href="/" title="Home" className='mr-4' />
          <DropdownMenu title="Environmental" items={navigationMenus.environmental.items} />
          <DropdownMenu title="Geological" items={navigationMenus.geological.items} />
          <DropdownMenu title="Technology" items={navigationMenus.technology.items} />
          <DropdownMenu title="Analysis" items={navigationMenus.analysis.items} />
          <DropdownMenu title="Cosmology" items={navigationMenus.cosmology.items} />
          <DropdownMenu title="Oceanography" items={navigationMenus.oceanography.items} />
          <DropdownMenu title="Tools" items={navigationMenus.tools.items} />
          <DropdownMenu title="Resources" items={navigationMenus.resources.items} />
        </nav>

        {/* Sensor Status Indicators */}
        <div className="flex items-center space-x-2 text-xs">
          <SatelliteIcon className="w-4 h-4" isActive={sensorStates.satellite} />
          <CellTowerIcon className="w-4 h-4" isActive={sensorStates.cellTower} />
          <WeatherStationIcon className="w-4 h-4" isActive={sensorStates.weatherStation} />
          <GPSIcon className="w-4 h-4" isActive={sensorStates.gps} />
          <AtmosphericSensorIcon className="w-4 h-4" isActive={sensorStates.atmospheric} />
          <SoilSensorIcon className="w-4 h-4" isActive={sensorStates.soil} />
        </div>
      </div>

      {
        isOpen ?
          <motion.div
            initial={{scale:0, opacity:0, x: "-50%", y: "-50%"}}
            animate={{scale:1, opacity:1}}
            className='min-w-[70vw] flex flex-col justify-between z-30 items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
      bg-dark/90 dark:bg-light/75 rounded-lg backdrop-blur-md py-32'
          >
            <nav className='flex items-center flex-col justify-center'>
              <CustomMobileLink href="/" title="Home" className='' toggle={handleClick} />
              <MobileDropdownMenu title="Environmental" items={navigationMenus.environmental.items} toggle={handleClick} />
              <MobileDropdownMenu title="Geological" items={navigationMenus.geological.items} toggle={handleClick} />
              <MobileDropdownMenu title="Technology" items={navigationMenus.technology.items} toggle={handleClick} />
              <MobileDropdownMenu title="Analysis" items={navigationMenus.analysis.items} toggle={handleClick} />
              <MobileDropdownMenu title="Cosmology" items={navigationMenus.cosmology.items} toggle={handleClick} />
              <MobileDropdownMenu title="Oceanography" items={navigationMenus.oceanography.items} toggle={handleClick} />
              <MobileDropdownMenu title="Tools" items={navigationMenus.tools.items} toggle={handleClick} />
              <MobileDropdownMenu title="Resources" items={navigationMenus.resources.items} toggle={handleClick} />
            </nav>

            <nav className='flex items-center justify-center flex-wrap mt-2'>
              <motion.a href="https://twitter.com" target={"_blank"}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 mr-3 sm:mx-1"
              >
                <TwitterIcon />
              </motion.a>
              <motion.a href="https://github.com" target={"_blank"}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 mx-3 bg-light rounded-full dark:bg-dark sm:mx-1"
              >
                <GithubIcon />
              </motion.a>
              <motion.a href="https://linkedin.com" target={"_blank"}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 mx-3 sm:mx-1"
              >
                <LinkedInIcon />
              </motion.a>
              <motion.a href="https://pinterest.com" target={"_blank"}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 mx-3 bg-light rounded-full sm:mx-1"
              >
                <PinterestIcon />
              </motion.a>
              <motion.a href="https://dribbble.com" target={"_blank"}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-6 ml-3 sm:mx-1"
              >
                <DribbbleIcon />
              </motion.a>

              <button
                onClick={() => setMode(mode === "light" ? "dark" : "light")}
                className={`ml-3 flex items-center justify-center rounded-full p-1
        ${mode === "light" ? "bg-dark text-light" : "bg-light text-dark"}
        `}
              >
                {
                  mode === "dark" ?
                    <SunIcon className={"fill-dark"} />
                    : <MoonIcon className={"fill-dark"} />
                }
              </button>

            </nav>
          </motion.div>

          : null
      }

    
    </header>
  )
}

export default Navbar
