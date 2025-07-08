'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import SimpleLoading from './Loading';

export default function NavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setLoadingText('Loading...');
    };

    const handleComplete = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 300); // Small delay for smooth transition
    };

    // Show loading when pathname or search params change
    setIsLoading(true);
    
    // Set appropriate loading text based on the route
    if (pathname.startsWith('/product')) {
      setLoadingText('Loading Products...');
    } else if (pathname.startsWith('/developer')) {
      setLoadingText('Loading Developer Resources...');
    } else if (pathname.startsWith('/inquiry')) {
      setLoadingText('Loading Inquiry Form...');
    } else if (pathname.startsWith('/inventory')) {
      setLoadingText('Loading Inventory...');
    } else {
      setLoadingText('Loading...');
    }
    
    // Extended loading time for product pages to cover both navigation and data loading
    const loadingTime = pathname.startsWith('/product') ? 1500 : 600;
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadingTime);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
      <SimpleLoading size="lg" />
    </div>
  );
} 