import React from "react";

type Props = {
  className?: string;
};

export function Logo({ className = "" }: Props) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative w-8 h-8 mr-2">
        <div className="absolute inset-0 bg-purple-600 rounded-full opacity-70 animate-pulse"></div>
        <div className="absolute inset-1 bg-purple-500 rounded-full"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
        </div>
      </div>
      <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        QueueBeats
      </span>
    </div>
  );
}
