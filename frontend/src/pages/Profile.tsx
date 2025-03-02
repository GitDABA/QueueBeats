import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Navigation } from "../components/Navigation";
import { useAuth } from "../utils/auth";
import { supabase } from "../utils/supabase";
import { AuthInit } from "../components/AuthInit";
import { AuthProvider } from "../components/AuthProvider";
import { ProtectedRoute } from "../components/ProtectedRoute";
import type { Profile as ProfileType } from "../utils/auth";

export default function Profile() {
  return (
    <AuthInit>
      <AuthProvider>
        <ProtectedRoute>
          <ProfileContent />
        </ProtectedRoute>
      </AuthProvider>
    </AuthInit>
  );
}

function ProfileContent() {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Effect to redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);
  
  // Effect to load profile data
  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        try {
          setLoading(true);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('username, full_name, website')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          setUsername(data.username || "");
          setFullName(data.full_name || "");
          setWebsite(data.website || "");
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      };
      
      getProfile();
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update profile
      await updateProfile({
        id: user.id,
        username,
        full_name: fullName,
        website,
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Error updating profile' });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-purple-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Navigation */}
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/30 text-green-500' 
                : 'bg-red-500/10 border border-red-500/30 text-red-500'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-xl">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-md text-muted-foreground"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">You cannot change your email address</p>
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="username"
                  />
                </div>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium mb-1">Website</label>
                  <input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="glow"
                    className="w-full py-2"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
