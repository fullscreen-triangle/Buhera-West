import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import Head from "next/head";
import TransitionEffect from "@/components/TransitionEffect";
import SolarVisualization from "@/components/solar/SolarVisualization";

export default function SolarSystem() {
  return (
    <>
      <Head>
        <title>Solar System - Buhera West</title>
        <meta
          name="description"
          content="Solar system visualization and astronomical analysis"
        />
      </Head>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center dark:text-light">
        <Layout className="pt-16">
          <AnimatedText
            text="Solar System Analysis"
            className="mb-16 !text-8xl !leading-tight lg:!text-7xl sm:!text-6xl xs:!text-4xl sm:mb-8"
          />
          
          <div className="grid w-full grid-cols-12 gap-24 gap-y-32 xl:gap-x-16 lg:gap-x-8 md:gap-y-24 sm:gap-x-0">
            <div className="col-span-12">
              <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <SolarVisualization />
              </div>
            </div>
            
            <div className="col-span-12 md:col-span-12">
              <div className="flex flex-col items-start justify-start">
                <h2 className="mb-4 text-lg font-bold uppercase text-dark/75 dark:text-light/75">
                  Solar System Overview
                </h2>
                <p className="font-medium text-dark dark:text-light">
                  Interactive 3D visualization of the solar system showing planetary orbits, 
                  celestial mechanics, and astronomical phenomena. This simulation provides 
                  real-time positioning and educational insights into our solar system.
                </p>
              </div>
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
}
