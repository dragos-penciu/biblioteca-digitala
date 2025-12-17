"use client";
import { useEffect, useState } from "react";

export default function TypingLogo({text, speed = 90}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((prev) => (prev >= text.length ? prev : prev + 1));
    }, speed);

    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span className="min-w-1/2 inline-flex items-baseline">
      <span className="inline-block text-primary text-4xl sm:text-5xl font-semibold tracking-tight">
        {text.slice(0, i)}
      </span>
      <span className="text-primary ml-[0.1em] w-[0.2em] h-[2.7em] bg-current caret-blink inline-block relative top-2" />
    </span>
  );
}