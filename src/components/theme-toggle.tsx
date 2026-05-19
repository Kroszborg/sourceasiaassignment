"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      className="relative"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="size-4 rotate-0 scale-100 transition dark:-rotate-90 dark:scale-0" aria-hidden="true" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition dark:rotate-0 dark:scale-100" aria-hidden="true" />
    </Button>
  );
}
