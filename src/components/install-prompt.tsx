"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const listener = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", listener);
    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);

  if (!promptEvent || dismissed) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-lg border bg-card p-3 text-sm shadow-lg">
      <Download className="size-4" aria-hidden="true" />
      <span>Install Source Asia Air</span>
      <Button
        size="sm"
        onClick={async () => {
          await promptEvent.prompt();
          await promptEvent.userChoice;
          setDismissed(true);
        }}
      >
        Install
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => setDismissed(true)} aria-label="Dismiss install prompt">
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}
