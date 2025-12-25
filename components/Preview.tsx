
import React, { useState, useRef, useEffect } from 'react';
import { AppConfig } from '../types.ts';
import { generateAIResponse, generateSceneImage } from '../services/geminiService.ts';
import { 
  Loader2, 
  X, 
  Copy, 
  Sparkles, 
  Box,
  PenTool,
  Cpu,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Download,
  Video,
  List,
  Camera,
  Film,
  Youtube,
  Hash,
  Type as TypeIcon,
  AlignLeft,
  Share2,
  CheckCircle2,
  Info,
  Monitor,
  Smartphone,
  Layers,
  AlertTriangle,
  Lightbulb,
  BrainCircuit,
  Workflow,
  Zap,
  Activity,
  Palette,
  Maximize2,
  Check,
  Search
} from 'lucide-react';

interface PreviewProps {
  config: AppConfig;
}

const VISUAL_STYLES = [
  { 
    id: 'realistic', 
    name: 'Realistic', 
    icon: <Camera className="w-5 h-5" />, 
    prompt: 'Hyper-realistic photography, high fidelity textures, cinematic natural lighting, 8k resolution, professional camera lens look.' 
  },
  { 
    id: '3d_cartoon_realistic', 
    name: '3D Cartoon Realistic', 
    icon: <Film className="w-5 h-5" />, 
    prompt: 'High-end 3D CGI animation, realistic fur and material physics, volumetric lighting, ray-traced shadows, modern studio animated film style.' 
  },
  { 
    id: 'pixar', 
    name: '3D Pixar', 
    icon: <Box className="w-5 h-5" />, 
    prompt: 'Soft 3D animation style, rounded shapes, vibrant colors, expressive character designs, warm lighting.' 
  },
  { 
    id: 'clay', 
    name: 'Claymation', 
    icon: <PenTool className="w-5 h-5" />, 
    prompt: 'Tactile stop-motion claymation, detailed fingerprints on clay, handmade aesthetic, soft studio lighting.' 
  },
  { 
    id: 'neon', 
    name: 'Cyberpunk', 
    icon: <Cpu className="w-5 h-5" />, 
    prompt: 'Glowy neon aesthetic, futuristic atmosphere, high contrast lighting, magenta and cyan color palette.' 
  },
];

const Preview: React.FC<PreviewProps> = ({ config }) => {
  const [videoFile, setVideoFile] = useState<{ data: string, mimeType: string } | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<typeof VISUAL_STYLES[0]>(VISUAL_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [sceneCount, setSceneCount] = useState<number>(5);
  const [storyBlueprint, setStoryBlueprint] = useState<Record<string, string> | null>(null);
  const [sceneResults, setSceneResults] = useState<{ text: string, image: string | null, isLoadingImage: boolean }[]>([]);
  const [characterProfile, setCharacterProfile] = useState<string | null>(null);
  const [youtubeMetadata, setYoutubeMetadata] = useState<{ title: string, description: string, tags: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());
  
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((isLoading || sceneResults.length > 0) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoading, sceneResults.length > 0]);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('video/')) {
      setErrorMessage("Format file tidak valid. Silakan unggah video.");
      return;
    }
    
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("Video terlalu besar (Maks 15MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      setVideoFile({ data: base64, mimeType: file.type });
      setVideoPreview(URL.createObjectURL(file));
    };
    reader.onerror = () => setErrorMessage("Gagal membaca file video.");
    reader.readAsDataURL(file);
  };

  const parseBlueprint = (text: string) => {
    const hook = text.match(/HOOK:(.*?)(PACING:|MOOD:|EXPANSION:|$)/is)?.[1].trim() || "";
    const pacing = text.match(/PACING:(.*?)(MOOD:|EXPANSION:|HOOK:|$)/is)?.[1].trim() || "";
    const mood = text.match(/MOOD:(.*?)(EXPANSION:|HOOK:|PACING:|$)/is)?.[1].trim() || "";
    const expansion = text.match(/EXPANSION:(.*?)(HOOK:|PACING:|MOOD:|$)/is)?.[1].trim() || "";
    return { hook, pacing, mood, expansion };
  };

  const handleRun = async () => {
    if (!videoFile) {
      setErrorMessage("Unggah video referensi terlebih dahulu!");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    setSceneResults([]);
    setStoryBlueprint(null);
    setCharacterProfile(null);
    setYoutubeMetadata(null);
    setCopiedIds(new Set()); 
    
    const safeSceneCount = Math.min(sceneCount, 20);

    const prompt = `LOOK CLOSELY AT THE VIDEO FILE PROVIDED.
    1. EXTRACT the most dominant character's exact physical identity.
    2. CREATE a Technical Identity Spec in [CHARACTER_PROFILE] (English). Be extremely specific about facial features, hair, and clothing layers.
    3. DESIGN ${safeSceneCount} scenes [SCENE 1] to [SCENE ${safeSceneCount}] that mirror the video's core but improve it.
    4. ENSURE every scene description starts by reinforcing the character's identity for absolute consistency.
    5. PROVIDE YouTube Metadata. JANGAN gunakan tanda bintang (*) pada judul, deskripsi, atau tag. Buatlah metadata yang sangat relevan dan menarik untuk audiens luas (High Virality).
    
    CHARACTER CONSISTENCY IS MANDATORY. The subject must never change across scenes.`;

    try {
      const aiResponse = await generateAIResponse(prompt, config.aiConfig, videoFile);
      
      if (aiResponse.startsWith("Error:")) {
        throw new Error(aiResponse);
      }

      const blueprintMatch = aiResponse.match(/\[STORY_BLUEPRINT\](.*?)(?=\[CHARACTER_PROFILE\]|\[SCENE|$)/is);
      if (blueprintMatch) {
        setStoryBlueprint(parseBlueprint(blueprintMatch[1].trim()));
      }

      const profileMatch = aiResponse.match(/\[CHARACTER_PROFILE\](.*?)(?=\[SCENE|\[YOUTUBE_METADATA\]|$)/is);
      const charProfile = profileMatch ? profileMatch[1].trim() : "A cinematic subject";
      setCharacterProfile(charProfile);

      const youtubeMatch = aiResponse.match(/\[YOUTUBE_METADATA\](.*)$/is);
      if (youtubeMatch) {
        const rawMeta = youtubeMatch[1].trim();
        // Remove asterisks using regex
        const cleanRawMeta = rawMeta.replace(/\*/g, '');
        const title = cleanRawMeta.match(/Title:(.*?)(?=Description:|$)/is)?.[1].trim() || "New Viral Video";
        const desc = cleanRawMeta.match(/Description:(.*?)(?=Tags:|$)/is)?.[1].trim() || "...";
        const tags = cleanRawMeta.match(/Tags:(.*)$/is)?.[1].trim() || "#shorts #viral";
        setYoutubeMetadata({ title, description: desc, tags });
      }

      const scenes: { text: string, image: string | null, isLoadingImage: boolean }[] = [];
      const sceneRegex = /\[SCENE \d+\](.*?)(?=\[SCENE \d+\]|\[YOUTUBE_METADATA\]|$)/gis;
      let match;
      while ((match = sceneRegex.exec(aiResponse)) !== null) {
        scenes.push({ text: match[1].trim(), image: null, isLoadingImage: true });
      }
      
      if (scenes.length === 0) {
        throw new Error("Gagal mendeteksi adegan.");
      }

      setSceneResults(scenes);
      setIsLoading(false);

      for (let i = 0; i < scenes.length; i++) {
        try {
          const imgUrl = await generateSceneImage(scenes[i].text, selectedStyle.prompt, charProfile, aspectRatio);
          setSceneResults(prev => prev.map((item, idx) => 
            idx === i ? { ...item, image: imgUrl, isLoadingImage: false } : item
          ));
        } catch (err) {
          setSceneResults(prev => prev.map((item, idx) => 
            idx === i ? { ...item, isLoadingImage: false } : item
          ));
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Gagal memproses.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIds(prev => new Set(prev).add(id));
  };

  const isCopied = (id: string) => copiedIds.has(id);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000 py-10">
      
      {errorMessage && (
        <div className="mx-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="ml-auto p-1 hover:bg-rose-500/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-700/40 via-slate-900/90 to-slate-950 border border-white/5 p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.25em]">
              <Sparkles className="w-4 h-4" /> ASWRXXX PRO ENGINE
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
              ASWR<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">XXX</span> <br/>
              <span className="text-slate-300">Infinite Flow</span>.
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">
              Dekonstruksi video cerdas dengan algoritma konsistensi karakter absolut untuk konten berdurasi singkat.
            </p>
          </div>

          <div className="bg-slate-950/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-inner ring-1 ring-white/10">
             {!videoPreview ? (
               <label className="flex flex-col items-center justify-center aspect-video cursor-pointer group rounded-[2rem] border-2 border-dashed border-slate-700 hover:border-indigo-500 transition-all bg-slate-900/20">
                 <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-2xl">
                   <Video className="w-8 h-8 text-indigo-400 group-hover:text-white" />
                 </div>
                 <span className="text-slate-500 font-black uppercase tracking-widest text-xs text-center px-4">Upload Master Video (Max 15MB)</span>
                 <input type="file" className="hidden" accept="video/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
               </label>
             ) : (
               <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                 <video src={videoPreview} className="w-full h-full object-cover" controls />
                 <button onClick={() => { setVideoPreview(null); setVideoFile(null); }} className="absolute top-4 right-4 p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all shadow-xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                   <X className="w-5 h-5" />
                 </button>
               </div>
             )}
          </div>
        </div>
      </section>

      {/* Control Station */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 bg-gradient-to-br from-slate-900/40 to-slate-950/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 space-y-8 shadow-xl">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-500" /> Visual Aesthetic Style
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Architect Online</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
             {VISUAL_STYLES.map((style) => (
               <button
                 key={style.id}
                 onClick={() => setSelectedStyle(style)}
                 className={`group relative flex flex-col items-center gap-4 p-5 rounded-3xl border transition-all duration-500 ${
                   selectedStyle.id === style.id 
                   ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl shadow-indigo-600/40 -translate-y-2' 
                   : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:bg-slate-800 hover:border-slate-700'
                 }`}
               >
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedStyle.id === style.id ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                   {style.icon}
                 </div>
                 <span className="text-[10px] font-black tracking-widest uppercase text-center leading-none">{style.name}</span>
               </button>
             ))}
           </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col gap-6 shadow-xl">
           <div className="grid grid-cols-1 gap-4">
             <div className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Layers className="w-4 h-4 text-indigo-500" /> Resolution
               </h3>
               <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                 <button onClick={() => setAspectRatio("16:9")} className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${aspectRatio === "16:9" ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                   <Monitor className="w-3.5 h-3.5" /> Wide
                 </button>
                 <button onClick={() => setAspectRatio("9:16")} className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${aspectRatio === "9:16" ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                   <Smartphone className="w-3.5 h-3.5" /> Vertical
                 </button>
               </div>
             </div>
           </div>

           <div className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <List className="w-4 h-4 text-indigo-500" /> Frame Count
             </h3>
             <div className="flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                <button onClick={() => setSceneCount(Math.max(1, sceneCount - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-600 text-white transition-all shadow-lg active:scale-90 flex-shrink-0">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input 
                  type="number"
                  min="1"
                  max="20"
                  value={sceneCount}
                  onChange={(e) => setSceneCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="w-full bg-transparent text-center text-xl font-black text-white outline-none"
                />
                <button onClick={() => setSceneCount(Math.min(20, sceneCount + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-600 text-white transition-all shadow-lg active:scale-90 flex-shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </button>
             </div>
           </div>

           <button
             onClick={handleRun} disabled={isLoading || !videoFile}
             className="relative group w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-600/30 transition-all overflow-hidden"
           >
             {isLoading ? (
               <Loader2 className="w-6 h-6 animate-spin mx-auto" />
             ) : (
               <div className="flex items-center justify-center gap-3">
                 <Workflow className="w-5 h-5" />
                 <span>START</span>
               </div>
             )}
           </button>
        </div>
      </section>

      <div ref={resultsRef} className="pt-4" />

      {isLoading && sceneResults.length === 0 && (
        <div className="space-y-12 py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
           <div className="relative">
              <div className="w-32 h-32 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Search className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
           </div>
           <div className="space-y-4">
             <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Menganalisis Konsistensi Karakter...</h2>
             <p className="text-slate-500 font-bold max-w-md mx-auto">Mesin ASWRXXX sedang memindai biometrik dan detail visual untuk menciptakan Master Identity Specification.</p>
           </div>
        </div>
      )}

      {(storyBlueprint || sceneResults.length > 0) && (
        <div className="space-y-16 animate-in slide-in-from-bottom-10 duration-1000">
          
          {storyBlueprint && (
            <div className="mx-4 space-y-10">
              <div className="flex items-center gap-5 mb-2">
                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 ring-1 ring-white/20">
                  <BrainCircuit className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Analisis Strategis & Story Blueprint</h2>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Phase 01: Algorithmic Planning</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group relative overflow-hidden bg-gradient-to-br from-rose-600/20 via-rose-900/10 to-slate-950 border border-rose-500/20 rounded-[2.5rem] p-8 hover:border-rose-500/50 transition-all hover:-translate-y-2 shadow-2xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 blur-[80px] -mr-16 -mt-16" />
                  <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <Zap className="w-4 h-4 text-rose-500" /> Viral Hook (Red)
                  </h4>
                  <p className="text-slate-100 text-sm leading-relaxed font-semibold italic relative z-10">
                    {storyBlueprint.hook || "Calculating..."}
                  </p>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-blue-900/10 to-slate-950 border border-blue-500/20 rounded-[2.5rem] p-8 hover:border-blue-500/50 transition-all hover:-translate-y-2 shadow-2xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[80px] -mr-16 -mt-16" />
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <Activity className="w-4 h-4 text-blue-500" /> Rhythm Master (Blue)
                  </h4>
                  <p className="text-slate-100 text-sm leading-relaxed font-semibold italic relative z-10">
                    {storyBlueprint.pacing || "Calculating..."}
                  </p>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-600/20 via-cyan-900/10 to-slate-950 border border-cyan-500/20 rounded-[2.5rem] p-8 hover:border-cyan-500/50 transition-all hover:-translate-y-2 shadow-2xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-[80px] -mr-16 -mt-16" />
                  <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <Palette className="w-4 h-4 text-cyan-500" /> Visual Aura (Cyan)
                  </h4>
                  <p className="text-slate-100 text-sm leading-relaxed font-semibold italic relative z-10">
                    {storyBlueprint.mood || "Calculating..."}
                  </p>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-amber-600/20 via-amber-900/10 to-slate-950 border border-amber-500/20 rounded-[2.5rem] p-8 hover:border-amber-500/50 transition-all hover:-translate-y-2 shadow-2xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-[80px] -mr-16 -mt-16" />
                  <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <Maximize2 className="w-4 h-4 text-amber-500" /> Story Twist (Yellow)
                  </h4>
                  <p className="text-slate-100 text-sm leading-relaxed font-semibold italic relative z-10">
                    {storyBlueprint.expansion || "Calculating..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {characterProfile && (
            <div className="mx-4 relative overflow-hidden bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border border-cyan-500/20 rounded-[3rem] p-10 flex items-start gap-8 backdrop-blur-xl shadow-2xl ring-1 ring-cyan-500/20">
               <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl ring-2 ring-white/10">
                 <Cpu className="w-8 h-8 text-white" />
               </div>
               <div className="space-y-3 relative z-10">
                 <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em]">Master Identity Specification (Hard-Locked)</h4>
                 <p className="text-slate-200 text-xl italic font-bold leading-relaxed pr-10">"{characterProfile}"</p>
                 <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                   <CheckCircle2 className="w-3 h-3" /> Synchronized across all scenes
                 </div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-12">
            {sceneResults.map((scene, idx) => {
              const elementId = `prompt-${idx}`;
              const copied = isCopied(elementId);
              
              return (
                <div key={idx} className="group relative flex flex-col lg:flex-row gap-10 bg-gradient-to-r from-slate-900/60 to-slate-950/80 p-10 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden transition-all duration-700">
                  <div className={`relative ${aspectRatio === "9:16" ? "lg:w-1/3 aspect-[9/16]" : "lg:w-3/5 aspect-video"} rounded-[3rem] overflow-hidden bg-slate-950 shadow-2xl ring-1 ring-white/10 mx-auto`}>
                    {scene.isLoadingImage ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-10 backdrop-blur-lg">
                        <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="mt-8 flex flex-col items-center">
                          <span className="text-[12px] text-slate-400 font-black uppercase tracking-[0.4em] animate-pulse">Rendering Master Spec</span>
                          <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">FRAME {idx + 1}</span>
                        </div>
                      </div>
                    ) : scene.image ? (
                      <>
                        <img src={scene.image} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" alt={`Scene ${idx + 1}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-10">
                          <button onClick={() => { const link = document.createElement('a'); link.href = scene.image!; link.download = `scene-${idx + 1}.png`; link.click(); }} className="p-5 bg-white/10 hover:bg-indigo-600 text-white rounded-[2rem] transition-all border border-white/20 shadow-2xl backdrop-blur-md">
                            <Download className="w-8 h-8" />
                          </button>
                        </div>
                      </>
                    ) : <div className="absolute inset-0 flex items-center justify-center opacity-5"><ImageIcon className="w-32 h-32" /></div>}
                    <div className="absolute top-8 left-8 px-8 py-3 bg-indigo-600 rounded-[1.5rem] font-black text-white shadow-2xl border border-white/20 z-20 text-xs tracking-widest uppercase flex items-center gap-2">
                      <Film className="w-4 h-4" /> FRAME {idx + 1}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-4 space-y-8 relative z-10">
                    <div className="space-y-8">
                      <div className={`transition-all duration-500 rounded-[2.5rem] ${copied ? 'ring-4 ring-cyan-500/50 p-2 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-6 rounded-full transition-colors duration-500 ${copied ? 'bg-cyan-500' : 'bg-indigo-500'}`} />
                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${copied ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                              {copied ? 'Visual Prompt Disalin (Marked)' : 'Visual Architecture Prompt'}
                            </span>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(scene.text, elementId)} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all shadow-xl group/btn ${
                              copied 
                              ? 'bg-cyan-600 border-cyan-400 text-white' 
                              : 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border-slate-700'
                            }`}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'Disalin' : 'Salin'}</span>
                          </button>
                        </div>
                        <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${
                          copied 
                          ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]' 
                          : 'bg-slate-950/50 border-white/5 shadow-inner'
                        }`}>
                          <p className={`text-lg leading-relaxed font-bold italic transition-colors duration-500 ${
                            copied ? 'text-cyan-300' : 'text-slate-200'
                          }`}>
                            "{scene.text}"
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 shadow-inner">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Master Identity Locked</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Palette className="w-4 h-4 text-indigo-400" />
                         <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{selectedStyle.name} Architecture</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {youtubeMetadata && (
              <div className="relative mt-24 overflow-hidden rounded-[4.5rem] bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 border border-white/10 shadow-2xl animate-in fade-in duration-1000">
                 <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-14 py-10 flex items-center justify-between shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -mr-48 -mt-48" />
                   <div className="flex items-center gap-7 relative z-10">
                     <div className="w-16 h-16 bg-white/20 rounded-[1.75rem] flex items-center justify-center backdrop-blur-2xl ring-1 ring-white/30 shadow-2xl">
                       <Youtube className="w-9 h-9 text-white" />
                     </div>
                     <div>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter">SEO Analytics Core</h3>
                       <p className="text-[12px] font-black text-indigo-200 uppercase tracking-[0.4em]">Optimized for Maximum Virality</p>
                     </div>
                   </div>
                   <button 
                    onClick={() => copyToClipboard(`${youtubeMetadata.title}\n\n${youtubeMetadata.description}\n\n${youtubeMetadata.tags}`, "all-meta")} 
                    className={`relative z-10 flex items-center gap-4 px-10 py-5 rounded-[2rem] font-black text-sm transition-all shadow-2xl hover:-translate-y-1 active:scale-95 ${
                      isCopied("all-meta") 
                      ? 'bg-cyan-500 text-white shadow-cyan-500/50' 
                      : 'bg-white text-indigo-700 hover:bg-indigo-50'
                    }`}
                   >
                      {isCopied("all-meta") ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
                      <span>{isCopied("all-meta") ? 'METADATA DISALIN' : 'SALIN SEMUA ANALYTICS'}</span>
                   </button>
                 </div>

                 <div className="p-14 space-y-14">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
                     <div className="space-y-12">
                       <div className="space-y-5">
                         <label className="flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]"><TypeIcon className="w-5 h-5 text-indigo-500" /> Strategic Title</label>
                         <div className={`group relative bg-slate-950/80 border rounded-[2.5rem] p-10 transition-all ${isCopied("title") ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-white/5 shadow-inner'}`}>
                           <p className={`text-3xl font-black leading-tight ${isCopied("title") ? 'text-cyan-300' : 'text-white'}`}>{youtubeMetadata.title}</p>
                           <button onClick={() => copyToClipboard(youtubeMetadata.title, "title")} className="absolute top-6 right-6 p-4 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 hover:bg-indigo-600 rounded-2xl text-slate-400 hover:text-white shadow-2xl">
                             {isCopied("title") ? <Check className="w-5 h-5 text-cyan-400" /> : <Copy className="w-5 h-5" />}
                           </button>
                         </div>
                       </div>
                       <div className="space-y-5">
                         <label className="flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]"><Hash className="w-5 h-5 text-indigo-500" /> Latent Semantic Tags</label>
                         <div className={`group relative bg-slate-950/80 border rounded-[2.5rem] p-8 flex flex-wrap gap-3 ${isCopied("tags") ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-white/5 shadow-inner'}`}>
                           {youtubeMetadata.tags.split(/\s+/).map((tag, i) => (
                             <span key={i} className="px-5 py-3 bg-slate-800 text-indigo-400 rounded-2xl text-xs font-black border border-white/5 shadow-lg">#{tag.replace('#','')}</span>
                           ))}
                           <button onClick={() => copyToClipboard(youtubeMetadata.tags, "tags")} className="absolute top-6 right-6 p-4 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 hover:bg-indigo-600 rounded-2xl text-slate-400 hover:text-white shadow-2xl">
                             {isCopied("tags") ? <Check className="w-5 h-5 text-cyan-400" /> : <Copy className="w-5 h-5" />}
                           </button>
                         </div>
                       </div>
                     </div>
                     <div className="space-y-5 h-full">
                       <label className="flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]"><AlignLeft className="w-5 h-5 text-indigo-500" /> High-Engagement Narrative</label>
                       <div className={`group relative h-[calc(100%-3.5rem)] bg-slate-950/80 border rounded-[3rem] p-12 transition-all ${isCopied("desc") ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.05)]' : 'border-white/5 shadow-inner'}`}>
                          <p className={`text-[15px] leading-relaxed whitespace-pre-wrap font-bold h-full max-h-[450px] overflow-y-auto custom-scrollbar pr-8 ${isCopied("desc") ? 'text-cyan-100' : 'text-slate-400'}`}>{youtubeMetadata.description}</p>
                          <button onClick={() => copyToClipboard(youtubeMetadata.description, "desc")} className="absolute top-8 right-8 p-4 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 hover:bg-indigo-600 rounded-2xl text-slate-400 hover:text-white shadow-2xl">
                             {isCopied("desc") ? <Check className="w-5 h-5 text-cyan-400" /> : <Copy className="w-5 h-5" />}
                          </button>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && !storyBlueprint && sceneResults.length === 0 && (
        <div className="py-48 flex flex-col items-center justify-center text-center space-y-10 bg-gradient-to-b from-slate-900/40 to-indigo-950/20 rounded-[5rem] border-2 border-dashed border-white/5 shadow-2xl">
           <div className="w-28 h-28 bg-slate-900 rounded-[3rem] flex items-center justify-center shadow-inner ring-1 ring-white/5 animate-float">
             <Workflow className="w-12 h-12 text-indigo-500" />
           </div>
           <div className="space-y-4">
             <h3 className="text-2xl font-black text-slate-300 uppercase tracking-[0.3em]">Ready for Analysis</h3>
             <p className="text-slate-500 font-bold max-w-sm text-lg text-center">Tarik video referensi Anda untuk memicu algoritma dekonstruksi alur cerita.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Preview;
