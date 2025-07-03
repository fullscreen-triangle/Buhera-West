import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import { AnimatePresence } from "framer-motion";
// pages/_app.js
import { Montserrat } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { AIProvider } from '../contexts/AIContext';
import { TimeProvider } from '../contexts/TimeContext';
import AIAssistant from '../components/ai/AIAssistant';
import GlobalTimeControls from '../components/GlobalTimeControls';
import TimeControlsToggle from '../components/TimeControlsToggle';

// Font loader must be assigned to const
const montserrat = Montserrat({ 
  subsets: ["latin"], 
  variable: "--font-mont" 
});

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AIProvider>
        <TimeProvider>
          <main
            className={`${montserrat.variable} font-mont bg-light dark:bg-dark w-full min-h-screen h-full subpixel-antialiased`}
          >
            <Navbar />
            <AnimatePresence initial={false} mode="wait">
              <Component key={router.asPath} {...pageProps} />
            </AnimatePresence>
            <Footer />
            <AIAssistant />
            <GlobalTimeControls />
            <TimeControlsToggle />
          </main>
        </TimeProvider>
      </AIProvider>
    </>
  );
}
