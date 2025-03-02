import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/Card";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { toast } from "sonner";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      // Force absolute URL for password reset to ensure it works in email clients
      const baseUrl = window.location.origin;
      // Include the full path to reset-password in the deployed app
      let redirectUrl = `${baseUrl}/reset-password`;
      
      // If we're in a deployed environment with a base path
      if (baseUrl.includes('databutton.app')) {
        redirectUrl = `${baseUrl}/queue-beats/reset-password`;
      }
      
      console.log("Using password reset redirect URL:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      // Show success state
      setResetSent(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset instructions. Please try again.");
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
              {resetSent ? 
                "Check your email for password reset instructions" : 
                "Enter your email address and we'll send you a link to reset your password"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!resetSent ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-muted-foreground">
                  Check your inbox for a link to reset your password. If you don't see it, check your spam folder.
                </p>
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
