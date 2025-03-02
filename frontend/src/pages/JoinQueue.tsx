import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Navigation } from "../components/Navigation";
import { AuthInit } from "../components/AuthInit";
import { AuthProvider } from "../components/AuthProvider";
import { getQueueByAccessCode } from "../utils/queueHelpers";
import { toast } from "sonner";
import { ToasterProvider } from "../components/ToasterProvider";

export default function JoinQueue() {
  return (
    <ToasterProvider>
      <AuthInit>
        <AuthProvider>
          <JoinQueueContent />
        </AuthProvider>
      </AuthInit>
    </ToasterProvider>
  );
}

function JoinQueueContent() {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast.error("Please enter an access code");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if the queue exists
      const queue = await getQueueByAccessCode(accessCode.trim());
      
      if (!queue) {
        toast.error("Invalid access code. Queue not found.");
        return;
      }
      
      // Navigate to the guest queue view
      navigate(`/guest-queue-view?code=${accessCode.trim()}`);
    } catch (err: any) {
      console.error("Error joining queue:", err);
      toast.error("Failed to join queue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Join a Queue</h1>
            <p className="text-muted-foreground">
              Enter the access code shared by the DJ to join their queue and vote for songs.
            </p>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label 
                  htmlFor="accessCode" 
                  className="block text-sm font-medium"
                >
                  Access Code
                </label>
                <input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full p-3 bg-black/50 border border-white/20 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors text-center text-xl tracking-wider font-mono"
                  maxLength={6}
                  autoComplete="off"
                />
              </div>
              
              <Button
                type="submit"
                variant="glow"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </span>
                ) : (
                  "Join Queue"
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Want to create your own queue?
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Sign In to Create a Queue
              </Button>
            </div>
          </div>
          
          <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">How it works</h3>
                <p className="text-sm text-muted-foreground">
                  Once you join a queue, you'll be able to see all the songs in the queue and vote for your favorites. 
                  The DJ will play songs based on popularity and vibe. Keep checking back to see what's playing next!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
