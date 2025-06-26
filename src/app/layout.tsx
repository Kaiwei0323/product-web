import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../app/components/AppContext"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Inventec - Industrial Solutions",
  description: "Leading provider of industrial solutions and technology",
};

import Header from "../app/components/layout/Header"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <AppProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                    About Us
                  </h3>
                  <p className="text-base text-gray-500">
                    Leading provider of industrial solutions and cutting-edge technology.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                    Products
                  </h3>
                  <ul className="space-y-4">
                    <li>
                      <a href="/product/Qualcomm" className="text-base text-gray-500 hover:text-gray-900">
                        Qualcomm Platform
                      </a>
                    </li>
                    <li>
                      <a href="/product/Nvidia" className="text-base text-gray-500 hover:text-gray-900">
                        Nvidia Platform
                      </a>
                    </li>
                    <li>
                      <a href="/product/Intel" className="text-base text-gray-500 hover:text-gray-900">
                        Intel + M.2 AI Acceleration Card
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                    Support
                  </h3>
                  <ul className="space-y-4">
                    <li>
                      <a href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                        Contact
                      </a>
                    </li>
                    <li>
                      <a href="/developer" className="text-base text-gray-500 hover:text-gray-900">
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a href="/developer" className="text-base text-gray-500 hover:text-gray-900">
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                    Legal
                  </h3>
                  <ul className="space-y-4">
                    <li>
                      <a href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                        Terms
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
                <div className="flex space-x-6 md:order-2">
                  <a href="https://www.facebook.com/InventecFansClub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/inventec/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
                <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1 text-center">
                  &copy; 2025 <a href="https://www.inventec.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-500 transition-colors duration-200">Inventec Corporation</a>. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
