import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { useAuth } from "../utils/auth";
import { supabase } from "../utils/supabase";
import { AuthInit } from "../components/AuthInit";
import { AuthProvider } from "../components/AuthProvider";

export default function Login() {
  const navigate = useNavigate();
  
  return (
    <AuthInit>
      <AuthProvider>
        <LoginContent />
      </AuthProvider>
    </AuthInit>
  );
}

function LoginContent() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDetailedError(null);
    setLoading(true);
    
    console.log('Login attempt started for email:', email);
    
    // Create a timeout to prevent the loading state from being stuck
    const timeout = setTimeout(() => {
      console.log('Login operation timed out - resetting loading state');
      setLoading(false);
      setError('Login timed out after 15 seconds. Please try again.');
      setDetailedError('The login process took too long to complete. This could be due to network issues, database connection problems, or server load.');
    }, 15000); // 15 second timeout
    
    try {
      console.log('Calling signIn method...');
      const startTime = Date.now();
      const { error } = await signIn(email, password);
      const duration = Date.now() - startTime;
      console.log(`SignIn method completed in ${duration}ms`);
      
      // Clear the timeout since the operation completed
      clearTimeout(timeout);
      
      if (error) {
        console.error('SignIn returned an error:', error);
        setError(error.message || "Failed to sign in");
        setDetailedError(`Error code: ${error.code || 'unknown'}\nDetails: ${JSON.stringify(error, null, 2)}`);
        setLoading(false);
        return;
      }
      
      console.log('Login successful, redirecting to dashboard');
      // Redirect to dashboard on success
      navigate("/dashboard");
    } catch (err: any) {
      // Clear the timeout since the operation completed
      clearTimeout(timeout);
      
      console.error('Login exception caught:', err);
      setError(err.message || "An unexpected error occurred");
      setDetailedError(`Error stack: ${err.stack || 'No stack trace available'}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 -top-40 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/">
            <Logo className="inline-block" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account to continue</p>
        </div>
        
        {/* Form */}
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-sm">
              <p className="font-medium">{error}</p>
              {detailedError && (
                <details className="mt-2 text-xs text-red-400/80">
                  <summary className="cursor-pointer">Technical Details</summary>
                  <pre className="mt-2 p-2 bg-black/50 rounded overflow-x-auto whitespace-pre-wrap">
                    {detailedError}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
              
              <Button
                type="submit"
                variant="glow"
                className="w-full py-2"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
