import { ErrorBoundary } from "react-error-boundary";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Head } from "./internal-components/Head";
import { ThemeProvider } from "./internal-components/ThemeProvider";
import { DEFAULT_THEME } from "./constants/default-theme";

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
    <div className="max-w-md w-full bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-red-500/30 shadow-xl">
      <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2 text-center">Something went wrong</h2>
      <p className="text-muted-foreground mb-4 text-center">{error.message}</p>
      <div className="text-xs text-muted-foreground mb-4 p-2 bg-black/20 rounded overflow-auto max-h-32">
        {error.stack}
      </div>
      <button
        onClick={resetErrorBoundary}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

export const AppWrapper = () => {
	return (
		<ThemeProvider defaultTheme={DEFAULT_THEME}>
			<ErrorBoundary
				FallbackComponent={ErrorFallback}
				onError={(error) => {
					console.error(
						"Caught error in AppWrapper",
						error.message,
						error.stack,
					);
				}}
				onReset={() => {
					// Reset the state of your app here
					window.location.href = '/';
				}}
			>
				<RouterProvider router={router} />
				<Head />
			</ErrorBoundary>
		</ThemeProvider>
	);
};
