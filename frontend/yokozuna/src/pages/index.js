'use client'
import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import Head from "next/head";
import Image from "next/image";
import dynamic from 'next/dynamic';
import TransitionEffect from "@/components/TransitionEffect";
import GeocoderSearch from '@/components/location/GeocoderSearch';
import { SOUTHERN_AFRICA_BBOX, SOUTHERN_AFRICA_CENTER } from '@/config/coordinates';

const SunEarthMoon = dynamic(() => import('@/components/glb/SunEarthMoon'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-sm text-gray-500 dark:text-gray-400">Loading 3D model...</span>
    </div>
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
        
        <article className="w-full flex items-center justify-center">
          <Layout className="pt-0">
            <div className="flex w-full items-start justify-between md:flex-col">
           

              <div className="w-1/2 h-[500px] relative block md:w-full md:h-[400px] sm:h-[300px] xs:h-[250px] overflow-hidden">
                                <SunEarthMoon />
                </div>

              {/* Content Container */}
              <div className="flex w-1/2 flex-col items-center self-center lg:w-full lg:text-center md:mt-8">
                <AnimatedText
                    text="High Precision Weather Analysis for Southern Africa"
                    className="!text-left !text-4xl xl:!text-5xl lg:!text-center lg:!text-6xl md:!text-5xl sm:!text-3xl mt-5 antialiased"
                />

                <p className="my-4 text-base font-medium md:text-sm sm:!text-xs antialiased text-dark dark:text-light">
                  Advanced computational platform for agricultural weather analysis and prediction in Southern African climatic conditions. Explore real-time atmospheric data, forecasting models, and agricultural optimization tools.
                </p>

                {/* Geocoder Search Section */}
                <div className="mt-2 flex items-center self-start lg:self-center w-full max-w-md">
                  <GeocoderSearch
                      placeholder="Search for a location in Southern Africa..."
                      bbox={SOUTHERN_AFRICA_BBOX}
                      proximity={SOUTHERN_AFRICA_CENTER}
                      types="country,region,place,postcode,locality,neighborhood"
                      showLabels={true}
                      className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="absolute right-8 bottom-8 inline-block w-24 md:hidden">
              <Image
                src="/logos/logo.png"
                alt="Buhera West Logo"
                width={96}
                height={96}
                className="relative h-auto w-full"
                priority
              />
            </div>
          </Layout>
        </article>
      </>
  );
}