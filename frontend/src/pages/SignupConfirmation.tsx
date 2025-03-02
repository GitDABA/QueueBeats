import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { AuthInit } from "../components/AuthInit";
import { AuthProvider } from "../components/AuthProvider";

export default function SignupConfirmation() {
  return (
    <AuthInit>
      <AuthProvider>
        <SignupConfirmationContent />
      </AuthProvider>
    </AuthInit>
  );
}

function SignupConfirmationContent() {
  const location = useLocation();
  const email = location.state?.email || "your email";
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 -top-40 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <Link to="/">
          <Logo className="inline-block" />
        </Link>
        
        <div className="mt-8 bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-xl">
          <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="mt-4 text-2xl font-bold">Verify your email</h1>
          
          <p className="mt-2 text-muted-foreground">
            We've sent a verification link to <span className="font-medium text-purple-400">{email}</span>.
            Please check your inbox and click the link to verify your account.
          </p>
          
          <div className="mt-6 p-4 bg-black/20 rounded-lg border border-white/5">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> If you don't see the email in your inbox, check your spam folder.
            </p>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "https://mail.google.com"}
              className="mr-4"
            >
              Check Gmail
            </Button>
            <Link to="/login">
              <Button variant="secondary">
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
