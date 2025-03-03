import React from 'react';
import { SpotifySetup } from '../components/SpotifySetup';

export default function SpotifySetupPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Spotify Integration Setup</h1>
        <p className="mb-8 text-gray-600 text-center">
          We're setting up your Spotify integration. This only needs to be done once.
        </p>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <SpotifySetup />
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <h2 className="font-medium mb-2">What's happening?</h2>
          <p className="mb-2">
            QueueBeats requires a special database table to store your Spotify tokens securely.
            This page helps set up that table automatically so you don't have to manually
            configure anything.
          </p>
          <p>
            If you encounter any issues during this process, please contact our support team
            for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
