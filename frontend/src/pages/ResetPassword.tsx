import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/Card";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Check for valid session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if we have a hash with authentication parameters
        if (location.hash && location.hash.includes("access_token")) {
          console.log("Found access token in URL");
          
          // Supabase will automatically handle the token from the URL hash
          // Just verify we have a valid session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log("Valid session found");
            setIsValidSession(true);
          } else {
            console.log("No valid session found despite having hash params");
            setIsValidSession(false);
          }
        } else {
          // Check if we have an existing session
          const { data: { session } } = await supabase.auth.getSession();
          setIsValidSession(!!session);
        }
      } catch (error) {
        console.error("Error checking authentication state:", error);
        setIsValidSession(false);
      } finally {
        setInitialCheckDone(true);
      }
    };
    
    checkSession();
  }, [location.hash]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw error;
      }

      // Show success state
      setResetComplete(true);
      toast.success("Password has been reset successfully");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 -top-40 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-pink-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header/Navigation */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <nav>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/login")}
              className="text-sm"
            >
              Back to Login
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 border-purple-900/50">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              {resetComplete ? 
                "Your password has been reset successfully" : 
                "Create a new password for your account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!initialCheckDone ? (
              // Loading state
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-muted-foreground">
                  Verifying your reset link...
                </p>
              </div>
            ) : !resetComplete ? (
              isValidSession ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-black/40 border border-purple-900/50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-black/40 border border-purple-900/50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                    />
                  </div>
                  
                  <Button
                    variant="glow"
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">
                    Invalid or expired password reset link. Please request a new password reset link.
                  </p>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/forgot-password")}
                      className="mt-2"
                    >
                      Request New Link
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-muted-foreground">
                  Your password has been reset successfully. You can now login with your new password.
                </p>
                <Button 
                  variant="glow" 
                  onClick={() => navigate("/login")}
                  className="mt-4"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center w-full">
              <Button 
                variant="link" 
                onClick={() => navigate("/login")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Return to login
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
