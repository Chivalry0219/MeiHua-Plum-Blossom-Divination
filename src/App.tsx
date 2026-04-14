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
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("iching_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const handleDivination = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const hour = new Date().getHours();
      const data = localDivination(inputText, hour);
      setResult(data);
      
      // Save to history
      const newRecord = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        text: inputText,
        note: note,
        analysis: data.structuredAnalysis
      };
      const newHistory = [newRecord, ...history].slice(0, 50); // Keep last 50
      setHistory(newHistory);
      localStorage.setItem("iching_history", JSON.stringify(newHistory));
      setNote(""); // Clear note after divination
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
        <button 
          onClick={() => setShowHistory(true)}
          className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <History size={20} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Input Section */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 mb-12">
            <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-serif mb-2">时过于期，否终则泰</h2>
            <p className="text-stone-500 text-sm mb-8">请输入起卦字与备注（如起卦问题、所求之事）</p>
            
            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="输入起卦字..."
                  className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-lg focus:ring-2 focus:ring-stone-200 transition-all placeholder:text-stone-300"
                  onKeyDown={(e) => e.key === "Enter" && handleDivination()}
                />
              </div>
              
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加备注（如：问事业发展、今日心情等）"
                className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-stone-200 transition-all placeholder:text-stone-300 min-h-[100px] resize-none"
              />

              <button
                onClick={handleDivination}
                disabled={loading || !inputText.trim()}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                <span>起卦</span>
              </button>
            </div>
            
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
          </div>
        </section>

        {/* History Modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                  <h3 className="text-lg font-serif font-medium">起卦历史</h3>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    关闭
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {history.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 font-serif italic">
                      暂无历史记录
                    </div>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="bg-stone-50 rounded-2xl p-6 border border-stone-100 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-stone-400 font-mono block mb-1">{item.time}</span>
                            <h4 className="text-xl font-serif">起卦字：{item.text}</h4>
                          </div>
                          <div className="bg-stone-900 text-white px-3 py-1 rounded-full text-xs font-serif">
                            {item.analysis.original.name}
                          </div>
                        </div>
                        
                        {item.note && (
                          <div className="bg-white p-3 rounded-xl border border-stone-100 text-sm text-stone-600 italic">
                            备注：{item.note}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-stone-400 uppercase tracking-wider">本卦</p>
                            <p className="text-stone-800 line-clamp-3">{item.analysis.original.description}</p>
                            <p className="text-red-600 font-medium">{item.analysis.original.interaction}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-stone-400 uppercase tracking-wider">互卦</p>
                            <p className="text-stone-800 line-clamp-3">{item.analysis.mutual.description}</p>
                            <p className="text-red-600 font-medium">{item.analysis.mutual.interaction}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-stone-400 uppercase tracking-wider">变卦</p>
                            <p className="text-stone-800 line-clamp-3">{item.analysis.transformed.description}</p>
                            <p className="text-red-600 font-medium">{item.analysis.transformed.interaction}</p>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-stone-200">
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">动爻（第{item.analysis.movingLine.bit}爻）</p>
                          <p className="text-sm text-stone-700">{item.analysis.movingLine.meaning}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
