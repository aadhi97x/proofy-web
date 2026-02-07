
import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, Verdict } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Activity,
  Download,
  Share2,
  Play,
  Pause,
  Fingerprint,
  Zap,
  RotateCcw,
  ArrowLeft,
  BarChart3,
  Target,
  ArrowDownRight,
  AlertTriangle,
  ChevronDown,
  Timer,
  Scan,
  Database,
  Search,
  Cpu
} from 'lucide-react';

interface ResultsScreenProps {
  result: AnalysisResult;
  onReupload: () => void;
  onOpenReport: () => void;
  onOpenTimeline: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onReupload, onOpenReport }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [activeAnomaly, setActiveAnomaly] = useState<any | null>(null);
  const [expandedAnomaly, setExpandedAnomaly] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState("00:00");
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = result.fileMetadata.type.includes('video');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setVideoProgress((video.currentTime / video.duration) * 100);
        const mins = Math.floor(video.currentTime / 60);
        const secs = Math.floor(video.currentTime % 60);
        setCurrentTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isVideo]);

  const seekTo = (timestampStr?: string, explanation?: any) => {
    if (!videoRef.current || !timestampStr) return;
    const [mins, secs] = timestampStr.split(':').map(Number);
    const time = (mins * 60) + (secs || 0);

    videoRef.current.currentTime = time;
    videoRef.current.pause();

    if (explanation) {
      setActiveAnomaly(explanation);
      setTimeout(() => setActiveAnomaly(null), 4000);
    }
  };

  const handleAnomalyClick = (idx: number, e: any) => {
    const isExpanding = expandedAnomaly !== idx;
    setExpandedAnomaly(isExpanding ? idx : null);
    if (isExpanding && e.timestamp) {
      seekTo(e.timestamp, e);
    }
  };

  const handleExport = (type: string) => {
    if (type === 'PDF' || type === 'TXT') onOpenReport();
    else {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `proofy_report_${result.id}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  const getPointerPos = (category: string) => {
    switch (category) {
      case 'visual': return { top: '25%', left: '40%' };
      case 'audio': return { top: '70%', left: '30%' };
      case 'temporal': return { top: '50%', left: '50%' };
      default: return { top: '40%', left: '40%' };
    }
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col font-sans selection:bg-neon selection:text-charcoal pt-24">
      {/* Top HUD Navigation */}
      <nav className="fixed top-0 inset-x-0 z-[100] glass border-b border-white/5 h-20 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-neon text-charcoal px-3 py-1 rounded font-black italic text-sm tracking-tighter shadow-neon">SESSION</div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-white tracking-[0.3em] leading-none mb-1">NODE_ID: {result.id.slice(0, 8)}</span>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-tighter">{new Date(result.timestamp).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onReupload} className="flex items-center gap-3 px-5 py-2.5 glass border border-white/5 text-white/60 hover:text-neon hover:border-neon/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            <ArrowLeft size={14} /> Back to Terminal
          </button>
          <button onClick={() => window.location.reload()} className="flex items-center gap-3 px-5 py-2.5 bg-white text-charcoal rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neon transition-all hover:scale-105 active:scale-95 shadow-xl">
            <RotateCcw size={14} /> New Inspection
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-[1700px] mx-auto w-full p-8 md:p-12 space-y-12">
        {/* Verdict Banner Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`lg:col-span-8 p-12 rounded-[3rem] border flex flex-col justify-center relative overflow-hidden transition-all shadow-3xl ${result.verdict === Verdict.REAL ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-danger/5 border-danger/20'}`}>
            <div className="relative z-10 space-y-6">
              <div className={`w-fit px-8 py-3 rounded-2xl border-2 font-black italic uppercase tracking-[0.3em] text-xl ${result.verdict === Verdict.REAL ? 'border-emerald-500 text-emerald-500' : 'border-danger text-danger shadow-[0_0_40px_rgba(255,45,85,0.2)]'}`}>
                {result.verdict === Verdict.REAL ? 'AUTHENTIC_SIGNAL' : 'NEURAL_FABRICATION'}
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black tracking-tight italic uppercase">Forensic Executive Summary</h2>
                <p className="text-white/70 text-lg italic font-light leading-relaxed max-w-4xl">{result.summary}</p>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 p-12 opacity-5 scale-150">
              {result.verdict === Verdict.REAL ? <ShieldCheck size={300} /> : <AlertTriangle size={300} />}
            </div>

            {/* Animated Scan Line */}
            <motion.div
              className={`absolute top-0 bottom-0 w-[2px] ${result.verdict === Verdict.REAL ? 'bg-emerald-500/40' : 'bg-danger/40'}`}
              animate={{ left: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="lg:col-span-4 glass border border-white/5 rounded-[3rem] p-12 flex flex-col items-center justify-between shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 left-0 p-8 opacity-5">
              <Scan size={64} className="text-white" />
            </div>

            <div className="w-full text-center space-y-10 relative z-10">
              <div className="space-y-2">
                <span className="block text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">Neural Fabrication Index</span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-[9rem] font-black italic tracking-tighter tabular-nums leading-none ${result.deepfakeProbability > 60 ? 'text-danger' : result.deepfakeProbability > 30 ? 'text-yellow-500' : 'text-neon'}`}>
                    {result.deepfakeProbability}
                  </span>
                  <span className="text-3xl font-black text-white/20 uppercase">%</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Confidence</span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${result.confidenceLevel === 'High' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'}`}>
                    {result.confidenceLevel}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/5"></div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Entropy</span>
                  <span className="text-[10px] font-data text-white/60">0.024 RMS</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/5">
              <motion.div
                className={`h-full ${result.deepfakeProbability > 60 ? 'bg-danger' : 'bg-neon'}`}
                initial={{ width: 0 }}
                animate={{ width: `${result.deepfakeProbability}%` }}
                transition={{ duration: 2, ease: "circOut" }}
              />
            </div>
          </div>
        </section>

        {/* Main Analysis Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Technical Evidence */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass border border-white/5 rounded-[3.5rem] p-12 shadow-3xl flex flex-col h-full bg-surface/40">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Analytical Vector Log</h3>
                  <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">Sub-Layer Anomalies Detected</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-neon/10 border border-neon/20 rounded-xl">
                  <Activity size={14} className="text-neon animate-pulse" />
                  <span className="text-[9px] font-black text-neon uppercase tracking-widest">Live_Sieve_V2</span>
                </div>
              </div>

              <div className="space-y-5 overflow-y-auto pr-4 max-h-[800px] no-scrollbar">
                {result.explanations.map((e, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-3xl transition-all duration-500 ${expandedAnomaly === idx ? 'border-neon/50 bg-neon/5' : 'border-white/5 bg-charcoal/40 hover:border-white/10 hover:bg-charcoal/60'}`}
                  >
                    <button
                      onClick={() => handleAnomalyClick(idx, e)}
                      className="w-full text-left flex items-center justify-between p-8 group"
                    >
                      <div className="flex items-center gap-8">
                        <div className={`w-3 h-3 rotate-45 border-2 transition-all duration-500 ${result.deepfakeProbability > 40 ? 'bg-danger border-danger shadow-[0_0_15px_rgba(255,45,85,0.4)]' : 'bg-neon border-neon shadow-[0_0_15px_rgba(0,255,156,0.4)]'}`}></div>
                        <div className="space-y-1.5">
                          <h4 className={`text-sm font-black uppercase tracking-[0.2em] transition-colors ${expandedAnomaly === idx ? 'text-neon' : 'text-white/90 group-hover:text-white'}`}>
                            {e.point}
                          </h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">CLASS: {e.category}</span>
                            {e.timestamp && (
                              <span className="text-[9px] font-mono text-cyber uppercase tracking-widest bg-cyber/10 px-2 py-0.5 rounded-md border border-cyber/20">{e.timestamp}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-white/20 transition-transform duration-500 ${expandedAnomaly === idx ? 'rotate-180 text-neon' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedAnomaly === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-16 pb-10 space-y-6">
                            <div className="h-[1px] bg-white/5" />
                            <p className="text-base text-white/60 italic leading-relaxed font-light">
                              {e.detail}
                            </p>
                            <div className="flex gap-4">
                              <div className="px-4 py-2 glass border border-white/5 rounded-lg text-[10px] uppercase font-bold text-white/40">Vector Probability: 84%</div>
                              <div className="px-4 py-2 glass border border-white/5 rounded-lg text-[10px] uppercase font-bold text-white/40">Latent Artifact ID: 0xF22</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {result.explanations.length === 0 && (
                  <div className="py-48 flex flex-col items-center justify-center gap-8 border border-dashed border-white/5 rounded-[3.5rem] bg-charcoal/20">
                    <ShieldCheck size={48} className="text-white/5" />
                    <span className="text-[13px] text-white/10 uppercase font-black tracking-[0.8em] italic">PURE SIGNAL DETECTED</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Inspector & Data */}
          <div className="lg:col-span-5 space-y-10">
            {/* Immersive Viewer */}
            <div className="glass border border-white/5 rounded-[3.5rem] overflow-hidden shadow-3xl bg-surface/40">
              <div className="p-8 border-b border-white/5 bg-charcoal/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/60">Forensic Scrying Lens</h3>
                </div>
                <span className="text-[11px] font-data text-white/20 bg-white/5 px-3 py-1 rounded-lg uppercase">{currentTime} / {videoRef.current?.duration ? `${Math.floor(videoRef.current.duration / 60)}:${Math.floor(videoRef.current.duration % 60).toString().padStart(2, '0')}` : '00:00'}</span>
              </div>

              <div className="relative aspect-video bg-black flex items-center justify-center group/viewer overflow-hidden">
                {isVideo ? (
                  <video
                    ref={videoRef}
                    src={result.fileMetadata.preview}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={togglePlayback}
                  />
                ) : (
                  <img src={result.fileMetadata.preview} className="w-full h-full object-contain" alt="Evidence" />
                )}

                {/* Anomaly Overlay */}
                <AnimatePresence>
                  {activeAnomaly && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 pointer-events-none z-20"
                    >
                      <div
                        className="absolute flex flex-col items-center gap-4"
                        style={getPointerPos(activeAnomaly.category)}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <div className="w-16 h-16 border-2 border-danger rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,45,85,0.6)]">
                            <div className="w-2 h-2 bg-danger rounded-full"></div>
                          </div>
                        </motion.div>
                        <div className="bg-charcoal/90 border border-danger/40 px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl">
                          <div className="flex items-center gap-3">
                            <AlertTriangle size={14} className="text-danger" />
                            <span className="text-[11px] font-black uppercase text-white tracking-[0.2em]">{activeAnomaly.point}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Playback Controls Overlay */}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                      onClick={togglePlayback}
                      className={`p-10 bg-black/60 rounded-full backdrop-blur-3xl border border-white/10 text-white pointer-events-auto transition-all duration-700 ${isPlaying ? 'opacity-0 scale-90 group-hover/viewer:opacity-100 group-hover/viewer:scale-100' : 'opacity-100 scale-100 shadow-[0_0_40px_rgba(0,0,0,0.5)]'}`}
                    >
                      {isPlaying ? <Pause size={48} /> : <Play size={48} fill="currentColor" className="ml-2" />}
                    </button>
                  </div>
                )}

                {/* Corner Scan HUD */}
                <div className="absolute top-4 left-4 pointer-events-none text-white/20 font-mono text-[8px] space-y-1">
                  <div>SCANNING_MODE: INFRARED_SPECTRAL</div>
                  <div>FILTER: LATENT_ARTIFACT_v9.1</div>
                </div>
              </div>

              {/* Viewer Footer: Data & Waveform */}
              <div className="p-10 space-y-10 bg-charcoal/30">
                {isVideo ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 glass border border-white/5 rounded-xl flex items-center justify-center text-neon shadow-neon-low">
                          <BarChart3 size={18} />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Temporal Delta Matrix</h4>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest font-mono">Real-time Entropy Fluctuations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black italic text-neon tabular-nums">{videoProgress.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="relative h-28 glass border border-white/5 rounded-2xl overflow-hidden p-2 group/poly">
                      <div className="absolute inset-0 flex items-end gap-[2px]">
                        {Array.from({ length: 80 }).map((_, i) => {
                          const barTimePercent = (i / 80) * 100;
                          const matchingAnomalyIdx = result.explanations.findIndex(exp => {
                            if (!exp.timestamp || !videoRef.current?.duration) return false;
                            const [m, s] = exp.timestamp.split(':').map(Number);
                            const anomalyTime = (m * 60 + s);
                            const anomalyPercent = (anomalyTime / videoRef.current.duration) * 100;
                            return Math.abs(anomalyPercent - barTimePercent) < 1.5;
                          });

                          const baseHeight = 20 + Math.random() * 20;
                          const anomalyHeight = 70 + Math.random() * 25;
                          const height = matchingAnomalyIdx !== -1 ? anomalyHeight : baseHeight;

                          return (
                            <div
                              key={i}
                              className={`flex-grow transition-all duration-700 rounded-t-sm ${matchingAnomalyIdx !== -1 ? 'bg-danger shadow-[0_0_20px_rgba(255,45,85,0.4)]' : 'bg-neon/30'}`}
                              style={{
                                height: `${height}%`,
                                opacity: (i / 80) * 100 < videoProgress ? 1 : 0.1,
                                transform: (i / 80) * 100 < videoProgress ? 'scaleY(1)' : 'scaleY(0.8)'
                              }}
                            ></div>
                          );
                        })}
                      </div>

                      <div
                        className="absolute top-0 bottom-0 w-[3px] bg-white z-10 shadow-[0_0_20px_white]"
                        style={{ left: `${videoProgress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-3 px-4 py-2 glass border border-white/5 rounded-full">
                        <Timer size={14} className="text-white/20" />
                        <span className="text-[10px] font-mono font-black text-white/60 tracking-[0.2em]">{currentTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></div>
                        <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest italic leading-none">High-Entropy Spikes Detected</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 glass border border-white/5 rounded-2xl flex items-center justify-center text-neon">
                        <Target size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-white">Pixel-Level Heatmap</h4>
                        <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest leading-none">Neural Artifact Localization</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {result.explanations.slice(0, 4).map((exp, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnomalyClick(i, exp)}
                          className={`flex items-center justify-between p-6 glass border rounded-2xl transition-all duration-500 ${expandedAnomaly === i ? 'bg-neon/10 border-neon/50' : 'border-white/5 hover:bg-white/[0.02] hover:border-white/10'}`}
                        >
                          <div className="space-y-2 text-left">
                            <div className="flex items-center gap-3">
                              <Cpu size={12} className={expandedAnomaly === i ? 'text-neon' : 'text-white/20'} />
                              <span className={`text-[10px] font-black uppercase tracking-[0.3em] font-data ${result.deepfakeProbability > 50 ? 'text-danger' : 'text-neon'}`}>{exp.point}</span>
                            </div>
                            <p className="text-xs text-white/40 italic font-light truncate max-w-[280px]">{exp.detail}</p>
                          </div>
                          <div className={`p-2 rounded-lg transition-colors ${expandedAnomaly === i ? 'bg-neon/20 text-neon' : 'bg-white/5 text-white/20'}`}>
                            <ChevronDown size={14} className={`transition-transform duration-500 ${expandedAnomaly === i ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Metadata Chips */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 glass border border-white/5 rounded-2xl flex items-center gap-5">
                    <Fingerprint size={24} className="text-neon/30" />
                    <div className="overflow-hidden">
                      <span className="text-[9px] font-black text-white/20 uppercase block tracking-[0.4em] mb-1">Fingerprint ID</span>
                      <p className="text-[10px] font-mono text-white/50 truncate tracking-tighter italic">SIG_0x77A_VERIFIED</p>
                    </div>
                  </div>
                  <div className="p-5 glass border border-white/5 rounded-2xl flex items-center gap-5">
                    <Database size={24} className="text-cyber/30" />
                    <div className="overflow-hidden">
                      <span className="text-[9px] font-black text-white/20 uppercase block tracking-[0.4em] mb-1">Source Match</span>
                      <p className="text-[10px] font-mono text-white/50 truncate tracking-tighter italic text-cyber">99.8% CERTAINTY</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Guidance & Actions */}
        <section className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-neon/5 blur-[120px] rounded-full -top-40 -left-40 group-hover:bg-neon/10 transition-colors duration-1000"></div>
          <div className="relative glass border border-white/10 rounded-[4rem] p-16 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center shadow-3xl bg-surface/30">
            <div className="shrink-0 w-28 h-28 bg-charcoal/50 border border-white/5 rounded-[2.5rem] flex items-center justify-center text-white/10 shadow-2xl relative overflow-hidden group-hover:border-neon/30 transition-colors">
              <Activity size={56} className="group-hover:text-neon transition-colors duration-700" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-neon/10 to-transparent"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            <div className="flex-grow space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px w-8 bg-neon/40"></div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Actionable Forensics</h3>
                </div>
                <p className="text-xl text-white/60 leading-relaxed italic max-w-5xl font-light">
                  {result.userRecommendation}
                </p>
              </div>

              <div className="flex items-center gap-8 flex-wrap">
                <FeatureTag icon={Database} label="Neural Provenance Verified" />
                <FeatureTag icon={Search} label="Metadata Integrity Validated" />
                <FeatureTag icon={ShieldCheck} label="Chain of Custody Active" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0 w-full lg:w-80">
              <button onClick={() => handleExport('TXT')} className="w-full relative px-10 py-6 bg-white text-charcoal font-black rounded-[2rem] text-sm uppercase tracking-widest hover:bg-neon transition-all duration-700 overflow-hidden group/btn shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
                <span className="relative z-10 flex items-center justify-center gap-3 italic">
                  <Download size={18} /> Forensic Certificate
                </span>
                <div className="absolute inset-0 bg-charcoal translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 opacity-5" />
              </button>
              <button onClick={() => handleExport('JSON')} className="w-full px-10 py-6 glass border border-white/10 text-white/40 font-black rounded-[2rem] text-xs uppercase tracking-[0.3em] hover:text-white hover:border-white/30 transition-all duration-500 whitespace-nowrap italic">
                <Share2 size={16} className="inline mr-2" /> Broadcast Intelligence
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Decorative Bottom Bar */}
      <footer className="py-12 px-12 border-t border-white/5 opacity-20 flex justify-between items-center text-[9px] font-mono uppercase tracking-[0.6em]">
        <span>Node: Forensic-v2.0.4 // Local-Grid: 12.0.4</span>
        <span>Proofy.AI Neural Intelligence // [2026]</span>
        <span>Status: Connected_Securely</span>
      </footer>
    </div>
  );
};

const FeatureTag: React.FC<{ icon: any, label: string }> = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3">
    <div className="p-1.5 rounded-lg bg-white/5">
      <Icon size={12} className="text-white/40" />
    </div>
    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
  </div>
);

export default ResultsScreen;
