
import React from "react";
import { TRIGRAMS } from "../lib/iching";
import { motion } from "motion/react";

interface HexagramProps {
  upperId: number;
  lowerId: number;
  movingLine?: number; // 1-6 from bottom to top
  title: string;
  name: string;
}

export const Hexagram: React.FC<HexagramProps> = ({ upperId, lowerId, movingLine, title, name }) => {
  const upper = TRIGRAMS.find((t) => t.id === upperId);
  const lower = TRIGRAMS.find((t) => t.id === lowerId);

  if (!upper || !lower) return null;

  // Lines are from bottom to top: lower[0], lower[1], lower[2], upper[0], upper[1], upper[2]
  // Wait, in I Ching, lines are 1 (bottom) to 6 (top).
  // Trigram lines in my data are [bottom, middle, top]? Let's check iching.ts
  // { id: 1, name: "乾", symbol: "☰", nature: "天", lines: [1, 1, 1] }
  // Usually lines[0] is bottom.
  const allLines = [...lower.lines, ...upper.lines];

  return (
    <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-stone-200 shadow-sm">
      <h3 className="text-stone-500 text-xs font-medium uppercase tracking-widest mb-1">{title}</h3>
      <h2 className="text-stone-900 text-xl font-serif mb-6">{name}</h2>
      
      <div className="flex flex-col-reverse gap-3 w-32">
        {allLines.map((line, index) => {
          const isMoving = movingLine === index + 1;
          return (
            <motion.div
              key={index}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative h-3 w-full flex justify-between"
            >
              {line === 1 ? (
                // Yang line (solid)
                <div className={`h-full w-full rounded-sm ${isMoving ? 'bg-red-500' : 'bg-stone-800'}`} />
              ) : (
                // Yin line (broken)
                <>
                  <div className={`h-full w-[45%] rounded-sm ${isMoving ? 'bg-red-500' : 'bg-stone-800'}`} />
                  <div className={`h-full w-[45%] rounded-sm ${isMoving ? 'bg-red-500' : 'bg-stone-800'}`} />
                </>
              )}
              {isMoving && (
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-4 text-stone-400 text-sm font-serif">
        <span>{upper.name}({upper.nature})</span>
        <span>/</span>
        <span>{lower.name}({lower.nature})</span>
      </div>
    </div>
  );
};
