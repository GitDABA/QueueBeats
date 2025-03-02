import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user-routes";
import ErrorBoundary from "./components/ErrorBoundary";

// Using dynamic imports with explicit chunking names
const NotFoundPage = lazy(() => 
  import("./pages/NotFoundPage").then(module => ({ default: module.default }))
);

export const router = createBrowserRouter([
  ...userRoutes,
  {
    path: "*",
    element: userRoutes[2].element, // Reuse the App component's wrapper
    errorElement: <ErrorBoundary />
  },
]);