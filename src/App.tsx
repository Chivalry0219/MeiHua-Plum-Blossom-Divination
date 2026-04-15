/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HEXAGRAMS, calculateMutual, calculateTransformed, localDivination, DivinationResult } from "./lib/iching";
import { Hexagram } from "./components/Hexagram";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, History, Info, Loader2, Send, Trash2, X, Settings, Check } from "lucide-react";

interface DisplaySettings {
  showOriginalText: boolean;
  showImagery: boolean;
  showInterpretation: boolean;
  showBodyUse: boolean;
  showYaoOriginal: boolean;
  showYaoInterpretation: boolean;
  // History settings
  historyShowNote: boolean;
  historyShowInterpretation: boolean;
  historyShowBodyUse: boolean;
  historyShowYaoInterpretation: boolean;
}

const DEFAULT_SETTINGS: DisplaySettings = {
  showOriginalText: true,
  showImagery: true,
  showInterpretation: true,
  showBodyUse: true,
  showYaoOriginal: true,
  showYaoInterpretation: true,
  historyShowNote: true,
  historyShowInterpretation: true,
  historyShowBodyUse: true,
  historyShowYaoInterpretation: true,
};

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
  const [showSettings, setShowSettings] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    const saved = localStorage.getItem("iching_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<DisplaySettings>) => {
    const updated = { ...displaySettings, ...newSettings };
    setDisplaySettings(updated);
    localStorage.setItem("iching_settings", JSON.stringify(updated));
  };

  const deleteHistoryItem = (id: number) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem("iching_history", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("iching_history");
    setIsConfirmingClear(false);
  };

  const closeHistory = () => {
    setShowHistory(false);
    setIsConfirmingClear(false);
  };

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
      <header className="max-w-4xl mx-auto pt-8 md:pt-12 px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white font-serif text-xl">
            易
          </div>
          <div>
            <h1 className="text-xl font-serif font-medium tracking-tight">梅花易数</h1>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">Plum Blossom Divination</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
            title="设置"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
            title="历史记录"
          >
            <History size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Input Section */}
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-100 mb-8 md:mb-12">
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

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                  <h3 className="text-lg font-serif font-medium">显示设置</h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] px-2">起卦结果显示</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'showOriginalText', label: '易经原文' },
                        { key: 'showImagery', label: '卦象意象' },
                        { key: 'showInterpretation', label: '卦象解读' },
                        { key: 'showBodyUse', label: '体用生克' },
                        { key: 'showYaoOriginal', label: '爻辞原文' },
                        { key: 'showYaoInterpretation', label: '爻辞解读' },
                      ].map((setting) => (
                        <button
                          key={setting.key}
                          onClick={() => updateSettings({ [setting.key]: !displaySettings[setting.key as keyof DisplaySettings] })}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors group"
                        >
                          <span className="font-medium text-stone-700">{setting.label}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            displaySettings[setting.key as keyof DisplaySettings] 
                              ? 'bg-stone-900 border-stone-900 text-white' 
                              : 'border-stone-200 bg-white'
                          }`}>
                            {displaySettings[setting.key as keyof DisplaySettings] && <Check size={14} />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] px-2">历史记录显示</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'historyShowNote', label: '显示备注' },
                        { key: 'historyShowInterpretation', label: '显示卦象解读' },
                        { key: 'historyShowBodyUse', label: '显示体用解读' },
                        { key: 'historyShowYaoInterpretation', label: '显示动爻解读' },
                      ].map((setting) => (
                        <button
                          key={setting.key}
                          onClick={() => updateSettings({ [setting.key]: !displaySettings[setting.key as keyof DisplaySettings] })}
                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors group"
                        >
                          <span className="font-medium text-stone-700">{setting.label}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            displaySettings[setting.key as keyof DisplaySettings] 
                              ? 'bg-stone-900 border-stone-900 text-white' 
                              : 'border-stone-200 bg-white'
                          }`}>
                            {displaySettings[setting.key as keyof DisplaySettings] && <Check size={14} />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
                
                <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
                  <p className="text-xs text-stone-400">设置将自动保存并应用于后续的起卦结果</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
              onClick={closeHistory}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 md:p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-serif font-medium">起卦历史</h3>
                    {history.length > 0 && (
                      <div className="flex items-center gap-2">
                        {isConfirmingClear ? (
                          <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                            <span className="text-[10px] text-red-600 font-medium">确认清空？</span>
                            <button 
                              onClick={clearHistory}
                              className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 transition-colors"
                            >
                              是
                            </button>
                            <button 
                              onClick={() => setIsConfirmingClear(false)}
                              className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded hover:bg-stone-300 transition-colors"
                            >
                              否
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setIsConfirmingClear(true)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            清空全部
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={closeHistory}
                    className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                  {history.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 font-serif italic">
                      暂无历史记录
                    </div>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="bg-stone-50 rounded-2xl p-4 md:p-6 border border-stone-100 space-y-4 relative group/item">
                        <button 
                          onClick={() => deleteHistoryItem(item.id)}
                          className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 transition-colors md:opacity-0 md:group-hover/item:opacity-100 opacity-100"
                          title="删除此条记录"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="flex justify-between items-start pr-8">
                          <div>
                            <span className="text-xs text-stone-400 font-mono block mb-1">{item.time}</span>
                            <h4 className="text-lg md:text-xl font-serif">起卦字：{item.text}</h4>
                          </div>
                        </div>
                        
                        {item.note && displaySettings.historyShowNote && (
                          <div className="bg-white p-3 rounded-xl border border-stone-100 text-sm text-stone-600 italic">
                            备注：{item.note}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-stone-900 uppercase tracking-wider">本卦：{item.analysis.original.name}</p>
                            {displaySettings.historyShowInterpretation && <p className="text-stone-800 line-clamp-3">{item.analysis.original.description}</p>}
                            {displaySettings.historyShowBodyUse && <p className="text-red-600 font-medium">{item.analysis.original.interactionDesc}</p>}
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-stone-900 uppercase tracking-wider">互卦：{item.analysis.mutual.name}</p>
                            {displaySettings.historyShowInterpretation && <p className="text-stone-800 line-clamp-3">{item.analysis.mutual.description}</p>}
                            {displaySettings.historyShowBodyUse && <p className="text-red-600 font-medium">{item.analysis.mutual.interactionDesc}</p>}
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-stone-900 uppercase tracking-wider">变卦：{item.analysis.transformed.name}</p>
                            {displaySettings.historyShowInterpretation && <p className="text-stone-800 line-clamp-3">{item.analysis.transformed.description}</p>}
                            {displaySettings.historyShowBodyUse && <p className="text-red-600 font-medium">{item.analysis.transformed.interactionDesc}</p>}
                          </div>
                        </div>
                        
                        {displaySettings.historyShowYaoInterpretation && (
                          <div className="pt-3 border-t border-stone-200">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">动爻（第{item.analysis.movingLine.bit}爻）</p>
                            <p className="text-sm text-stone-700">{item.analysis.movingLine.meaning}</p>
                          </div>
                        )}
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
              <section className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-stone-50 opacity-10 pointer-events-none">
                  <Sparkles size={120} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-red-500 rounded-full" />
                    <h2 className="text-xl font-serif font-medium">卦象解读</h2>
                  </div>
                  
                  <div className="prose prose-stone max-w-none">
                    <div className="text-stone-700 leading-relaxed space-y-8 font-serif text-lg">
                      {/* Original Hexagram */}
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold border-b border-stone-100 pb-2">【本卦：{result.structuredAnalysis.original.name}】</h3>
                        {displaySettings.showOriginalText && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">易经原文</span>{result.structuredAnalysis.original.judgment}</p>}
                        {displaySettings.showImagery && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">意象</span>{result.structuredAnalysis.original.meaning}</p>}
                        {displaySettings.showInterpretation && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">解读</span>{result.structuredAnalysis.original.description}</p>}
                        
                        {displaySettings.showBodyUse && (
                          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-2">
                            <h4 className="font-bold text-stone-900">【本卦体用】</h4>
                            <p className="text-sm">体卦：{result.structuredAnalysis.original.body}</p>
                            <p className="text-sm">用卦：{result.structuredAnalysis.original.use}</p>
                            <p className="text-sm">关系：{result.structuredAnalysis.original.interactionType}</p>
                            <p className="text-sm text-red-600">{result.structuredAnalysis.original.interactionDesc}</p>
                            <p className="text-xs text-stone-400 mt-2">（本卦代表事物的现状与起势面貌）</p>
                          </div>
                        )}
                      </div>

                      {/* Mutual Hexagram */}
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold border-b border-stone-100 pb-2">【互卦：{result.structuredAnalysis.mutual.name}】</h3>
                        {displaySettings.showOriginalText && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">易经原文</span>{result.structuredAnalysis.mutual.judgment}</p>}
                        {displaySettings.showImagery && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">意象</span>{result.structuredAnalysis.mutual.meaning}</p>}
                        {displaySettings.showInterpretation && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">解读</span>{result.structuredAnalysis.mutual.description}</p>}
                        
                        {displaySettings.showBodyUse && (
                          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-2">
                            <h4 className="font-bold text-stone-900">【互卦体用】</h4>
                            <p className="text-sm">体卦：{result.structuredAnalysis.mutual.body}</p>
                            <p className="text-sm">用卦：{result.structuredAnalysis.mutual.use}</p>
                            <p className="text-sm">关系：{result.structuredAnalysis.mutual.interactionType}</p>
                            <p className="text-sm text-red-600">{result.structuredAnalysis.mutual.interactionDesc}</p>
                            <p className="text-xs text-stone-400 mt-2">（互卦代表事物发展的中间过程与内在交互及事情本质）</p>
                          </div>
                        )}
                      </div>

                      {/* Transformed Hexagram */}
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold border-b border-stone-100 pb-2">【变卦：{result.structuredAnalysis.transformed.name}】</h3>
                        {displaySettings.showOriginalText && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">易经原文</span>{result.structuredAnalysis.transformed.judgment}</p>}
                        {displaySettings.showImagery && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">意象</span>{result.structuredAnalysis.transformed.meaning}</p>}
                        {displaySettings.showInterpretation && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">解读</span>{result.structuredAnalysis.transformed.description}</p>}
                        
                        {displaySettings.showBodyUse && (
                          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-2">
                            <h4 className="font-bold text-stone-900">【变卦体用】</h4>
                            <p className="text-sm">体卦：{result.structuredAnalysis.transformed.body}</p>
                            <p className="text-sm">用卦：{result.structuredAnalysis.transformed.use}</p>
                            <p className="text-sm">关系：{result.structuredAnalysis.transformed.interactionType}</p>
                            <p className="text-sm text-red-600">{result.structuredAnalysis.transformed.interactionDesc}</p>
                            <p className="text-xs text-stone-400 mt-2">（变卦代表事物的最终趋向与结果）</p>
                          </div>
                        )}
                      </div>

                      {/* Moving Line */}
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold border-b border-stone-100 pb-2">【动爻：第{result.structuredAnalysis.movingLine.bit}爻】</h3>
                        {displaySettings.showYaoOriginal && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">爻辞原文</span>{result.structuredAnalysis.movingLine.statement}</p>}
                        {displaySettings.showYaoInterpretation && <p><span className="font-bold text-stone-400 block text-sm uppercase tracking-wider">解读</span>{result.structuredAnalysis.movingLine.meaning}</p>}
                      </div>
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
