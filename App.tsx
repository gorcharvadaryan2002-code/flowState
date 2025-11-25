import React, { useState, useEffect } from 'react';
import { Project, StudioTab } from './types';
import LyricsPad from './components/LyricsPad';
import AudioRecorder from './components/AudioRecorder';
import PublishFlow from './components/PublishFlow';
import { Mic2, PenTool, UploadCloud, Plus, ChevronLeft, PlayCircle, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'studio'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>(StudioTab.WRITE);

  // Load from local storage on mount (simulated)
  useEffect(() => {
    const saved = localStorage.getItem('flowstate_projects');
    if (saved) {
        try {
            setProjects(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load projects", e);
        }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('flowstate_projects', JSON.stringify(projects));
  }, [projects]);

  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'Untitled Track',
      lyrics: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft'
    };
    setProjects([newProject, ...projects]);
    setCurrentProject(newProject);
    setView('studio');
    setActiveTab(StudioTab.WRITE);
  };

  const openProject = (project: Project) => {
      setCurrentProject(project);
      setView('studio');
      setActiveTab(StudioTab.WRITE);
  };

  const updateCurrentProject = (updates: Partial<Project>) => {
      if (!currentProject) return;
      const updated = { ...currentProject, ...updates, updatedAt: Date.now() };
      setCurrentProject(updated);
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
  };

  const handlePublishSuccess = () => {
      if(currentProject) {
        updateCurrentProject({ status: 'published' });
      }
      setTimeout(() => {
          setView('dashboard');
          setCurrentProject(null);
      }, 1000);
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-brand-dark text-white p-6 md:p-12">
        <header className="flex justify-between items-center mb-12">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-accent to-blue-500 bg-clip-text text-transparent">
                    FLOWSTATE
                </h1>
                <p className="text-gray-400 mt-2">The AI-Powered Studio for Modern Lyricists</p>
            </div>
            <button 
                onClick={createNewProject}
                className="flex items-center gap-2 bg-brand-accent hover:bg-violet-600 text-white px-6 py-3 rounded-full font-bold transition shadow-lg shadow-violet-900/20"
            >
                <Plus size={20} /> New Project
            </button>
        </header>

        <section>
            <h2 className="text-xl font-bold mb-6 text-gray-200">Your Projects</h2>
            {projects.length === 0 ? (
                <div className="text-center py-20 bg-brand-surface rounded-2xl border border-gray-800 border-dashed">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mic2 size={32} className="text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-lg">No tracks yet. Start cooking up some heat!</p>
                    <button onClick={createNewProject} className="mt-4 text-brand-accent hover:underline">Create your first track</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => openProject(p)}
                            className="bg-brand-surface group hover:bg-gray-800 cursor-pointer rounded-xl p-5 border border-gray-800 transition-all hover:border-brand-accent/50 hover:translate-y-[-2px] relative overflow-hidden"
                        >
                            {p.status === 'published' && (
                                <div className="absolute top-0 right-0 bg-brand-success text-black text-xs font-bold px-2 py-1 rounded-bl-lg">
                                    LIVE
                                </div>
                            )}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gray-900 rounded-lg flex-shrink-0 overflow-hidden">
                                    {p.coverArtUrl ? (
                                        <img src={p.coverArtUrl} className="w-full h-full object-cover" alt="art" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <MusicIcon size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg truncate text-white group-hover:text-brand-glow transition-colors">{p.title || "Untitled"}</h3>
                                    <p className="text-sm text-gray-500 truncate">{p.artistName || "Unknown Artist"}</p>
                                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-600">
                                        <Clock size={12} />
                                        <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    </div>
  );

  const renderStudio = () => {
    if (!currentProject) return null;

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            {/* Studio Header */}
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-brand-surface/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setView('dashboard')}
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <input 
                            value={currentProject.title}
                            onChange={(e) => updateCurrentProject({ title: e.target.value })}
                            className="bg-transparent text-white font-bold text-lg focus:outline-none placeholder-gray-600"
                            placeholder="Untitled Track"
                        />
                    </div>
                </div>
                <div className="text-xs text-gray-500 font-mono hidden md:block">
                    Last Saved: {new Date(currentProject.updatedAt).toLocaleTimeString()}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center py-6">
                <div className="flex bg-brand-surface p-1 rounded-full border border-gray-800">
                    <button
                        onClick={() => setActiveTab(StudioTab.WRITE)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === StudioTab.WRITE ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <PenTool size={16} /> Write
                    </button>
                    <button
                        onClick={() => setActiveTab(StudioTab.RECORD)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === StudioTab.RECORD ? 'bg-red-900/50 text-red-200 shadow-md border border-red-900' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Mic2 size={16} /> Record
                    </button>
                    <button
                        onClick={() => setActiveTab(StudioTab.PUBLISH)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === StudioTab.PUBLISH ? 'bg-brand-accent text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <UploadCloud size={16} /> Publish
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 overflow-y-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === StudioTab.WRITE && (
                        <LyricsPad 
                            lyrics={currentProject.lyrics} 
                            onChange={(val) => updateCurrentProject({ lyrics: val })} 
                        />
                    )}
                    
                    {activeTab === StudioTab.RECORD && (
                        <div className="max-w-2xl mx-auto">
                             <div className="bg-brand-surface rounded-2xl border border-gray-800 p-8 shadow-2xl">
                                <AudioRecorder 
                                    existingAudioUrl={currentProject.audioUrl}
                                    onRecordingComplete={(blob) => {
                                        const url = URL.createObjectURL(blob);
                                        updateCurrentProject({ audioBlob: blob, audioUrl: url });
                                    }} 
                                />
                             </div>
                             
                             <div className="mt-8 p-6 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                <h4 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Lyrics Prompt</h4>
                                <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed opacity-80 h-48 overflow-y-auto custom-scrollbar">
                                    {currentProject.lyrics || "No lyrics written yet. Go back to 'Write' tab."}
                                </p>
                             </div>
                        </div>
                    )}

                    {activeTab === StudioTab.PUBLISH && (
                        <PublishFlow 
                            project={currentProject}
                            onUpdateProject={updateCurrentProject}
                            onPublish={handlePublishSuccess}
                        />
                    )}
                </div>
            </div>
        </div>
    );
  };

  return view === 'dashboard' ? renderDashboard() : renderStudio();
};

const MusicIcon = ({size}: {size:number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
);

export default App;
