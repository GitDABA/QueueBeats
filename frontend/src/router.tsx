import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user-routes";
import { SuspenseWrapper } from "./components/SuspenseWrapper";
import ErrorBoundary from "./components/ErrorBoundary";

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const SomethingWentWrongPage = lazy(
  () => import("./pages/SomethingWentWrongPage")
);

export const router = createBrowserRouter([
  ...userRoutes,
  {
    path: "*",
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
    errorElement: <ErrorBoundary />,
  },
]);