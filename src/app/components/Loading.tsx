'use client';

interface SimpleLoadingProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function SimpleLoading({ size = 'md' }: SimpleLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-3',
    lg: 'h-8 w-8 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-gray-200 border-t-red-600 ${sizeClasses[size]} mb-2`}></div>
      <div className="text-gray-600 font-medium text-sm">Loading</div>
    </div>
  );
} 