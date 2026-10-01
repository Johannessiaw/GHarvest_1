import React from 'react';
import { Sparkles, MessageSquare, BrainCircuit, Search } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  onTriggerThinking: (scenario: string) => void;
  onTriggerSearch: (query: string) => void;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  onSelectPrompt,
  onTriggerThinking,
  onTriggerSearch,
}) => {
  const prompts = [
    { label: '🍅 Order Techiman Tomatoes', text: 'I need 50 crates of tomatoes from Techiman delivered to Kumasi.' },
    { label: '🌽 Twi Order (20 Bags Maize)', text: 'Me pɛ 20 bags of maize, na ɛsɛ sɛ wɔde kɔ Kumasi.' },
    { label: '📊 Live Market Prices', text: 'What is the current market price of tomatoes, maize and yam in Techiman and Kejetia?' },
    { label: '🚚 Transport Techiman to Accra', text: 'Calculate transport cost and route from Techiman to Accra for 50 crates.' },
    { label: '🇬🇭 History: Kwame Nkrumah', text: 'Who was Kwame Nkrumah and what was his contribution to Ghanaian agriculture?' },
    { label: '🔗 Inspect MoFA Website', text: 'Inspect this URL https://mofa.gov.gh and summarize current agricultural policies.' },
    { label: '🔢 Calculate 450 * 18', text: 'Calculate 450 * 18 GHS for my transport ledger.' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-2 mt-2">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span className="flex items-center gap-1 font-semibold text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Natural Ghanaian Voice Scenarios (Tap to Speak / Test):
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(p.text)}
            className="text-xs bg-[#112317] hover:bg-[#193523] text-gray-200 hover:text-white px-3 py-1.5 rounded-full border border-emerald-900/60 hover:border-emerald-600 transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <MessageSquare className="w-3 h-3 text-emerald-400" />
            {p.label}
          </button>
        ))}

        {/* Gemini High-Thinking Logistics Trigger */}
        <button
          onClick={() =>
            onTriggerThinking(
              'A caterer in Accra needs 500 crates of tomatoes within 48 hours. How should GHarvest aggregate smallholders across Techiman and Nkoranza to optimize transport and guarantee grade quality?'
            )
          }
          className="text-xs bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-full border border-amber-800/60 transition flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Uses Gemini High Thinking for deep supply-chain optimization"
        >
          <BrainCircuit className="w-3 h-3 text-amber-400" />
          ⚡ High-Thinking Logistics Strategy
        </button>

        {/* Google Search Grounding Trigger */}
        <button
          onClick={() => onTriggerSearch('Ghana MoFA farmgate grain prices and harvest outlook this month')}
          className="text-xs bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 hover:text-sky-200 px-3 py-1.5 rounded-full border border-sky-800/60 transition flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Uses Google Search Grounding with Gemini"
        >
          <Search className="w-3 h-3 text-sky-400" />
          🌐 Search Grounded Market News
        </button>
      </div>
    </div>
  );
};
