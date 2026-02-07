import React, { useState, useRef } from 'react';
import { reverseSignalGrounding } from '../services/geminiService';
import NeuralLoader from './NeuralLoader';
import {
  ArrowLeft,
  Search,
  Globe,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Fingerprint,
  Maximize2,
  Share2,
  RefreshCcw,
  Layers,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReverseGrounding: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  const handleRunSearch = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const data = await reverseSignalGrounding(file);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTrace = () => {
    setResult(null);
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col relative">
      <AnimatePresence mode="wait">
        {!result && !isLoading ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="flex-grow flex flex-col max-w-5xl mx-auto w-full justify-center py-20"
          >
            <div className="mb-16 text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-10 bg-neon/30"></div>
                <span className="text-[11px] font-black text-neon uppercase tracking-[0.6em]">Origin Investigation</span>
                <div className="h-px w-10 bg-neon/30"></div>
              </div>
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] transition-all">
                <span className="text-white">Reverse</span><br />
                <span className="text-neon">Signal Grounding</span>
              </h2>
              <p className="text-white/30 text-xl font-light italic max-w-lg mx-auto leading-relaxed pt-2">
                Trace suspected neural fabrications back to their latent source archives.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => fileInputRef.current?.click()}
              className="group relative glass border-2 border-dashed border-white/5 rounded-[4rem] transition-all duration-700 hover:border-neon hover:shadow-[0_0_100px_rgba(0,255,156,0.1)] cursor-pointer overflow-hidden"
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

              <div className="p-24 flex flex-col items-center gap-12 relative z-10">
                {preview ? (
                  <div className="relative w-80 aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-3xl bg-black">
                    <img src={preview} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700"></div>
                    <div className="absolute top-0 inset-x-0 h-1 bg-neon/50 animate-scan-sweep-fast shadow-neon"></div>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center text-white/10 group-hover:text-neon group-hover:scale-110 transition-all duration-500 shadow-2xl">
                    <Search size={48} />
                  </div>
                )}

                <div className="space-y-4 text-center">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Select Investigative Asset</h3>
                  <p className="text-white/40 text-lg font-light italic max-w-md mx-auto leading-relaxed">
                    Analyzing global archives to establish provenance and identify unauthorized neural modifications.
                  </p>
                </div>

                {file && (
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={(e) => { e.stopPropagation(); handleRunSearch(); }}
                    className="px-16 py-6 bg-white text-charcoal font-black rounded-2xl hover:bg-neon transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.3em] text-[11px] shadow-[0_30px_60px_rgba(0,255,156,0.3)] flex items-center gap-4"
                  >
                    <Globe size={18} />
                    Initiate Global Trace
                  </motion.button>
                )}
              </div>
            </motion.div>

            <button onClick={onBack} className="mt-12 mx-auto group flex items-center gap-4 text-white/20 hover:text-white transition-all">
              <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-white/20">
                <ArrowLeft size={16} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">Abort Investigation</span>
            </button>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col items-center justify-center pt-24"
          >
            <div className="relative w-80 h-80 flex items-center justify-center">
              <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-8 border border-neon/20 rounded-full animate-reverse-spin-slow"></div>
              <div className="absolute inset-16 border border-cyber/20 rounded-full animate-spin"></div>
              <NeuralLoader label="Interrogating Archives" />
            </div>

            <div className="mt-20 flex gap-4">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.1, 0.5, 0.1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  className="w-24 h-px bg-white/20"
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-grow flex flex-col gap-10 w-full pt-10"
          >
            <div className="flex flex-col xl:flex-row gap-10 items-stretch font-sans">
              <div className="xl:w-[400px] shrink-0 glass border border-white/10 rounded-[3.5rem] p-10 space-y-10 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[11px] font-black uppercase text-white/20 tracking-[0.5em]">Evidence Identity</span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-white cursor-pointer transition-colors">
                    <Maximize2 size={14} />
                  </div>
                </div>

                <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-black group-hover:border-neon/30 transition-colors duration-700">
                  <img src={preview!} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100" alt="Evidence" />
                  <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5"></div>
                  <div className="absolute top-0 inset-x-0 h-1 bg-neon/40 animate-scan-sweep-fast shadow-neon"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-1">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Confidence</span>
                    <span className="text-3xl font-black italic text-neon tracking-tighter leading-none">{result.confidence}%</span>
                  </div>
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-1">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Integrity</span>
                    <span className={`text-3xl font-black italic tracking-tighter leading-none ${result.manipulationDetected ? 'text-danger' : 'text-emerald-500'}`}>
                      {result.manipulationDetected ? 'LOW' : 'HIGH'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <Fingerprint size={16} className="text-neon/40" />
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Hash_ID: 0x{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                    </div>
                  </div>
                  <button
                    onClick={resetTrace}
                    className="w-full flex items-center justify-center gap-4 py-6 bg-white/5 border border-white/5 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neon hover:text-charcoal transition-all shadow-2xl"
                  >
                    <RefreshCcw size={16} />
                    Reset Core
                  </button>
                </div>
              </div>

              <div className="flex-grow flex flex-col gap-10">
                <div className="glass border border-white/10 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden flex-grow bg-surface/30">
                  <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none scale-150">
                    <Globe size={200} />
                  </div>

                  <div className="relative z-10 space-y-12">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border ${result.manipulationDetected ? 'bg-danger/10 text-danger border-danger/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                        {result.manipulationDetected ? <AlertCircle size={32} /> : <ShieldCheck size={32} />}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Provenance Report</h3>
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${result.manipulationDetected ? 'bg-danger shadow-danger' : 'bg-neon shadow-neon'}`}></div>
                          <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em]">{result.originalEvent || 'DETECTED CONTEXT'}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-3xl font-light italic leading-relaxed text-white/70 max-w-4xl border-l-4 border-white/5 pl-8">
                      "{result.summary}"
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      {result.findings?.map((f: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-6 p-8 glass border border-white/5 rounded-[2.5rem] hover:bg-white/[0.02] transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-neon/40 group-hover:text-neon transition-colors shrink-0">
                            <Layers size={22} />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[11px] font-black uppercase text-white/30 block tracking-widest">{f.type}</span>
                            <p className="text-lg text-white/60 italic font-light leading-relaxed">{f.detail}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass border border-white/10 rounded-[3.5rem] p-12 shadow-2xl bg-surface/20">
                  <div className="flex items-center justify-between mb-10 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-neon shadow-neon-low">
                        <FileSearch size={22} />
                      </div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-[0.6em]">Archival Matches</h4>
                    </div>
                    <span className="px-6 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">{result.sources?.length || 0} SEEDS LOCATED</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.sources?.map((s: any, i: number) => (
                      <motion.a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -5 }}
                        className="p-8 bg-charcoal/50 border border-white/5 rounded-[2rem] flex items-center justify-between group hover:border-neon hover:bg-neon/5 transition-all shadow-xl"
                      >
                        <div className="space-y-1.5 overflow-hidden pr-6">
                          <p className="text-xl font-bold text-white/90 group-hover:text-white truncate tracking-tight italic">{s.title}</p>
                          <p className="text-[10px] font-mono text-white/20 truncate lowercase opacity-50 group-hover:opacity-100 transition-opacity">{s.url}</p>
                        </div>
                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-neon group-hover:text-charcoal transition-all shadow-2xl">
                          <ExternalLink size={20} />
                        </div>
                      </motion.a>
                    ))}
                    {(!result.sources || result.sources.length === 0) && (
                      <div className="col-span-2 py-16 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <span className="text-white/10 uppercase text-xs font-black tracking-[0.4em]">Zero latency matches detected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-grow py-8 bg-white text-charcoal font-black rounded-3xl text-xs uppercase tracking-[0.4em] hover:bg-neon transition-all shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex items-center justify-center gap-4"
                  >
                    <Share2 size={18} />
                    Broadcast Report
                  </motion.button>
                  <button onClick={resetTrace} className="flex-grow py-8 glass border border-white/5 text-white/20 font-black rounded-3xl text-xs uppercase tracking-[0.4em] hover:text-white hover:bg-white/5 transition-all">
                    New Investigation
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes scan-sweep-fast {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-sweep-fast {
          animation: scan-sweep-fast 3s ease-in-out infinite;
        }
        @keyframes reverse-spin-slow {
          from { rotate: 360deg; }
          to { rotate: 0deg; }
        }
        .animate-reverse-spin-slow {
          animation: reverse-spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ReverseGrounding;
