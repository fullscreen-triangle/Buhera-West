import React, { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import AboutIcon from "./LiIcon";

const Details = ({ type, time, place, info }) => {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-start justify-between md:w-[80%]"
    >
      <AboutIcon reference={ref} />
      <motion.div
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <h3 className="capitalize font-bold text-2xl sm:text-xl xs:text-lg">{type}</h3>
        <span className="capitalize text-dark/75 font-medium dark:text-light/50 xs:text-sm">
          {time} | {place}
        </span>
        <p className="font-medium w-full md:text-sm">{info}</p>
      </motion.div>
    </li>
  );
};

const Education = () => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });

  return (
    <div className="my-64">
      <h2 className="font-bold text-8xl mb-32 w-full text-center md:text-6xl xs:text-4xl md:mb-16">Theoretical Foundations</h2>

      <div ref={ref} className="relative w-[75%] mx-auto lg:w-[90%] md:w-full">
        <motion.div
          className="absolute left-9 top-0 w-[4px] md:w-[2px] md:left-[30px] xs:left-[20px] h-full bg-dark  origin-top rounded-full dark:bg-primaryDark dark:shadow-3xl"
          style={{ scaleY: scrollYProgress }}
        />
        <ul className="w-full flex flex-col items-start justify-between ml-4">
          <Details
            type="Universal Oscillatory Framework"
            time="Mathematical Foundation"
            place="Core Theory"
            info="All physical systems represented as oscillatory phenomena: Ψ(x,t) = Σ An cos(ωn t + φn) · ψn(x). Enables precise characterization of weather patterns through frequency domain analysis with Fast Fourier Transform algorithms optimized for real-time atmospheric data processing."
          />

          <Details
            type="Weather Prediction Models"
            time="Primitive Equations"
            place="Atmospheric Physics"
            info="Implementation of horizontal momentum equations, thermodynamic equations, and continuity equations for atmospheric motion. Ensemble forecasting using perturbation methods with probability density estimation for uncertainty quantification in agricultural decision making."
          />

          <Details
            type="Agricultural Risk Modeling"
            time="Bayesian Networks"
            place="Decision Support"
            info="Crop Water Stress Index (CWSI) calculation, Growing Degree Day accumulation, and Bayesian risk assessment: P(Risk|Weather,Crop,Soil). Enables quantitative agricultural risk probabilities for crop protection and irrigation optimization."
          />

          <Details
            type="Multi-Modal Signal Processing"
            time="Revolutionary Integration"
            place="Advanced Analytics"
            info="Stochastic differential equation solver with satellite strip images, Markov Decision Process for atmospheric state evolution, and interaction-free measurement systems. Entropy engineering transforms statistical mechanics into manipulable atmospheric control mechanisms."
          />
        </ul>
      </div>
    </div>
  );
};

export default Education;
