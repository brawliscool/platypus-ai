"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = localStorage.getItem("pwa-install-dismissed");

    if (isStandalone || dismissed) return;

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Show iOS banner after a delay if on iOS and not standalone
    if (isIOSDevice && !isStandalone) {
      setTimeout(() => setShowInstallBanner(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">Install Platypus AI</h3>
          {isIOS ? (
            <p className="text-sm text-zinc-400">
              Tap the share button <span className="inline-block px-1">⬆️</span> then &quot;Add to Home Screen&quot;.
            </p>
          ) : (
            <>
              <p className="text-sm text-zinc-400 mb-3">
                Get quick access from your home screen.
              </p>
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors"
              >
                Install App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

