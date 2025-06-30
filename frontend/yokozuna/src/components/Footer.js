import React from "react";
import Layout from "./Layout";

const Footer = () => {
  return (
    <footer className="w-full border-t-2 border-solid border-dark font-medium dark:text-light dark:border-light bg-gray-50 dark:bg-gray-900">
      <Layout className="py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <span>{new Date().getFullYear()} &copy; Buhera-West Agricultural Weather Analysis Platform</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-500">Version 2.1.4-beta</span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2 lg:mt-0">
            <span>Southern African Climatic Research Initiative</span>
            <span>•</span>
            <span>Licensed under AGPL-3.0</span>
            <span>•</span>
            <span>ISO 9001:2015 Certified</span>
          </div>
        </div>
      </Layout>
    </footer>
  );
};

export default Footer;
