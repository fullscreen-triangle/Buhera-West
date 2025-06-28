'use client'
import { Suspense } from 'react';
import AnimatedText from "@/components/AnimatedText";
import { HireMe } from "@/components/HireMe";
import Layout from "@/components/Layout";
import Head from "next/head";
import Image from "next/image";
import dynamic from 'next/dynamic';
import projectLogo from "../../public/logos/Pugachev_Cobra2_modified.png";
import TransitionEffect from "@/components/TransitionEffect";

// Dynamically import the geocoder to avoid SSR issues
const GeocoderSearch = dynamic(() => import('@/components/location/GeocoderSearch'), {
  ssr: false,
  loading: () => (
      <div className="w-full max-w-md">
        <div className="mb-4 space-y-1">
          <h3 className="text-lg font-semibold text-dark dark:text-light md:text-base">
            Search Location
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 md:text-xs">
            Enter a location to view weather analysis
          </p>
        </div>
        <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading search...</span>
        </div>
      </div>
  )
});

const SunEarthMoon = dynamic(() => import('@/components/glb/SunEarthMoon'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
  )
});



export default function Home() {
  return (
      <>
        <Head>
          <title>Buhera West - High Precision Weather Analysis</title>
          <meta
              name="description"
              content="High-performance computational platform designed for agricultural weather analysis and prediction in Southern African climatic conditions."
          />
        </Head>

        <TransitionEffect />
        
        {/* Full-screen GLB Background */}
        <div className="fixed inset-0 w-full h-full -z-20">
          <Suspense fallback={
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          }>
            <SunEarthMoon className="w-full h-full" />
          </Suspense>
        </div>

        {/* Floating Text Content */}
        <article className="relative min-h-screen flex items-center text-dark dark:text-light sm:items-start z-10">
          <Layout className="!pt-0 md:!pt-16 sm:!pt-16">
            <div className="flex w-full items-center justify-center md:flex-col">
              <div className="flex w-full max-w-4xl flex-col items-center text-center lg:w-full z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 md:p-6 sm:p-4">
                <AnimatedText
                    text="High Precision Weather Analysis for Southern Africa"
                    className="!text-center !text-4xl xl:!text-3xl lg:!text-4xl md:!text-3xl sm:!text-3xl"
                />
                <p className="my-4 text-base font-medium md:text-sm sm:!text-xs text-center max-w-3xl">
                  Advanced computational platform for agricultural weather analysis and prediction in Southern African climatic conditions. Explore real-time atmospheric data, forecasting models, and agricultural optimization tools.
                </p>

                {/* Geocoder Search Section */}
                <div className="mt-6 w-full max-w-md">
                  <Suspense fallback={
                    <div className="w-full">
                      <div className="mb-4 space-y-1">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                      </div>
                      <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                  }>
                    <GeocoderSearch
                        placeholder="Search for a location in Southern Africa..."
                        bbox={[22, -35, 35, -15]} // Southern Africa bounding box
                        proximity={[30, -20]} // Southern Africa center
                        types="country,region,place,postcode,locality,neighborhood"
                        showLabels={true}
                        className="w-full"
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </Layout>

          <HireMe />
          <div className="absolute right-8 bottom-8 inline-block w-24 md:hidden z-30">
            <Image
                className="relative h-auto w-full"
                src={projectLogo}
                alt="Buhera-West Logo"
            />
          </div>
        </article>
      </>
  );
}