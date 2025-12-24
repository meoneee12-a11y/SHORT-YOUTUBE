
import React, { useState } from 'react';
import { AppConfig, ComponentType, AppElement } from '../types.ts';
import { 
  Type, 
  Square, 
  MousePointer2, 
  Trash2, 
  Plus, 
  Settings2,
  Video,
  Clapperboard,
  Palette
} from 'lucide-react';

interface EditorProps {
  config: AppConfig;
  onUpdate: (config: AppConfig) => void;
}

const COMPONENT_METADATA = [
  { type: ComponentType.HEADING, label: "Heading", icon: <Type className="w-4 h-4" /> },
  { type: ComponentType.BUTTON, label: "Generate Button", icon: <MousePointer2 className="w-4 h-4" /> },
  { type: ComponentType.RESULT_DISPLAY, label: "Scene Box", icon: <Square className="w-4 h-4" /> },
  { type: ComponentType.VIDEO_INPUT, label: "Video Upload", icon: <Video className="w-4 h-4" /> },
  { type: ComponentType.VISUAL_STYLE_SELECTOR, label: "Style Selector", icon: <Palette className="w-4 h-4" /> },
];

const Editor: React.FC<EditorProps> = ({ config, onUpdate }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addElement = (type: ComponentType) => {
    const newElement: AppElement = {
      id: Date.now().toString(),
      type,
      props: type === ComponentType.HEADING ? { text: "New Section", size: "text-2xl" } : 
             type === ComponentType.BUTTON ? { label: "Generate Storyboard", variant: "primary" } :
             type === ComponentType.VIDEO_INPUT ? { label: "Input Video", description: "Drop video here" } :
             type === ComponentType.VISUAL_STYLE_SELECTOR ? { label: "Choose Story Aesthetic" } :
             { label: "SCENE X" }
    };
    onUpdate({ ...config, elements: [...config.elements, newElement] });
    setSelectedId(newElement.id);
  };

  const removeElement = (id: string) => {
    onUpdate({ ...config, elements: config.elements.filter(el => el.id !== id) });
    if (selectedId === id) setSelectedId(null);
  };

  const updateProp = (id: string, propKey: string, value: any) => {
    onUpdate({
      ...config,
      elements: config.elements.map(el => 
        el.id === id ? { ...el, props: { ...el.props, [propKey]: value } } : el
      )
    });
  };

  const updateAIConfig = (key: string, value: any) => {
    onUpdate({ ...config, aiConfig: { ...config.aiConfig, [key]: value } });
  };

  const selectedElement = config.elements.find(el => el.id === selectedId);

  return (
    <div className="flex h-full w-full">
      <aside className="w-64 border-r border-slate-800 bg-slate-900 p-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Toolbar</h2>
        <div className="grid grid-cols-1 gap-2">
          {COMPONENT_METADATA.map((comp) => (
            <button
              key={comp.type}
              onClick={() => addElement(comp.type)}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-800 hover:border-indigo-500 bg-slate-800/50 hover:bg-slate-800 transition-all text-sm font-medium text-slate-300"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                {comp.icon}
              </div>
              {comp.label}
              <Plus className="w-3 h-3 ml-auto" />
            </button>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Logic Config</h2>
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] text-slate-400 uppercase font-black">AI System Logic</label>
            <textarea
              value={config.aiConfig.systemInstruction}
              onChange={(e) => updateAIConfig('systemInstruction', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 h-32 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </aside>

      <div className="flex-1 bg-slate-950 p-12 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-xl min-h-[600px] border border-slate-200 p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-6">
            <Clapperboard className="w-6 h-6 text-indigo-600" />
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Canvas Editor</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {config.elements.map((el) => (
              <div
                key={el.id}
                onClick={() => setSelectedId(el.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  selectedId === el.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-300 uppercase">{el.type}</span>
                  {selectedId === el.id && (
                    <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="text-rose-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-2 font-bold text-slate-800">
                  {el.props.label || el.props.text || "Element"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="w-72 border-l border-slate-800 bg-slate-900 p-6">
        {selectedElement ? (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Properties</h2>
            <div className="space-y-4">
              {Object.keys(selectedElement.props).map((key) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">{key}</label>
                  <input
                    type="text"
                    value={selectedElement.props[key]}
                    onChange={(e) => updateProp(selectedElement.id, key, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : <p className="text-slate-500 text-xs italic text-center mt-20">Select item to edit</p>}
      </aside>
    </div>
  );
};

export default Editor;
