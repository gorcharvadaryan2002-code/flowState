import React, { useState } from 'react';
import { generateCoverArt } from '../services/geminiService';
import { Project } from '../types';
import { Loader2, Music, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface PublishFlowProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  onPublish: () => void;
}

const PublishFlow: React.FC<PublishFlowProps> = ({ project, onUpdateProject, onPublish }) => {
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const handleGenerateArt = async () => {
    if (!project.title) {
        setError("Please add a title first.");
        return;
    }
    setIsGeneratingArt(true);
    setError(null);
    const artUrl = await generateCoverArt(project.title, project.lyrics);
    if (artUrl) {
        onUpdateProject({ coverArtUrl: artUrl });
    } else {
        setError("Failed to generate art. Try again.");
    }
    setIsGeneratingArt(false);
  };

  const handlePublish = () => {
      if (!project.title || !project.artistName) {
          setError("Artist Name and Title are required.");
          return;
      }
      setPublished(true);
      setTimeout(() => {
          onPublish();
      }, 2000);
  };

  if (published) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                  <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Published Successfully!</h2>
              <p className="text-gray-400">Your track "{project.title}" is now live on the platform.</p>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Release Your Track</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Metadata */}
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium uppercase tracking-wider">Track Title</label>
                <input 
                    type="text" 
                    value={project.title}
                    onChange={(e) => onUpdateProject({ title: e.target.value })}
                    className="w-full bg-brand-surface border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
                    placeholder="Enter song title..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium uppercase tracking-wider">Artist Name</label>
                <input 
                    type="text" 
                    value={project.artistName || ''}
                    onChange={(e) => onUpdateProject({ artistName: e.target.value })}
                    className="w-full bg-brand-surface border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
                    placeholder="Your Stage Name"
                />
            </div>
            
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                    <Music className="text-brand-accent" size={20} />
                    <span className="text-white font-medium">Audio Source</span>
                </div>
                {project.audioUrl ? (
                    <audio controls src={project.audioUrl} className="w-full h-8 mt-2" />
                ) : (
                    <div className="text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> No recording found. Go back to Record tab.
                    </div>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}
        </div>

        {/* Right Column: Cover Art */}
        <div className="space-y-4">
             <label className="text-sm text-gray-400 font-medium uppercase tracking-wider">Cover Art</label>
             <div className="aspect-square w-full rounded-xl bg-brand-surface border-2 border-dashed border-gray-700 flex flex-col items-center justify-center overflow-hidden relative group">
                {project.coverArtUrl ? (
                    <>
                        <img src={project.coverArtUrl} alt="Cover Art" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={handleGenerateArt}
                                className="px-4 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition transform"
                            >
                                Regenerate
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Music className="text-gray-500" />
                        </div>
                        <p className="text-gray-400 text-sm mb-4">Generate unique cover art based on your lyrics using Gemini AI.</p>
                        <button 
                            onClick={handleGenerateArt}
                            disabled={isGeneratingArt || !project.title}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-brand-glow rounded-full text-sm font-medium transition flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingArt ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                            Generate Artwork
                        </button>
                    </div>
                )}
             </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
          <button
            onClick={handlePublish}
            disabled={!project.audioUrl || !project.title || !project.artistName}
            className="px-8 py-4 bg-brand-accent hover:bg-violet-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-brand-accent/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
          >
              <Upload size={20} />
              Publish Track
          </button>
      </div>
    </div>
  );
};

// Add missing icon import
import { Wand2 } from 'lucide-react';

export default PublishFlow;
