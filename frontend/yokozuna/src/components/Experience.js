import React, { useRef } from "react";
import {
  motion,
  useScroll,
} from "framer-motion";
import LiIcon from "./LiIcon";


const Details = ({ position, company, companyLink, time, address, work }) => {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-start justify-between md:w-[80%]"
    >
      <LiIcon reference={ref} />
      <motion.div
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <h3 className="capitalize font-bold text-2xl sm:text-xl xs:text-lg">
          {position}{" "}
          <a
            className="capitalize text-primary dark:text-primaryDark"
            href={companyLink}
            target={"_blank"}
          >
            @{company}
          </a>
        </h3>
        <span className="capitalize text-dark/75 font-medium dark:text-light/50 xs:text-sm">
          {time} | {address}
        </span>
        <p className="font-medium w-full md:text-sm"> {work}</p>
      </motion.div>
    </li>
  );
};

const Experience = () => {

  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });

  return (

      <div className="my-64">
        <h2 className="font-bold text-8xl mb-32 w-full text-center md:text-6xl xs:text-4xl md:mb-16">
          System Architecture
        </h2>

        <div ref={ref} className="relative w-[75%] mx-auto lg:w-[90%] md:w-full">
          <motion.div
            className="absolute left-9 top-0 w-[4px] md:w-[2px] md:left-[30px] xs:left-[20px] h-full bg-dark 
            origin-top  dark:bg-primaryDark dark:shadow-3xl"
            style={{ scaleY: scrollYProgress }}
          />
          <ul className="w-full flex flex-col items-start justify-between ml-4 xs:ml-2">
            <Details
              position="Data Ingestion Engine"
              company="Core Backend"
              companyLink="#"
              time="Real-time Processing"
              address="Multi-source Integration"
              work="Concurrent ingestion from meteorological APIs, satellite data feeds, and local weather station networks. Real-time quality control using statistical outlier detection and physical constraint validation. High-precision time alignment of data streams from heterogeneous sources achieving >10,000 observations/second sustained throughput."
            />

            <Details
              position="Weather Processing Engine"
              company="Core Backend"
              companyLink="#"
              time="Atmospheric Physics"
              address="Numerical Integration"
              work="Implementation of atmospheric physics equations using fourth-order Runge-Kutta methods. Spatial interpolation using Kriging and radial basis function methods for spatial field reconstruction. Ensemble processing with Monte Carlo methods for uncertainty quantification in weather predictions."
            />

            <Details
              position="Agricultural Analytics Engine"
              company="Core Backend"
              companyLink="#"
              time="Decision Support"
              address="Risk Assessment"
              work="Implementation of process-based crop growth models (DSSAT, APSIM derivatives). Probabilistic risk modeling using Bayesian networks and decision trees. Multi-objective optimization for planting schedules and resource allocation with 30-40% irrigation efficiency improvement."
            />

            <Details
              position="React Frontend Architecture"
              company="User Interface"
              companyLink="#"
              time="Responsive Design"
              address="Component-based"
              work="Responsive, component-based user interface with real-time data visualization. Integration of 3D terrain visualization, interactive dashboards, and comprehensive weather analytics. Support for >1,000 simultaneous frontend connections with dynamic data streaming."
            />

            <Details
              position="Multi-Modal Signal Processing"
              company="Advanced Analytics"
              companyLink="#"
              time="Revolutionary Technology"
              address="Signal Integration"
              work="GPS differential atmospheric sensing, cellular network correlation analysis, and WiFi infrastructure mapping. Hardware oscillatory harvesting for molecular spectrometry. MIMO signal harvesting with 15,000-50,000 simultaneous signals for atmospheric analysis and groundwater detection."
            />
          </ul>
        </div>
        </div>
    );
};

export default Experience;
