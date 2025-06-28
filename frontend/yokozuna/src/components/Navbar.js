import Link from "next/link";
import React, { useState } from "react";
import Logo from "./Logo";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useThemeSwitch } from "./Hooks/useThemeSwitch";

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

const MoonIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const CustomLink = ({ href, title, className = "" }) => {
  const router = useRouter();

  return (
    <Link href={href} className={`${className} rounded relative group lg:text-light lg:dark:text-dark text-sm`}>
      {title}
      <span
        className={`
              inline-block h-[1px] bg-dark absolute left-0 -bottom-0.5 
              group-hover:w-full transition-[width] ease duration-300 dark:bg-light
              ${router.asPath === href ? "w-full" : " w-0"} lg:bg-light lg:dark:bg-dark
              `}
      >
        &nbsp;
      </span>
    </Link>
  );
};

const CustomMobileLink = ({ href, title, className = "", toggle }) => {
  const router = useRouter();

  const handleClick = () =>{
    toggle();
    router.push(href) 
  }

  return (
    <button className={`${className} rounded relative group lg:text-light lg:dark:text-dark text-sm`} onClick={handleClick}>
      {title}
      <span
        className={`
              inline-block h-[1px] bg-dark absolute left-0 -bottom-0.5 
              group-hover:w-full transition-[width] ease duration-300 dark:bg-light
              ${router.asPath === href ? "w-full" : " w-0"} lg:bg-light lg:dark:bg-dark
              `}
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

  // Determine which sensors should be active based on current page
  const getSensorStates = () => {
    const path = router.asPath;
    return {
      satellite: path.includes('weather') || path.includes('geography') || path.includes('location'),
      cellTower: path.includes('weather') || path.includes('hydrology'),
      weatherStation: path.includes('weather') || path.includes('agriculture'),
      gps: path.includes('geography') || path.includes('geology') || path.includes('location'),
      atmospheric: path.includes('weather') || path.includes('agriculture'),
      soil: path.includes('agriculture') || path.includes('geology') || path.includes('hydrology')
    };
  };

  const sensorStates = getSensorStates();

  return (
    <header className="w-full flex items-center justify-between px-32 py-8 font-medium z-10 dark:text-light
    lg:px-16 relative z-1 md:px-12 sm:px-8
    ">
      
      <button
        type="button"
        className=" flex-col items-center justify-center hidden lg:flex"
        aria-controls="mobile-menu"
        aria-expanded={isOpen}
        onClick={handleClick}
      >
        <span className="sr-only">Open main menu</span>
        <span className={`bg-dark dark:bg-light block h-0.5 w-6 rounded-sm transition-all duration-300 ease-out ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
        <span className={`bg-dark dark:bg-light block h-0.5 w-6 rounded-sm transition-all duration-300 ease-out ${isOpen ? 'opacity-0' : 'opacity-100'} my-0.5`}></span>
        <span className={`bg-dark dark:bg-light block h-0.5 w-6 rounded-sm transition-all duration-300 ease-out ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
      </button>

      <div className="w-full flex justify-between items-center lg:hidden">
        <nav className="flex items-center justify-center">
          <CustomLink className="mr-3" href="/hydrology" title="Hydrology" />
          <CustomLink className="mx-3" href="/geography" title="Geography" />
          <CustomLink className="mx-3" href="/geology" title="Geology" />
          <CustomLink className="mx-3" href="/weather" title="Weather" />
          <CustomLink className="ml-3" href="/agriculture" title="Agriculture" />
        </nav>
        
        <nav className="flex items-center justify-center flex-wrap lg:mt-2">
          <motion.div
            className="w-6 mr-3"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            title="Satellite Network"
          >
            <SatelliteIcon className="w-full h-full" isActive={sensorStates.satellite} />
          </motion.div>
          
          <motion.div
            className="w-6 mx-3"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            title="Cellular Communication"
          >
            <CellTowerIcon className="w-full h-full" isActive={sensorStates.cellTower} />
          </motion.div>
          
          <motion.div
            className="w-6 mx-3"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            title="Weather Stations"
          >
            <WeatherStationIcon className="w-full h-full" isActive={sensorStates.weatherStation} />
          </motion.div>
          
          <motion.div
            className="w-6 mx-3"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            title="GPS Network"
          >
            <GPSIcon className="w-full h-full" isActive={sensorStates.gps} />
          </motion.div>
          
          <motion.div
            className="w-6 mx-3"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            title="Atmospheric Sensors"
          >
            <AtmosphericSensorIcon className="w-full h-full" isActive={sensorStates.atmospheric} />
          </motion.div>
          
          <motion.div
            className="w-6 mx-3"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            title="Soil Monitoring"
          >
            <SoilSensorIcon className="w-full h-full" isActive={sensorStates.soil} />
          </motion.div>

          <button
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            className={`w-6 h-6 ease ml-3 flex items-center justify-center rounded-full p-1  
              ${mode === "light" ? "bg-dark  text-light" : "bg-light  text-dark"}
              `}
            aria-label="theme-switcher"
          >
            {mode === "light" ? (
              <SunIcon className={"fill-dark"} />
            ) : (
              <MoonIcon className={"fill-dark"} />
            )}
          </button>
        </nav>
      </div>
      
      {isOpen ? 
        <motion.div className="min-w-[70vw] sm:min-w-[90vw] flex justify-between items-center flex-col fixed top-1/2 left-1/2 -translate-x-1/2
        -translate-y-1/2
        py-32 bg-dark/90 dark:bg-light/75 rounded-lg z-50 backdrop-blur-md
        "
        initial={{scale:0,x:"-50%",y:"-50%", opacity:0}}
        animate={{scale:1,opacity:1}}
        >
          <nav className="flex items-center justify-center flex-col">
            <CustomMobileLink toggle={handleClick} className="mr-4 lg:m-0 lg:my-2" href="/hydrology" title="Hydrology" />
            <CustomMobileLink toggle={handleClick} className="mx-4 lg:m-0 lg:my-2" href="/geography" title="Geography" />
            <CustomMobileLink toggle={handleClick} className="mx-4 lg:m-0 lg:my-2" href="/geology" title="Geology" />
            <CustomMobileLink toggle={handleClick} className="ml-4 lg:m-0 lg:my-2" href="/weather" title="Weather" />
            <CustomMobileLink toggle={handleClick} className="ml-4 lg:m-0 lg:my-2" href="/agriculture" title="Agriculture" />
          </nav>
          
          <nav className="flex items-center justify-center mt-2">
            <motion.div
              className="w-6 m-1 mr-3 sm:mx-1"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              title="Satellite Network"
            >
              <SatelliteIcon className="w-full h-full" isActive={sensorStates.satellite} />
            </motion.div>
            
            <motion.div
              className="w-6 m-1 mx-3 sm:mx-1"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              title="Cellular Communication"
            >
              <CellTowerIcon className="w-full h-full" isActive={sensorStates.cellTower} />
            </motion.div>
            
            <motion.div
              className="w-6 m-1 mx-3 sm:mx-1"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              title="Weather Stations"
            >
              <WeatherStationIcon className="w-full h-full" isActive={sensorStates.weatherStation} />
            </motion.div>
            
            <motion.div
              className="w-6 m-1 mx-3 sm:mx-1"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              title="GPS Network"
            >
              <GPSIcon className="w-full h-full" isActive={sensorStates.gps} />
            </motion.div>
            
            <motion.div
              className="w-6 m-1 mx-3 sm:mx-1"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              title="Atmospheric Sensors"
            >
              <AtmosphericSensorIcon className="w-full h-full" isActive={sensorStates.atmospheric} />
            </motion.div>
            
            <motion.div
              className="w-6 m-1 mx-3 sm:mx-1"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              title="Soil Monitoring"
            >
              <SoilSensorIcon className="w-full h-full" isActive={sensorStates.soil} />
            </motion.div>

            <button
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              className={`w-6 h-6 ease m-1 ml-3 sm:mx-1 flex items-center justify-center rounded-full p-1  
                ${mode === "light" ? "bg-dark  text-light" : "bg-light  text-dark"}
                `}
              aria-label="theme-switcher"
            >
              {mode === "light" ? (
                <SunIcon className={"fill-dark"} />
              ) : (
                <MoonIcon className={"fill-dark"} />
              )}
            </button>
          </nav>
        </motion.div>
        : null
      }

      <div className="absolute left-[50%] top-2 translate-x-[-50%] ">
        <Logo />
      </div>
    </header>
  );
};

export default Navbar;
