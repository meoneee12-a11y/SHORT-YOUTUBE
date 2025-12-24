
import React, { useState } from 'react';
import { ViewMode, AppConfig, ComponentType } from './types.ts';
import Editor from './components/Editor.tsx';
import Preview from './components/Preview.tsx';
import { Settings, Play, Edit3, Sparkles, Rocket, Cpu } from 'lucide-react';

const INITIAL_CONFIG: AppConfig = {
  name: "ASWRXXX Studio",
  elements: [
    { 
      id: '1', 
      type: ComponentType.HEADING, 
      props: { text: "Infinite Scene Studio", size: "text-3xl" } 
    },
    {
      id: 'style-1',
      type: ComponentType.VISUAL_STYLE_SELECTOR,
      props: { label: "Select Visual Universe" }
    },
    { 
      id: '2', 
      type: ComponentType.VIDEO_INPUT, 
      props: { label: "Source Reference", description: "Upload video to extract storyboard rhythm" } 
    },
    { 
      id: '3', 
      type: ComponentType.BUTTON, 
      props: { label: "Generate Storyboard", variant: "primary" } 
    }
  ],
  aiConfig: {
    systemInstruction: "Anda adalah ASWRXXX Engine - High-Consistency Storyboard Architect. Tugas utama Anda adalah MENGAMATI video referensi secara detail dan mentransformasikannya.\n\nPROSEDUR ANALISIS:\n1. Ekstrak ciri fisik karakter utama (pakaian, warna, bentuk wajah, aksesoris) dari video.\n2. Tuliskan deskripsi teknis tersebut di [CHARACTER_PROFILE]. Ini adalah kunci konsistensi gambar.\n3. Rancang storyboard yang mengikuti alur video namun dengan visual yang ditingkatkan.\n\nSTRUKTUR OUTPUT WAJIB:\n\n[STORY_BLUEPRINT]\nHOOK: [Analisis visual detik pertama]\nPACING: [Analisis kecepatan perpindahan frame]\nMOOD: [Analisis warna dan cahaya video asli]\nEXPANSION: [Ide kreatif pengembangan alur agar lebih viral]\n\n[CHARACTER_PROFILE]\n[Deskripsi fisik sangat detail dalam Bahasa Inggris: 'A [age] [gender] with [hair style/color], wearing [exact clothes description], [skin texture], [distinctive features]'.]\n\n[SCENE 1]\n[Detailed visual prompt in English, describing the environment and the character's action matching the video content.]\n\n[YOUTUBE_METADATA]\nTitle: [Judul Viral Indonesia]\nDescription: [Deskripsi SEO Indonesia]\nTags: [Tag dipisahkan spasi]\n\nATURAN KONSISTENSI:\n- Karakter di setiap [SCENE] HARUS tetap sama dengan deskripsi di [CHARACTER_PROFILE].\n- JANGAN ADA TEKS DALAM GAMBAR.",
    temperature: 0.7,
    model: 'gemini-3-flash-preview'
  }
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PREVIEW);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
             <span className="text-white font-black text-xl italic tracking-tighter select-none">RR</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white uppercase">ASWR<span className="text-indigo-400">XXX</span></h1>
          </div>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 backdrop-blur-md">
          <button 
            onClick={() => setViewMode(ViewMode.BUILD)}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === ViewMode.BUILD ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Edit3 className="w-3.5 h-3.5" /> EDITOR
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.PREVIEW)}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === ViewMode.PREVIEW ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Play className="w-3.5 h-3.5" /> PREVIEW
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Core Active</span>
          </div>
          <button className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors border border-slate-800">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
        {viewMode === ViewMode.BUILD ? (
          <Editor config={config} onUpdate={setConfig} />
        ) : (
          <div className="h-full overflow-y-auto px-6">
            <Preview config={config} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
