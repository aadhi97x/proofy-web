import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSyntheticImage, generateSyntheticVideo } from '../services/geminiService';
import NeuralLoader from './NeuralLoader';
import { ArrowLeft, Sparkles, Image as ImageIcon, Video, TextCursorInput, Wand2, Download, AlertTriangle, Cpu, Zap, Activity, Info } from 'lucide-react';

const RedTeamLab: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResultUrl(null);
    setStatus(mode === 'IMAGE' ? "Synthesizing Pixel Tensors..." : "Initiating Temporal Sequence...");

    try {
      if (mode === 'IMAGE') {
        const url = await generateSyntheticImage(prompt, aspectRatio);
        setResultUrl(url);
      } else {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
        setStatus("Compressing temporal layers... estimating 60-90s.");
        const url = await generateSyntheticVideo(prompt);
        setResultUrl(url);
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        setStatus("API KEY ERROR: Valid project key required.");
        await (window as any).aistudio.openSelectKey();
      } else {
        setStatus("SYNTHESIS_FAILED: Pipeline interrupted.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-40">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
        <div className="space-y-6">
          <button onClick={onBack} className="group flex items-center gap-4 text-white/20 hover:text-neon transition-all">
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-neon/40">
              <ArrowLeft size={16} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Laboratory Exit</span>
          </button>
          <div className="space-y-2">
            <h2 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.8] flex flex-col">
              <span className="text-white">Red-Team</span>
              <span className="text-neon">Neural Synthesis Lab</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-2">
                <AlertTriangle size={12} className="text-danger" />
                <span className="text-[10px] font-mono text-danger uppercase tracking-widest">Experimental_Environment</span>
              </div>
              <p className="text-white/30 text-lg italic font-light tracking-tight max-w-sm">
                Simulating advanced fabrications to harden forensic nodes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex bg-surface/40 p-2 rounded-[2rem] border border-white/5 glass shadow-2xl">
          <button
            onClick={() => { setMode('IMAGE'); setResultUrl(null); }}
            className={`flex items-center gap-3 px-10 py-5 rounded-[1.75rem] text-[11px] font-black transition-all tracking-[0.3em] ${mode === 'IMAGE' ? 'bg-white text-charcoal shadow-2xl scale-105' : 'text-white/20 hover:text-white'}`}
          >
            <ImageIcon size={16} />
            IMAGE_SYSTH
          </button>
          <button
            onClick={() => { setMode('VIDEO'); setResultUrl(null); }}
            className={`flex items-center gap-3 px-10 py-5 rounded-[1.75rem] text-[11px] font-black transition-all tracking-[0.3em] ${mode === 'VIDEO' ? 'bg-white text-charcoal shadow-2xl scale-105' : 'text-white/20 hover:text-white group'}`}
          >
            <Video size={16} />
            VIDEO_SYNTH
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-12 items-stretch">
        <div className="lg:col-span-12 xl:col-span-5 space-y-12">
          <div className="glass border border-white/10 p-16 rounded-[4rem] space-y-12 shadow-2xl bg-surface/30 relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-1000">
              <Wand2 size={200} />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                  <TextCursorInput size={18} />
                </div>
                <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.6em]">Synthesis_Prompt</label>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'IMAGE' ? "Specify neural parameters for image generation..." : "Describe the temporal sequence for video synthesis..."}
                className="w-full h-56 bg-black/40 border border-white/10 rounded-[2.5rem] p-10 text-white text-lg focus:border-neon outline-none transition-all resize-none font-mono placeholder:text-white/10"
              />
            </div>

            <AnimatePresence>
              {mode === 'IMAGE' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 relative z-10"
                >
                  <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.6em] px-2 block">Dimensional_Anchor</label>
                  <div className="flex flex-wrap gap-3">
                    {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-6 py-3 rounded-2xl border text-[10px] font-black transition-all tracking-widest ${aspectRatio === ratio ? 'bg-neon text-charcoal border-neon shadow-neon' : 'border-white/5 text-white/30 hover:border-white/20 hover:text-white'}`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full py-6 bg-white text-charcoal font-black rounded-3xl hover:bg-neon hover:shadow-neon transition-all disabled:opacity-20 uppercase tracking-[0.5em] text-[11px] shadow-2xl relative z-10 group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin"></div>
                  Interrogating Latent Space
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <Sparkles size={16} className="group-hover:animate-pulse" />
                  Initiate Synthesis
                </div>
              )}
            </motion.button>
          </div>

          <div className="px-10 py-8 glass border border-white/5 rounded-[2.5rem] flex items-center justify-between opacity-40">
            <div className="flex items-center gap-4">
              <Info size={16} />
              <span className="text-[10px] font-mono uppercase tracking-widest">Neural Safety Protocols Active</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-neon rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-neon/40 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 flex flex-col">
          <div className="flex-grow glass border border-white/10 rounded-[4.5rem] flex items-center justify-center relative min-h-[600px] overflow-hidden shadow-2xl bg-black/40 group">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-[0.05] pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-white/20"></div>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center relative z-10 p-20">
                <NeuralLoader label={status} />
              </div>
            ) : resultUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col items-center justify-center p-12 relative z-10"
              >
                <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-charcoal group/result transition-all duration-700 hover:scale-[1.02] hover:border-white/20">
                  {mode === 'IMAGE' ? (
                    <img src={resultUrl} className="w-full h-full object-contain" alt="Synthetic Result" />
                  ) : (
                    <video src={resultUrl} controls className="w-full h-full object-contain" />
                  )}

                  {/* Result Metadata Overlay */}
                  <div className="absolute top-8 right-8 flex flex-col items-end gap-3 translate-y-2 opacity-0 group-hover/result:translate-y-0 group-hover/result:opacity-100 transition-all duration-500">
                    <div className="bg-black/80 backdrop-blur-xl px-5 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                      <span className="w-2 h-2 bg-danger rounded-full animate-pulse shadow-danger"></span>
                      <span className="text-[9px] font-black font-mono text-white/80 uppercase tracking-widest">Synthetic_Signal_Detected</span>
                    </div>
                    <div className="bg-neon/10 backdrop-blur-xl px-5 py-2 rounded-xl border border-neon/20 flex items-center gap-3">
                      <span className="text-[9px] font-black font-mono text-neon uppercase tracking-widest">Metadata_Stripped</span>
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 px-8 py-4 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/5 flex justify-between items-center opacity-0 group-hover/result:opacity-100 transition-opacity duration-700">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Model_Source</span>
                      <span className="text-xs font-mono font-black text-white">Neural_G_Alpha_v2</span>
                    </div>
                    <button className="flex items-center gap-3 text-neon hover:text-white transition-colors">
                      <Download size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Capture Asset</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center space-y-8 opacity-10 relative z-10">
                <div className="w-32 h-32 mx-auto border-2 border-dashed border-white rounded-[2.5rem] flex items-center justify-center">
                  <Cpu size={64} strokeWidth={1} />
                </div>
                <div className="space-y-4">
                  <p className="text-2xl font-black uppercase italic tracking-tighter">Simulation Chamber Empty</p>
                  <div className="flex justify-center gap-6">
                    <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Awaiting Vector Key</span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Stream Buffer: 0%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6">
            <div className="p-6 glass border border-white/5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-3 text-white/20 mb-1">
                <Zap size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Latency</span>
              </div>
              <span className="text-sm font-mono font-black text-white/60">0.42ms</span>
            </div>
            <div className="p-6 glass border border-white/5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-3 text-white/20 mb-1">
                <Activity size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Flux</span>
              </div>
              <span className="text-sm font-mono font-black text-white/60">4.1 TB/S</span>
            </div>
            <div className="p-6 glass border border-white/5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-3 text-white/20 mb-1">
                <Cpu size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Cluster</span>
              </div>
              <span className="text-sm font-mono font-black text-white/60">ID: N-90</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedTeamLab;
