"use client";

import { useEffect, useState } from "react";

type FontSize = "small" | "medium" | "large";

export function useFontSize() {
  const [fontSize, setFontSize] = useState<FontSize>("medium");

  useEffect(() => {
    const saved = localStorage.getItem("fontSize") as FontSize | null;
    if (saved) setFontSize(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
    document.documentElement.setAttribute("data-font-size", fontSize);
  }, [fontSize]);

  return { fontSize, setFontSize };
}
