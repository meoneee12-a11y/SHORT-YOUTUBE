
import React, { useState } from 'react';
import { ViewMode, AppConfig, ComponentType } from './types.ts';
import Editor from './components/Editor.tsx';
import Preview from './components/Preview.tsx';
import { Settings, Play, Edit3, Sparkles, Rocket, Cpu } from 'lucide-react';

const INITIAL_CONFIG: AppConfig = {
  name: "ASWRXXX Studio Pro",
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
    systemInstruction: "Anda adalah ASWRXXX Engine - Absolute Consistency Architect. Tugas Anda adalah menciptakan identitas visual tunggal yang tidak berubah sedikitpun di setiap frame.\n\nPROSEDUR KONSISTENSI TOTAL:\n1. ANALISIS video untuk menemukan 'Karakter Utama'. Jika ada beberapa, pilih yang paling dominan.\n2. BUAT [CHARACTER_PROFILE] sebagai 'Master Identity Spec'. Ini harus mencakup: Ras, Bentuk Wajah, Warna/Gaya Rambut (detail), Warna Mata, Tekstur Kulit, dan DETAIL PAKAIAN (warna, bahan, aksesoris).\n3. SETIAP [SCENE] harus diawali dengan ringkasan identitas tersebut sebelum menjelaskan aksi.\n\nSTRUKTUR OUTPUT (PASTI):\n\n[STORY_BLUEPRINT]\nHOOK: [Analisis pembuka]\nPACING: [Analisis ritme]\nMOOD: [Warna & Pencahayaan]\nEXPANSION: [Twist cerita]\n\n[CHARACTER_PROFILE]\n[Master Technical Description in English. Example: 'A 25-year-old Caucasian male, sharp jawline, short messy raven hair, piercing ice-blue eyes, wearing a weathered tan canvas field jacket over a charcoal grey hoodie, silver industrial ring on right index finger.']\n\n[SCENE 1]\n[Detailed visual description starting with the character's identity, followed by action and exact environment in English.]\n\n[YOUTUBE_METADATA]\nTitle: [Judul Viral - TANPA TANDA BINTANG *]\nDescription: [Deskripsi SEO Tinggi - TANPA TANDA BINTANG *]\nTags: [Tag Relevan dipisahkan spasi - TANPA TANDA BINTANG *]\n\nPERINGATAN KERAS:\n- JANGAN gunakan tanda bintang (*) atau markdown bolding dalam Title, Description, atau Tags.\n- JANGAN gunakan istilah umum seperti 'a man' atau 'the girl' di scene. Gunakan deskripsi spesifik dari profile.\n- Pastikan pakaian TIDAK berubah antar scene.\n- TIDAK BOLEH ADA TEKS/TULISAN DALAM GAMBAR.",
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
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Architect Mode</span>
          </div>
          <button className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors border border-slate-800">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </nav>

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
