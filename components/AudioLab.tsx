import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { transcribeAudio } from '../services/geminiService';
import NeuralLoader from './NeuralLoader';
import { ArrowLeft, Mic, Square, Volume2, Activity, Zap, Headphones, Cpu, Database, Ghost } from 'lucide-react';

const AudioLab: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup Analyser for Visuals
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setIsLoading(true);
        try {
          const text = await transcribeAudio(blob);
          setTranscription(text);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Mic access denied", e);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    audioContextRef.current?.close();
    setVolume(0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
        <div className="space-y-6">
          <button onClick={onBack} className="group flex items-center gap-4 text-white/20 hover:text-neon transition-all">
            <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-neon/40">
              <ArrowLeft size={16} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Sever Uplink</span>
          </button>
          <div className="space-y-2">
            <h2 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.8] flex flex-col">
              <span className="text-white">Acoustic</span>
              <span className="text-neon">Signal Interrogator</span>
            </h2>
            <p className="text-white/30 text-lg italic font-light tracking-tight max-w-md">
              Isolating latent neural signatures within vocal frequency streams.
            </p>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-10 py-6 px-10 glass border border-white/5 rounded-[2.5rem] bg-surface/20">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">Encryption_Mode</span>
            <span className="text-neon font-mono text-sm font-black italic tracking-tighter uppercase leading-none">Quantum_Gate</span>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-cyber rounded-full animate-pulse shadow-cyber"></div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Signal_Lock</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-10">
          <div className="glass border border-white/10 p-16 md:p-24 rounded-[4rem] flex flex-col items-center gap-16 text-center shadow-2xl relative overflow-hidden flex-grow bg-surface/40 group">
            <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-1000">
              <Volume2 size={240} />
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-48 h-48 rounded-[3.5rem] flex items-center justify-center transition-all duration-700 relative z-10 ${isRecording
                    ? 'bg-danger text-white shadow-[0_0_80px_rgba(255,45,85,0.4)] rotate-90 scale-110'
                    : 'bg-white text-charcoal shadow-2xl hover:bg-neon hover:shadow-neon group'
                  }`}
              >
                {isRecording ? (
                  <Square size={40} fill="currentColor" className="animate-pulse" />
                ) : (
                  <Mic size={48} className="group-hover:scale-110 transition-transform" />
                )}
              </motion.button>

              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 border-[6px] border-danger/20 rounded-[4rem] animate-ping pointer-events-none"
                  ></motion.div>
                )}
              </AnimatePresence>

              {/* Spectral Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                {[1.4, 1.8, 2.2].map((s, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: isRecording ? s + (volume / 200) : s,
                      opacity: isRecording ? [0.1, 0.3, 0.1] : 0.05
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-[3.5rem]"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                {isRecording ? 'Capturing Frequency' : transcription ? 'Sequence Finalized' : 'Ready for Ingest'}
              </h3>
              <p className="text-white/30 text-lg font-light italic max-w-sm mx-auto leading-relaxed">
                Establishing a high-fidelity acoustic bridge for deep-layer pattern interrogation.
              </p>
            </div>

            {isRecording && (
              <div className="w-full max-w-xs space-y-4 relative z-10">
                <div className="flex justify-between items-end px-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Acoustic_Load</span>
                  <span className="text-xs font-mono font-black text-neon">{Math.floor(volume)} DB</span>
                </div>
                <div className="h-3 bg-black/60 rounded-full border border-white/5 p-[3px] overflow-hidden">
                  <motion.div
                    animate={{ width: `${Math.min(100, volume)}%` }}
                    className="h-full bg-neon rounded-full shadow-neon transition-all"
                  ></motion.div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="mt-8 animate-in fade-in zoom-in-95">
                <NeuralLoader label="Interrogating Vocal Artifacts" />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-10">
          <div className="glass border border-white/10 p-16 md:p-24 rounded-[4rem] shadow-2xl relative overflow-hidden flex-grow bg-surface/30">
            <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none rotate-12 scale-150">
              <Database size={200} />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neon">
                  <Zap size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-black tracking-[0.6em] uppercase text-white/40 leading-none mb-1">Intel_Brief</h4>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Recovered Signal</h3>
                </div>
              </div>

              <div className="flex-grow flex flex-col">
                {transcription ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-grow space-y-12"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-neon shadow-neon"></div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Textual manifest</span>
                      </div>
                      <p className="text-4xl font-light text-white/80 leading-[1.4] italic underline decoration-white/5 underline-offset-[16px] decoration-8">
                        "{transcription}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-12">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(transcription);
                          // Handle feedback would be good here
                        }}
                        className="flex flex-col gap-4 p-8 glass border border-white/5 rounded-[2.5rem] hover:bg-white/[0.04] transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-neon group-hover:scale-110 transition-all">
                          <Zap size={18} />
                        </div>
                        <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Copy to Clipboard</span>
                      </button>
                      <button
                        onClick={() => setTranscription(null)}
                        className="flex flex-col gap-4 p-8 glass border border-white/5 rounded-[2.5rem] hover:bg-danger/10 hover:border-danger/20 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-danger group-hover:bg-danger/10 transition-all">
                          <Square size={18} />
                        </div>
                        <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Clear Buffer</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 opacity-20">
                    <Headphones size={80} strokeWidth={1} />
                    <div className="space-y-2">
                      <p className="text-xl font-black uppercase italic tracking-tighter">No Active Stream</p>
                      <p className="text-xs font-mono uppercase tracking-widest">Awaiting acoustic data for forensic ingestion...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-16 pt-10 border-t border-white/5 grid grid-cols-3 gap-8">
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] block">Soverignty</span>
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={12} className="text-emerald-500/40" />
                    <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">Verified</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] block">Processor</span>
                  <div className="flex items-center gap-3">
                    <Cpu size={12} className="text-cyber/40" />
                    <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">Neural_4</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] block">Signal_Type</span>
                  <div className="flex items-center gap-3">
                    <Activity size={12} className="text-neon/40" />
                    <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">Waveform</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 opacity-[0.05] pointer-events-none pb-12">
        <Ghost size={24} />
        <p className="text-[11px] font-mono uppercase tracking-[1em]">Forensic Silence Protocol Engaged</p>
        <Ghost size={24} />
      </div>
    </div>
  );
};

export default AudioLab;
