"use client";
import React, { useState } from "react";
import Image from "next/image";
import Right from "../icons/Right";
import Link from "next/link";

export default function Hero() {
  const images = ["/qc01.jpg", "/ncox.jpg", "/53r.jpg"];
  const [current, setCurrent] = useState(0);

  // Handlers for arrow clicks
  const prevImage = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-24 lg:items-center">
            {/* Text Content */}
            <div className="py-16 sm:py-24 lg:py-32">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Powering the Future</span>
                <span className="block text-primary">with Smarter Edge Devices</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                We design high-performance, AI-ready edge devices for real-time
                processing, low-latency computing, and seamless deployment —
                optimized for industries like healthcare, manufacturing,
                transportation, and smart cities.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="https://www.sagire.ai/platforms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-white hover:bg-red-700 transition-colors duration-200"
                >
                  Order Now
                  <Right className="ml-2" />
                </a>
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Learn More
                  <Right className="ml-2" />
                </Link>
              </div>
            </div>

            {/* Hero Image Slideshow with clickable left/right halves */}
            <div className="hidden lg:flex justify-center items-center relative w-[600px] h-[400px] mx-auto rounded-md overflow-hidden bg-transparent">
              <Image
                key={current}
                src={images[current]}
                alt={`Hero image ${current + 1}`}
                width={500}
                height={400}
                style={{ objectFit: "cover" }}
                priority={true}
              />

              {/* Left clickable half for previous */}
              <div
                onClick={prevImage}
                aria-label="Previous Image"
                className="absolute left-0 top-0 h-full w-1/2 cursor-pointer"
              />

              {/* Right clickable half for next */}
              <div
                onClick={nextImage}
                aria-label="Next Image"
                className="absolute right-0 top-0 h-full w-1/2 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "High Performance",
                desc: "Advanced processing capabilities for demanding AI and edge computing tasks.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                ),
              },
              {
                title: "Reliable Security",
                desc: "Built-in security features to protect your data and applications.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                ),
              },
              {
                title: "Low Latency",
                desc: "Real-time processing with minimal delay for critical applications.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                ),
              },
            ].map(({ title, desc, icon }, i) => (
              <div key={i} className="relative pl-16">
                <div className="absolute left-0 top-1 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    {icon}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-base text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
