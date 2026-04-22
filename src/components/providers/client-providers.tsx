"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Handle PWA installation
    if ("serviceWorker" in navigator) {
      // Service worker registration akan ditambahkan nanti
    }
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
}
