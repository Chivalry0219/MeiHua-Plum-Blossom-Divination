/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HEXAGRAMS, calculateMutual, calculateTransformed, localDivination, DivinationResult } from "./lib/iching";
import { Hexagram } from "./components/Hexagram";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, History, Info, Loader2, Send } from "lucide-react";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDivination = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const hour = new Date().getHours();
      // Local divination logic
      const data = localDivination(inputText, hour);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("起卦失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  const mutual = result ? calculateMutual(result.upperTrigramId, result.lowerTrigramId) : null;
  const transformed = result ? calculateTransformed(result.upperTrigramId, result.lowerTrigramId, result.movingLine) : null;

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 font-sans selection:bg-red-100 selection:text-red-900">
      {/* Header */}
      <header className="max-w-4xl mx-auto pt-12 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white font-serif text-xl">
            易
          </div>
          <div>
            <h1 className="text-xl font-serif font-medium tracking-tight">梅花易数</h1>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">Plum Blossom Divination</p>
          </div>
        </div>
        <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
          <History size={20} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Input Section */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 mb-12">
            <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-serif mb-2">时过于期，否终则泰</h2>
            <p className="text-stone-500 text-sm mb-8">请输入起卦字（如姓名、事物、心中所想）</p>
            
            <div className="relative group">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入起卦字..."
                className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-lg focus:ring-2 focus:ring-stone-200 transition-all placeholder:text-stone-300"
                onKeyDown={(e) => e.key === "Enter" && handleDivination()}
              />
              <button
                onClick={handleDivination}
                disabled={loading || !inputText.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                <span>起卦</span>
              </button>
            </div>
            
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Stroke Info */}
              <div className="flex flex-wrap justify-center gap-4">
                {result.strokes.map((s, i) => (
                  <div key={i} className="bg-white px-4 py-2 rounded-full border border-stone-100 shadow-sm flex items-center gap-2">
                    <span className="text-xl font-serif">{s.char}</span>
                    <span className="text-xs text-stone-400 font-mono">{s.count}画</span>
                  </div>
                ))}
                <div className="bg-stone-900 text-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest opacity-70">总计</span>
                  <span className="font-mono font-bold">{result.totalStrokes}</span>
                </div>
              </div>

              {/* Hexagrams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Hexagram
                  title="本卦 (Original)"
                  name={HEXAGRAMS[`${result.upperTrigramId}${result.lowerTrigramId}`]?.name || "未知卦"}
                  upperId={result.upperTrigramId}
                  lowerId={result.lowerTrigramId}
                  movingLine={result.movingLine}
                />
                {mutual && (
                  <Hexagram
                    title="互卦 (Mutual)"
                    name={HEXAGRAMS[`${mutual.upperId}${mutual.lowerId}`]?.name || "未知卦"}
                    upperId={mutual.upperId}
                    lowerId={mutual.lowerId}
                  />
                )}
                {transformed && (
                  <Hexagram
                    title="变卦 (Transformed)"
                    name={HEXAGRAMS[`${transformed.upperId}${transformed.lowerId}`]?.name || "未知卦"}
                    upperId={transformed.upperId}
                    lowerId={transformed.lowerId}
                  />
                )}
              </div>

              {/* Analysis Section */}
              <section className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-stone-50 opacity-10 pointer-events-none">
                  <Sparkles size={120} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-red-500 rounded-full" />
                    <h2 className="text-xl font-serif font-medium">卦象解读</h2>
                  </div>
                  
                  <div className="prose prose-stone max-w-none">
                    <div className="text-stone-700 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                      {result.analysis}
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 space-y-6"
            >
              <div className="relative">
                <Loader2 className="animate-spin text-stone-200" size={64} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-stone-900 rounded-full animate-ping" />
                </div>
              </div>
              <p className="text-stone-400 font-serif animate-pulse">正在推演天机，请稍候...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center border-t border-stone-100">
        <p className="text-stone-300 text-xs uppercase tracking-[0.2em] mb-4">
          生如逆旅，一苇以航
        </p>
        <div className="flex justify-center gap-6 text-stone-400">
          <a href="#" className="hover:text-stone-900 transition-colors"><Info size={18} /></a>
        </div>
      </footer>
    </div>
  );
}
