import { Suspense, type ReactNode } from "react";

export const SuspenseWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <div className="w-12 h-12 border-t-2 border-purple-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};
