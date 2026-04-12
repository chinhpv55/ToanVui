"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StarCounterProps {
  count: number;
  size?: "sm" | "md" | "lg";
}

export default function StarCounter({ count, size = "md" }: StarCounterProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-1 font-bold ${sizeClasses[size]}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-accent-400"
        >
          &#9733;
        </motion.span>
      </AnimatePresence>
      <span className="text-accent-600">{count}</span>
    </div>
  );
}
