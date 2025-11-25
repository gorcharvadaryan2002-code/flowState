import React, { useState } from 'react';
import { Sparkles, Wand2, Lightbulb, UserCheck, Loader2 } from 'lucide-react';
import { generateLyricsHelp } from '../services/geminiService';

interface LyricsPadProps {
  lyrics: string;
  onChange: (val: string) => void;
}

const LyricsPad: React.FC<LyricsPadProps> = ({ lyrics, onChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');

  const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const selected = target.value.substring(target.selectionStart, target.selectionEnd);
    if (selected.length > 0) {
      setSelectedText(selected);
    }
  };

  const handleAiAction = async (type: 'rhyme' | 'continue' | 'critique') => {
    setIsGenerating(true);
    setSuggestion(null);
    const context = type === 'rhyme' ? selectedText || lyrics.split('\n').pop() || '' : lyrics;
    
    // If asking for rhymes but nothing selected and empty last line, warn
    if (type === 'rhyme' && !context.trim()) {
       setSuggestion("Highlight a word or write a line first to find rhymes!");
       setIsGenerating(false);
       return;
    }

    const result = await generateLyricsHelp(context, context, type);
    setSuggestion(result);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Lyrics Pad <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Auto-save</span>
        </h3>
        <div className="flex gap-2">
            <button 
                onClick={() => handleAiAction('rhyme')}
                disabled={isGenerating}
                className="text-xs flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-brand-glow px-3 py-1.5 rounded-full transition disabled:opacity-50"
            >
                <Lightbulb size={14} /> {selectedText ? "Rhyme Selection" : "Rhyme Last Word"}
            </button>
            <button 
                 onClick={() => handleAiAction('continue')}
                 disabled={isGenerating}
                 className="text-xs flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1.5 rounded-full transition disabled:opacity-50"
            >
                <Wand2 size={14} /> Writer's Block?
            </button>
             <button 
                 onClick={() => handleAiAction('critique')}
                 disabled={isGenerating}
                 className="text-xs flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-green-400 px-3 py-1.5 rounded-full transition disabled:opacity-50"
            >
                <UserCheck size={14} /> Critique
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <textarea
          value={lyrics}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleTextSelect}
          placeholder="Yo, drop your bars here...&#10;Start writing and use the AI tools above."
          className="md:col-span-2 w-full h-[400px] md:h-auto bg-brand-surface p-6 rounded-xl text-lg leading-relaxed text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none font-mono shadow-inner border border-gray-800"
        />
        
        <div className="md:col-span-1 bg-brand-surface border border-gray-800 rounded-xl p-4 flex flex-col">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-500" /> AI Assistant
            </h4>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isGenerating ? (
                    <div className="flex items-center justify-center h-full text-gray-500 gap-2">
                        <Loader2 className="animate-spin" /> Thinking...
                    </div>
                ) : suggestion ? (
                    <div className="p-3 bg-gray-800/50 rounded-lg text-sm text-gray-300 whitespace-pre-wrap border border-gray-700">
                        {suggestion}
                    </div>
                ) : (
                    <div className="text-sm text-gray-600 text-center mt-10">
                        Select text or write lyrics, then click a tool above to get AI suggestions.
                    </div>
                )}
            </div>
            
            {suggestion && (
                <button 
                    onClick={() => {
                        const textToAppend = "\n" + suggestion;
                        onChange(lyrics + textToAppend);
                        setSuggestion(null);
                    }}
                    className="mt-4 w-full py-2 bg-brand-accent hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition"
                >
                    Append to Lyrics
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default LyricsPad;
