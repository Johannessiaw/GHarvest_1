import React, { useState, useEffect } from 'react';
import {
  Brain,
  X,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  User,
  Heart,
  Sprout,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { KofiMemoryStore, PermanentMemoryItem } from '../services/memoryEngine';

interface MemoryBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskKofi: (prompt: string) => void;
}

export const MemoryBankModal: React.FC<MemoryBankModalProps> = ({
  isOpen,
  onClose,
  onAskKofi,
}) => {
  const [memories, setMemories] = useState<PermanentMemoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [newFact, setNewFact] = useState('');
  const [newCategory, setNewCategory] = useState<PermanentMemoryItem['category']>('preference');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadMemories = () => {
    setMemories(KofiMemoryStore.getMemories());
  };

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => loadMemories();
    window.addEventListener('kofi-memory-updated', handleUpdate);
    return () => window.removeEventListener('kofi-memory-updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    KofiMemoryStore.addMemory(newFact.trim(), newCategory, 'manual');
    setNewFact('');
    loadMemories();
    setToastMessage('Memory saved permanently!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = (id: string) => {
    KofiMemoryStore.deleteMemory(id);
    loadMemories();
  };

  const handleReset = () => {
    if (window.confirm('Reset Kofi’s permanent memory to initial verified profile?')) {
      KofiMemoryStore.resetToDefault();
      loadMemories();
      setToastMessage('Memory reset to default profile.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all stored memories? Kofi will start with a fresh slate.')) {
      KofiMemoryStore.clearAll();
      loadMemories();
      setToastMessage('All memories cleared.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.category === activeFilter;
  });

  const getCategoryIcon = (category: PermanentMemoryItem['category']) => {
    switch (category) {
      case 'profile':
        return <User className="w-3.5 h-3.5 text-cyan-400" />;
      case 'preference':
        return <Heart className="w-3.5 h-3.5 text-pink-400" />;
      case 'agriculture':
        return <Sprout className="w-3.5 h-3.5 text-emerald-400" />;
      case 'note':
      case 'fact':
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0c1811] border border-emerald-800/60 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-900/60 flex items-center justify-between bg-[#112318]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg text-white font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Kofi's Permanent Memory Bank</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  100% Retention
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Persistent personal context, agricultural preferences, and multi-turn conversational recall
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Toast Notice */}
          {toastMessage && (
            <div className="bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Quick Memory Test Pills */}
          <div className="bg-[#14291d]/60 border border-emerald-800/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Test Kofi's Recall (Click to Ask Aloud)
              </span>
              <span className="text-[10px] text-gray-400">Zero Latency Recall</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '👤 Who am I?', prompt: 'What is my name and what is my role?' },
                { label: '🧠 What do you remember about me?', prompt: 'What do you remember about me?' },
                { label: '🌾 What are my crop preferences?', prompt: 'What crops and markets do I prefer?' },
                { label: '🚚 What transport do I use?', prompt: 'What haulage truck and payment method do I prefer?' },
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => {
                    onClose();
                    onAskKofi(pill.prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 font-medium transition hover:border-cyan-400/50 hover:text-white flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add New Memory Form */}
          <form onSubmit={handleAdd} className="space-y-3 bg-[#112318]/50 p-4 rounded-2xl border border-emerald-900/50">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Teach Kofi A New Fact Or Preference
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                placeholder="e.g., 'I always need tomatoes packed in wooden crates for Kumasi haulage'"
                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as PermanentMemoryItem['category'])}
                className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="preference">Preference</option>
                <option value="profile">Profile</option>
                <option value="agriculture">Agriculture</option>
                <option value="note">Note / Fact</option>
              </select>
              <button
                type="submit"
                disabled={!newFact.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </form>

          {/* Memory List & Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: `All (${memories.length})` },
                  { id: 'profile', label: 'Profile' },
                  { id: 'preference', label: 'Preferences' },
                  { id: 'agriculture', label: 'Agriculture' },
                  { id: 'fact', label: 'Facts' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      activeFilter === tab.id
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="text-[11px] text-gray-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                  title="Reset to default verified profile"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-gray-400 hover:text-red-400 transition flex items-center gap-1 cursor-pointer"
                  title="Clear all stored memories"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {filteredMemories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs border border-dashed border-emerald-950 rounded-2xl">
                No memories found in this category. You can speak or type to teach Kofi anything!
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMemories.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-700/50 transition flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 p-1 rounded-lg bg-black/40 border border-white/5 shrink-0">
                        {getCategoryIcon(m.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-200 font-medium leading-relaxed">{m.fact}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                          <span className="capitalize text-gray-400">{m.category}</span>
                          <span>•</span>
                          <span>Source: {m.source.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{m.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/10 transition"
                      title="Delete this memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-emerald-900/60 bg-[#112318]/70 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted local storage • Synchronized across voice turns</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
