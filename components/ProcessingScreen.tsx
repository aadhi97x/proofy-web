import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const forensicSteps = [
  { id: 'integrity', label: "ASSET_VOLUMETRIC_SCAN", subtext: "PROBING DIGITAL LATTICE" },
  { id: 'biometric', label: "SEMANTIC_IDENTITY_CHECK", subtext: "MAPPING NEURAL TOPOGRAPHY" },
  { id: 'neural', label: "SYNTHETIC_SIGNAL_ANALYSIS", subtext: "DECODING ARTIFICIAL ARTIFACTS" },
  { id: 'temporal', label: "CHRONO_FLUIDITY_INTERROGATION", subtext: "VERIFYING TEMPORAL SYNC" }
];

const ProcessingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = 100 / forensicSteps.length;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 0.4;
        const nextProgress = prev + increment;

        if (nextProgress >= 100) {
          clearInterval(progressInterval);
          return 99.9;
        }

        const newStep = Math.floor(nextProgress / stepDuration);
        if (newStep !== currentStep && newStep < forensicSteps.length) {
          setCurrentStep(newStep);
        }

        return nextProgress;
      });
    }, 60);

    return () => {
      clearInterval(progressInterval);
    };
  }, [currentStep]);

  const size = 520;
  const center = size / 2;
  const radius = 180;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="fixed inset-0 z-[200] bg-charcoal flex flex-col items-center justify-center p-10 overflow-hidden">
      {/* Background HUD Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/20"></div>
          ))}
        </div>
      </div>

      <div className="relative w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-24 lg:gap-48 px-12">
        {/* Central Scanner */}
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-white/5 rounded-full"
          ></motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="absolute inset-12 border border-neon/10 border-t-neon/40 rounded-full"
          ></motion.div>

          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 drop-shadow-[0_0_30px_rgba(0,255,156,0.3)]">
            <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
            <motion.circle
              cx={center} cy={center} r={radius}
              fill="none"
              stroke="var(--neon)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - (circumference * progress) / 100 }}
              style={{ transition: 'stroke-dashoffset 0.3s linear' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <motion.span
                key={Math.floor(progress)}
                initial={{ filter: 'blur(10px)', opacity: 0 }}
                animate={{ filter: 'blur(0px)', opacity: 1 }}
                className="text-[12rem] font-black italic tracking-tighter text-white tabular-nums drop-shadow-2xl leading-none"
              >
                {Math.floor(progress)}
              </motion.span>
              <div className="absolute -top-4 -right-8 text-4xl font-black text-neon opacity-40 italic">%</div>
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-neon/40 to-transparent"></div>
              <span className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.5em]">{forensicSteps[currentStep].subtext}</span>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="w-full lg:w-[450px] space-y-16">
          <div className="space-y-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-neon border border-white/10">
                <div className="w-4 h-4 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.6em]">Protocol sequence</span>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Neural Interrogation</h3>
              </div>
            </div>

            <div className="space-y-8">
              {forensicSteps.map((step, idx) => (
                <div key={step.id} className="relative group">
                  <div className={`flex items-start gap-8 transition-all duration-700 ${idx === currentStep ? 'translate-x-4' : idx < currentStep ? 'opacity-40 scale-95' : 'opacity-10'}`}>
                    <div className="pt-2">
                      <div className={`w-5 h-5 rotate-45 border-2 transition-all duration-700 ${idx < currentStep ? 'bg-neon border-neon shadow-neon' :
                          idx === currentStep ? 'bg-transparent border-neon shadow-[0_0_20px_rgba(0,255,156,0.5)]' : 'bg-transparent border-white/20'
                        }`}></div>
                    </div>

                    <div className="flex flex-col gap-2 flex-grow">
                      <div className="flex justify-between items-end">
                        <span className={`text-xl font-black italic uppercase tracking-tighter transition-colors ${idx === currentStep ? 'text-white' : 'text-white/40'}`}>
                          {step.label}
                        </span>
                        {idx === currentStep && (
                          <span className="text-[10px] font-mono font-black text-neon animate-pulse uppercase tracking-widest">Active_Probe</span>
                        )}
                      </div>
                      <div className="h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden p-[2px]">
                        <AnimatePresence>
                          {idx === currentStep && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              className="h-full bg-neon rounded-full"
                              transition={{ duration: 100 / forensicSteps.length / 0.4 * 0.06, repeat: Infinity, ease: "linear" }}
                            />
                          )}
                          {idx < currentStep && <div className="h-full w-full bg-neon/40 rounded-full"></div>}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">System Health</span>
              <div className="flex items-center gap-4 text-xs font-mono italic">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-emerald-500/50"></div>
                <span className="text-white/60">Node Integrity</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Signal Flux</span>
              <div className="flex items-center gap-4 text-xs font-mono italic">
                <div className="w-2 h-2 bg-neon rounded-full animate-pulse shadow-neon"></div>
                <span className="text-white/60">Stable Link</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
