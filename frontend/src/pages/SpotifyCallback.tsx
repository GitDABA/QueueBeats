import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAccessToken, storeSpotifyTokens } from "../utils/spotify";
import { useAuth } from "../utils/auth";
import { Spinner } from "../components/Spinner";

export default function SpotifyCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleSpotifyCallback = async () => {
      try {
        // Get the authorization code from the URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          setStatus("error");
          setErrorMessage(`Spotify authorization failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus("error");
          setErrorMessage("No authorization code received from Spotify");
          return;
        }

        if (!user) {
          setStatus("error");
          setErrorMessage("You must be logged in to connect to Spotify");
          return;
        }

        // Exchange code for access token
        const tokens = await getAccessToken(code);

        // Store tokens in database
        await storeSpotifyTokens(user.id, tokens);

        setStatus("success");

        // Redirect back to DJ dashboard
        setTimeout(() => {
          navigate("/Dashboard");
        }, 1500);
      } catch (error) {
        console.error("Error processing Spotify callback:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
    };

    handleSpotifyCallback();
  }, [location.search, navigate, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-purple-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {status === "loading" && "Connecting to Spotify..."}
            {status === "success" && "Connected to Spotify!"}
            {status === "error" && "Connection Error"}
          </h1>

          <div className="flex justify-center mb-6">
            {status === "loading" && <Spinner size="lg" />}
            {status === "success" && (
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500/20 text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-500/20 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>

          {status === "loading" && (
            <p className="text-white/70">
              Completing Spotify authorization...
            </p>
          )}

          {status === "success" && (
            <p className="text-white/70">
              Successfully connected to Spotify! Redirecting to dashboard...
            </p>
          )}

          {status === "error" && (
            <>
              <p className="text-white/70 mb-4">{errorMessage}</p>
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                onClick={() => navigate("/Dashboard")}
              >
                Return to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
