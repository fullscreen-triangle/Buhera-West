import React from 'react'
import Head from 'next/head'
import TransitionEffect from '@/components/TransitionEffect'
import WeatherScrollStory from '@/components/weather/WeatherScrollStory'

const WeatherPage = () => {
  return (
    <>
      <Head>
        <title>Weather | Buhera-West</title>
        <meta name="description" content="High-precision personal weather report with scrollytelling" />
      </Head>
      <TransitionEffect />
      <WeatherScrollStory />
    </>
  )
}

export default WeatherPage
