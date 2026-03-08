"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#1d1d1f",
            padding: "12px 16px",
            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
    </SessionProvider>
  );
}
